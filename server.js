/**
 * OpenTube — YouTube-like video platform.
 * Sources: YouTube catalog (via open Piped API instances), Dailymotion, Internet Archive.
 * Zero-dependency Node.js server: static files + API proxy + stream proxy (Range supported).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const ARCHIVE = 'https://archive.org';
const PUBLIC_DIR = path.join(__dirname, 'public');

const PIPED_INSTANCES = [
  'https://api.piped.private.coffee',
  'https://pipedapi.ducks.party',
  'https://pipedapi.adminforge.de',
  'https://api.piped.yt',
];

/* ---------------- tiny TTL cache ---------------- */
const cache = new Map();
const TTL = 10 * 60 * 1000;
function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.t > TTL) { cache.delete(key); return null; }
  return hit.v;
}
function cacheSet(key, v) {
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  cache.set(key, { t: Date.now(), v });
}

/* ---------------- helpers ---------------- */
function stripHtml(s) {
  return String(s || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}
function stripHtmlKeepLines(s) {
  return String(s || '')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}
function first(v) {
  if (Array.isArray(v)) return v[0] || '';
  return v || '';
}
function toArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}
function parseLength(len) {
  if (!len) return null;
  const s = String(len).trim();
  if (s.includes(':')) {
    const parts = s.split(':').map(parseFloat);
    let sec = 0;
    for (const p of parts) sec = sec * 60 + (isNaN(p) ? 0 : p);
    return Math.round(sec);
  }
  const n = parseFloat(s);
  return isNaN(n) ? null : Math.round(n);
}
function pickDefaultQuality(quals) {
  let idx = 0;
  for (let i = 0; i < quals.length; i++) {
    if (quals[i].height && quals[i].height <= 480) { idx = i; break; }
    if (!quals[i].height && quals[i].size < 300 * 1048576) { idx = i; break; }
  }
  return idx;
}

/* ---------------- Internet Archive ---------------- */
function normalizeItem(doc) {
  const desc = stripHtml(first(doc.description)).slice(0, 220);
  return {
    source: 'ia', kind: 'video',
    id: doc.identifier,
    title: first(doc.title) || doc.identifier,
    creator: first(doc.creator) || '',
    date: first(doc.date) || first(doc.publicdate) || '',
    downloads: doc.downloads ?? null,
    views: doc.downloads ?? null,
    rating: doc.avg_rating ?? null,
    desc,
    subjects: toArray(doc.subject).slice(0, 8),
    thumb: '/img/' + doc.identifier,
    duration: null,
  };
}
function normalizeMeta(json, id, extra) {
  const md = json.metadata || {};
  const files = json.files || [];

  const videoRe = /\.(mp4|m4v|webm|ogv|mov)$/i;
  const fmtRe = /(h\.?264|mpeg4|webm|matroska|quicktime|theora|ogg\s*video)/i;
  const videos = files.filter(f =>
    (f.name && videoRe.test(f.name) && fmtRe.test(f.format || '')) ||
    (f.name && /\.(mp4|m4v|webm)$/i.test(f.name))
  );
  const qualities = videos.map(f => {
    const fmt = f.format || '';
    const name = f.name || '';
    let label = null;
    const hm = fmt.match(/(\d+)\s*kb/i);
    const px = parseInt(f.height, 10);
    if (px) label = px + 'p';
    else if (hm) label = hm[1] + ' kbps';
    else label = fmt.replace(/512Kb\s*/i, '').trim() || 'SD';
    let pref = 1;
    if (/\.(mp4|m4v)$/i.test(name) || /mpeg4|h\.?264/i.test(fmt)) pref = 3;
    else if (/\.webm$/i.test(name) || /webm|matroska/i.test(fmt)) pref = 2;
    return {
      label,
      url: '/stream/' + id + '/' + name.split('/').map(encodeURIComponent).join('/'),
      size: parseInt(f.size, 10) || 0,
      height: px || 0,
      format: fmt,
      pref,
    };
  });
  qualities.sort((a, b) => (b.height - a.height) || (b.pref - a.pref) || (a.size - b.size));

  const seen = new Set();
  const uniq = [];
  for (const q of qualities) {
    if (seen.has(q.label)) continue;
    seen.add(q.label);
    uniq.push(q);
  }

  let duration = null;
  for (const f of files) { if (f.length) { duration = parseLength(f.length); break; } }

  const subs = files
    .filter(f => /\.(vtt|srt)$/i.test(f.name || ''))
    .map(f => ({
      name: f.name,
      label: (f.name.replace(/\.(vtt|srt)$/i, '').split(/[-_.]/).pop() || 'sub').toUpperCase(),
      url: '/subs/' + id + '/' + f.name.split('/').map(encodeURIComponent).join('/'),
    }));

  const reviews = toArray(json.reviews).map(r => ({
    user: r.reviewcreator || 'Anonymous',
    stars: parseFloat(r.stars) || null,
    date: r.createdate || '',
    title: r.reviewtitle || '',
    text: stripHtml(r.reviewbody || '').slice(0, 1200),
  }));

  return {
    source: 'ia', kind: 'video',
    id,
    title: first(md.title) || id,
    creator: first(md.creator) || first(md.author) || '',
    date: first(md.date) || first(md.publicdate) || '',
    description: stripHtml(first(md.description)).slice(0, 4000),
    subjects: toArray(md.subject).slice(0, 14),
    thumb: '/img/' + id,
    duration,
    qualities: uniq,
    defaultQuality: pickDefaultQuality(uniq),
    subtitles: subs,
    reviews,
    downloads: extra?.downloads ?? null,
    views: extra?.downloads ?? null,
    rating: extra?.avg_rating ?? null,
    related: [],
  };
}

/* ---------------- Piped (YouTube) ---------------- */
const BROWSER_UA = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
async function fetchWithTimeout(url, ua, ms) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), ms || 15000);
  try {
    return await fetch(url, { headers: { 'user-agent': ua }, redirect: 'follow', signal: ac.signal });
  } finally { clearTimeout(timer); }
}
async function pipedGet(pathname) {
  const key = 'p|' + pathname;
  const cached = cacheGet(key);
  if (cached) return cached;
  let lastErr;
  for (const base of PIPED_INSTANCES) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetchWithTimeout(base + pathname, attempt ? BROWSER_UA : 'OpenTube/1.0');
        if (!r.ok) { lastErr = new Error('Piped HTTP ' + r.status); break; }
        const j = await r.json();
        if (j && j.error) { lastErr = new Error(String(j.error)); break; }
        cacheSet(key, j);
        return j;
      } catch (e) { lastErr = e; }
    }
  }
  throw lastErr || new Error('No Piped instance available');
}
function ytVideoId(url) {
  const m = String(url || '').match(/[?&]v=([\w-]{11})/);
  return m ? m[1] : '';
}
function ytChannelId(url) {
  const m = String(url || '').match(/\/channel\/([\w-]+)/);
  return m ? m[1] : '';
}
function ytPlaylistId(url) {
  const m = String(url || '').match(/[?&]list=([\w-]+)/);
  return m ? m[1] : '';
}
function normYtItem(it) {
  const kind = it.type === 'stream' ? 'video' : (it.type || 'video');
  let id = '';
  if (kind === 'channel') id = ytChannelId(it.url) || ytChannelId(it.uploaderUrl);
  else if (kind === 'playlist') id = ytPlaylistId(it.url);
  else id = ytVideoId(it.url);
  return {
    source: 'yt', kind, id,
    title: it.title || it.name || '',
    creator: it.uploaderName || it.name || '',
    creatorId: ytChannelId(it.uploaderUrl),
    thumb: it.thumbnail || it.uploaderAvatar || '',
    duration: it.duration > 0 ? it.duration : null,
    views: it.views > 0 ? it.views : null,
    subscribers: (it.subscriberCount != null && it.subscriberCount >= 0) ? it.subscriberCount : null,
    verified: !!it.verified,
    desc: stripHtml(it.shortDescription || '').slice(0, 180),
    date: it.uploadedDate || it.uploadDate || '',
  };
}
function normYtStreams(d, id) {
  const muxed = (d.videoStreams || []).filter(s =>
    !s.videoOnly && (
      (s.mimeType || '').includes('mp4') ||
      ['MPEG_4', 'MP4'].includes(s.format) ||
      (s.quality || '').toLowerCase() === 'lbry'
    )
  );
    const seen = new Set();
  const qualities = [];
  for (const s of muxed) {
    let label = s.quality || 'SD';
    if (label.toLowerCase() === 'lbry') label = 'HD (mirror)';
    if (seen.has(label)) continue;
    seen.add(label);
    const size = parseInt(s.contentLength, 10) || 0;
    qualities.push({
      label,
      url: '/sproxy?u=' + encodeURIComponent(s.url) + (size ? '&size=' + size : ''),
      size,
      height: parseInt(s.quality, 10) || 0,
    });
  }
  qualities.sort((a, b) => b.height - a.height);

  return {
    source: 'yt', kind: 'video', id,
    title: d.title || '',
    creator: d.uploader || '',
    creatorId: ytChannelId(d.uploaderUrl),
    creatorAvatar: d.uploaderAvatar || '',
    subscribers: d.uploaderSubscriberCount ?? null,
    verified: !!d.uploaderVerified,
    views: d.views > 0 ? d.views : null,
    likes: d.likes > 0 ? d.likes : null,
    date: d.uploadDate || '',
    duration: d.duration > 0 ? d.duration : null,
    description: stripHtmlKeepLines(d.description || '').slice(0, 5000),
    thumb: d.thumbnailUrl || '',
    qualities,
    defaultQuality: pickDefaultQuality(qualities),
    subtitles: (d.subtitles || []).map(s => ({
      label: (s.code || 'sub') + (s.autoGenerated ? ' (auto)' : ''),
      url: '/sproxy?u=' + encodeURIComponent(s.url),
    })),
    reviews: [],
    related: (d.relatedStreams || []).filter(r => r.type === 'stream').map(normYtItem),
  };
}

/* ---------------- yt-dlp extraction (direct streams, full quality ladder) ---------------- */
const { execFile, execSync, spawn } = require('child_process');
function findFfmpeg() {
  try {
    const p = execSync('python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"', { encoding: 'utf8' }).trim();
    if (p && fs.existsSync(p)) return p;
  } catch (_) {}
  return 'ffmpeg';
}
const FFMPEG = findFfmpeg();

async function apiYtDebug(req, res, params) {
  const variant = params.get('client') || '';
  const vid = (params.get('vid') || 'dQw4w9WgXcQ').replace(/[^\w-]/g, '');
  const { execFile } = require('child_process');
  const out = { variant: variant || '(default)', vid };
  await new Promise((resolve) => {
    const r = http.get('http://127.0.0.1:4416/ping', (pr) => {
      let b = ''; pr.on('data', (c) => b += c);
      pr.on('end', () => { out.provider = b.slice(0, 200); resolve(); });
    });
    r.on('error', (e) => { out.provider = 'DOWN: ' + e.message; resolve(); });
  });
  await new Promise((resolve) => {
    execFile('yt-dlp', ['-v', '--version'], { timeout: 15000 }, (e, so, se) => {
      out.ytdlp = String(so).trim();
      out.poLine = (String(se).split('\n').find((l) => l.includes('PO Token')) || '(no PO line)').trim();
      resolve();
    });
  });
  await new Promise((resolve) => {
    const args = ['-j', '-v', '--no-playlist', '--socket-timeout', '15'];
    if (variant) args.push('--extractor-args', 'youtube:player-client=' + variant);
    args.push('https://www.youtube.com/watch?v=' + vid);
    const t0 = Date.now();
    execFile('yt-dlp', args, { timeout: 75000 }, (e, so, se) => {
      out.tookMs = Date.now() - t0;
      if (e) {
        out.ok = false;
        out.error = String(e.message).slice(0, 200);
        const sl = String(se).split('\n').filter((l) => l.trim());
        out.poLine = (sl.find((l) => l.includes('PO Token Providers')) || out.poLine).trim();
        out.stderr = (sl.slice(0, 6).concat(sl.slice(-12))).join(' | ').slice(0, 1200);
      } else {
        try {
          const j = JSON.parse(so.split('\n')[0] || '{}');
          out.ok = true;
          out.title = j.title;
          out.formats = (j.formats || []).length;
          out.maxH = Math.max(0, ...(j.formats || []).map((f) => f.height || 0));
        } catch (pe) { out.ok = false; out.parseError = String(pe); out.head = String(so).slice(0, 200); }
      }
      resolve();
    });
  });
  await new Promise((resolve) => {
    execFile('sh', ['-c', 'ls -la /opt/bgutil/server/build 2>&1 | head -6; echo ---NODE_MODULES---; ls /opt/bgutil/server/node_modules 2>/dev/null | head -8; echo ---PS---; ps aux | grep -i node | grep -v grep; echo ---PIP---; pip3 show bgutil-ytdlp-pot-provider 2>/dev/null | head -3'], { timeout: 15000 }, (e, so) => { out.files = String(so).slice(0, 1500); resolve(); });
  });
  return sendJSON(res, 200, out);
}

function dlpJson(id) {
  const key = 'dlp|' + id;
  const c = cacheGet(key);
  if (c) return Promise.resolve(c);
  return new Promise((resolve, reject) => {
    const args = ['-j', '--no-warnings', '--no-playlist', '--socket-timeout', '15'];
    const extra = (process.env.YTDLP_ARGS || '').trim();
    if (extra) args.push(...extra.split(' '));
    args.push('https://www.youtube.com/watch?v=' + id);
    execFile('yt-dlp', args, { timeout: 90000 }, (err, stdout) => {
      if (err) return reject(err);
      try {
        const j = JSON.parse(stdout);
        cacheSet(key, j);
        resolve(j);
      } catch (e) { reject(e); }
    });
  });
}

function normDlpStreams(d, id) {
  const fmts = d.formats || [];
  const vids = fmts.filter(f => f.url && f.protocol === 'https' && /^avc1/.test(f.vcodec || '') && f.height);
  const auds = fmts.filter(f => f.url && f.protocol === 'https' && /^mp4a/.test(f.acodec || ''));
  if (!vids.length || !auds.length) return null;
  auds.sort((a, b) => (b.abr || 0) - (a.abr || 0));
  const bestAudio = auds[0];
  const byH = new Map();
  for (const f of vids) {
    const cur = byH.get(f.height);
    const sz = f.filesize || f.filesize_approx || 0;
    const curSz = cur ? (cur.filesize || cur.filesize_approx || 0) : -1;
    if (!cur || sz > curSz) byH.set(f.height, f);
  }
  const qualities = [...byH.entries()].sort((a, b) => b[0] - a[0]).map(([h, f]) => ({
    label: h + 'p',
    url: '/api/yt/hybrid?vid=' + encodeURIComponent(id) + '&h=' + h,
    size: (f.filesize || f.filesize_approx || 0) + (bestAudio.filesize || bestAudio.filesize_approx || 0),
    height: h,
  }));
  return {
    source: 'yt', kind: 'video', id,
    title: d.title || '',
    creator: d.uploader || '',
    creatorId: d.channel_id || '',
    creatorAvatar: '',
    subscribers: null,
    verified: false,
    views: d.view_count > 0 ? d.view_count : null,
    likes: d.like_count > 0 ? d.like_count : null,
    date: d.upload_date ? String(d.upload_date).replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3') : '',
    duration: d.duration > 0 ? d.duration : null,
    description: stripHtmlKeepLines(d.description || '').slice(0, 5000),
    thumb: '/sproxy?u=' + encodeURIComponent(d.thumbnail || ('https://i.ytimg.com/vi/' + id + '/hqdefault.jpg')),
    qualities,
    defaultQuality: pickDefaultQuality(qualities),
    subtitles: [],
    reviews: [],
    related: [],
  };
}

/* ---------------- hybrid remux: video-only + audio -> single seekable mp4 ---------------- */
const HB_DIR = '/tmp/othyb';
try { fs.mkdirSync(HB_DIR, { recursive: true }); } catch (_) {}
const hbJobs = new Map();

async function dlpPick(vid, h) {
  const d = await dlpJson(vid);
  const fmts = d.formats || [];
  const vids = fmts.filter(f => f.url && f.protocol === 'https' && /^avc1/.test(f.vcodec || '') && f.height);
  const auds = fmts.filter(f => f.url && f.protocol === 'https' && /^mp4a/.test(f.acodec || ''));
  if (!vids.length || !auds.length) throw new Error('no remuxable formats');
  vids.sort((a, b) => a.height - b.height);
  const v = vids.find(f => f.height === h) || [...vids].reverse().find(f => f.height <= h) || vids[0];
  auds.sort((a, b) => (b.abr || 0) - (a.abr || 0));
  return { v: v.url, a: auds[0].url };
}

function startHybridJob(key, vUrl, aUrl) {
  const existing = hbJobs.get(key);
  if (existing) return existing;
  const part = path.join(HB_DIR, key + '.part');
  const fin = path.join(HB_DIR, key + '.mp4');
  const job = { done: false, failed: false, part, fin };
  hbJobs.set(key, job);
  // pass 1: fMP4 to .part (streamable while writing)
  const p = spawn(FFMPEG, ['-y', '-i', vUrl, '-i', aUrl,
    '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy',
    '-movflags', 'frag_keyframe+empty_moov+default_base_moof', '-f', 'mp4', part]);
  p.on('exit', (code) => {
    if (code !== 0 || !fs.existsSync(part)) { job.failed = true; job.done = true; return; }
    // pass 2: quick local remux -> faststart mp4 (seekable)
    const p2 = spawn(FFMPEG, ['-y', '-i', part, '-c', 'copy', '-movflags', '+faststart', fin]);
    p2.on('exit', (c2) => {
      job.done = true;
      if (c2 === 0) { try { fs.unlinkSync(part); } catch (_) {} }
      else { try { fs.renameSync(part, fin); } catch (_) {} }
    });
    p2.on('error', () => { job.done = true; try { fs.renameSync(part, fin); } catch (_) {} });
  });
  p.on('error', () => { job.failed = true; job.done = true; });
  return job;
}

function sendFileRange(req, res, file) {
  const st = fs.statSync(file);
  const size = st.size;
  const rng = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
  const out = {
    'content-type': 'video/mp4', 'accept-ranges': 'bytes',
    'cache-control': 'public, max-age=86400', 'access-control-allow-origin': '*',
  };
  if (rng && rng[1] !== undefined) {
    const start = parseInt(rng[1], 10);
    const end = rng[2] ? Math.min(parseInt(rng[2], 10), size - 1) : size - 1;
    if (start >= size) { res.writeHead(416, { 'content-range': `bytes */${size}` }); return res.end(); }
    out['content-range'] = `bytes ${start}-${end}/${size}`;
    out['content-length'] = String(end - start + 1);
    res.writeHead(206, out);
    fs.createReadStream(file, { start, end }).pipe(res);
  } else {
    out['content-length'] = String(size);
    res.writeHead(200, out);
    fs.createReadStream(file).pipe(res);
  }
}

function streamGrowing(file, res, isDone) {
  res.writeHead(200, {
    'content-type': 'video/mp4', 'accept-ranges': 'none',
    'cache-control': 'no-store', 'access-control-allow-origin': '*',
  });
  let offset = 0, timer = null, closed = false;
  res.on('close', () => { closed = true; if (timer) clearTimeout(timer); });
  function pump() {
    if (closed) return;
    let st; try { st = fs.statSync(file); } catch (_) { st = { size: 0 }; }
    if (st.size > offset) {
      const s = fs.createReadStream(file, { start: offset, end: st.size - 1 });
      offset = st.size;
      s.on('error', () => {});
      s.pipe(res, { end: false });
      s.on('end', () => { if (!closed) timer = setTimeout(pump, 150); });
    } else if (isDone()) {
      res.end();
    } else {
      timer = setTimeout(pump, 250);
    }
  }
  pump();
}

async function ytHybrid(req, res, params) {
  const vid = params.get('vid') || '';
  const h = parseInt(params.get('h') || '720', 10) || 720;
  if (!/^[\w-]{8,14}$/.test(vid)) { res.writeHead(400); return res.end('bad vid'); }
  const key = vid + '_' + h;
  const fin = path.join(HB_DIR, key + '.mp4');
  const part = path.join(HB_DIR, key + '.part');
  if (fs.existsSync(fin)) return sendFileRange(req, res, fin);
  let pick;
  try { pick = await dlpPick(vid, h); }
  catch (e) { res.writeHead(502); return res.end('extract failed: ' + e.message); }
  const job = startHybridJob(key, pick.v, pick.a);
  if (job.done && fs.existsSync(fin)) return sendFileRange(req, res, fin);
  if (job.failed && !fs.existsSync(part)) { res.writeHead(502); return res.end('remux failed'); }
  return streamGrowing(job.done ? fin : part, res, () => job.done || job.failed);
}

/* ---------------- Dailymotion ---------------- */
const DM_FIELDS = 'id,title,duration,views_total,likes_total,created_time,thumbnail_360_url,thumbnail_480_url,owner.screenname,owner.username';
function normDmItem(v) {
  return {
    source: 'dm', kind: 'video', id: v.id,
    title: v.title || '',
    creator: v['owner.screenname'] || v['owner.fullname'] || '',
    creatorId: v['owner.username'] || '',
    thumb: v.thumbnail_360_url || v.thumbnail_240_url || '',
    duration: v.duration || null,
    views: v.views_total ?? null,
    likes: v.likes_total ?? null,
    date: v.created_time ? new Date(v.created_time * 1000).toISOString() : '',
    desc: '',
  };
}
function normDmMeta(m, id) {
  const quals = [];
  for (const [k, arr] of Object.entries(m.qualities || {})) {
    for (const f of arr || []) {
      const type = String(f.type || '');
      if (type.includes('mp4') || type.includes('MPEG')) {
        quals.push({
          label: k === 'auto' ? 'auto' : k + 'p',
          url: '/sproxy?u=' + encodeURIComponent(f.url),
          size: 0,
          height: k === 'auto' ? 0 : (parseInt(k, 10) || 0),
        });
      }
    }
  }
  quals.sort((a, b) => b.height - a.height);
  return {
    source: 'dm', kind: 'video', id,
    title: m.title || '',
    creator: (m.owner && (m.owner.screenname || m.owner.username)) || '',
    creatorId: (m.owner && m.owner.username) || '',
    creatorAvatar: (m.owner && m.owner.avatar_720_url) || '',
    views: m.views_total ?? null,
    likes: m.likes_total ?? null,
    date: m.created_time ? new Date(m.created_time * 1000).toISOString() : '',
    duration: m.duration || null,
    description: stripHtml(m.description || '').slice(0, 4000),
    thumb: (m.posters && (m.posters['480'] || m.posters['240'])) || '',
    qualities: quals,
    defaultQuality: pickDefaultQuality(quals),
    subtitles: [],
    reviews: [],
    related: (m.related || []).map(normDmItem),
    embedUrl: quals.length ? null : `https://www.dailymotion.com/embed/video/${id}`,
  };
}

/* ---------------- HTTP plumbing ---------------- */
async function archiveGet(url) {
  return fetch(url, {
    headers: { 'user-agent': 'OpenTube/1.0 (educational demo)' },
    redirect: 'follow',
  });
}
function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=60',
  });
  res.end(body);
}
function sendErr(res, code, msg) { sendJSON(res, code, { error: msg }); }

/* ---------------- API: Internet Archive search ---------------- */
async function apiSearch(query, res) {
  const qRaw = (query.get('q') || '').trim();
  const creator = (query.get('creator') || '').trim();
  const page = Math.max(1, parseInt(query.get('page') || '1', 10) || 1);
  const rows = Math.min(48, Math.max(6, parseInt(query.get('rows') || '24', 10) || 24));
  const sort = query.get('sort') || 'relevance';

  let q;
  if (creator) q = `creator:("${creator.replace(/"/g, '\\"')}") AND mediatype:movies`;
  else if (qRaw) q = `(${qRaw}) AND mediatype:movies`;
  else q = 'mediatype:movies';

  const key = `s|${q}|${sort}|${page}|${rows}`;
  const cached = cacheGet(key);
  if (cached) return sendJSON(res, 200, cached);

  const params = new URLSearchParams();
  params.set('q', q);
  for (const f of ['identifier', 'title', 'creator', 'downloads', 'avg_rating', 'date', 'description', 'subject']) {
    params.append('fl[]', f);
  }
  params.set('rows', String(rows));
  params.set('page', String(page));
  params.set('output', 'json');
  const sortMap = {
    popular: 'downloads desc', trending: 'week desc', newest: 'date desc',
    rating: 'avg_rating desc', relevance: null,
  };
  const sortVal = sortMap[sort];
  if (sortVal) params.append('sort[]', sortVal);

  const r = await archiveGet(`${ARCHIVE}/advancedsearch.php?${params.toString()}`);
  if (!r.ok) throw new Error('archive search failed: ' + r.status);
  const data = await r.json();
  const docs = (data.response && data.response.docs) || [];
  const out = {
    total: data.response?.numFound ?? docs.length,
    page, rows,
    items: docs.map(normalizeItem),
  };
  cacheSet(key, out);
  sendJSON(res, 200, out);
}
async function apiMeta(id, res) {
  const key = 'm|' + id;
  const cached = cacheGet(key);
  if (cached) return sendJSON(res, 200, cached);

  const [metaRes, statRes] = await Promise.all([
    archiveGet(`${ARCHIVE}/metadata/${encodeURIComponent(id)}`),
    (() => {
      const sp = new URLSearchParams();
      sp.set('q', `identifier:("${id.replace(/"/g, '\\"')}")`);
      sp.append('fl[]', 'identifier');
      sp.append('fl[]', 'downloads');
      sp.append('fl[]', 'avg_rating');
      sp.set('rows', '1');
      sp.set('output', 'json');
      return archiveGet(`${ARCHIVE}/advancedsearch.php?${sp.toString()}`);
    })(),
  ]);
  if (!metaRes.ok) throw new Error('archive metadata failed: ' + metaRes.status);
  const json = await metaRes.json();
  let extra = null;
  try {
    const s = await statRes.json();
    extra = (s.response?.docs || [])[0] || null;
  } catch (_) {}
  const out = normalizeMeta(json, id, extra);
  cacheSet(key, out);
  sendJSON(res, 200, out);
}

/* ---------------- API: YouTube (Piped) ---------------- */
async function apiYtSearch(query, res) {
  const q = (query.get('q') || '').trim();
  const filter = query.get('filter') || 'videos';
  const page = Math.max(1, parseInt(query.get('page') || '1', 10) || 1);
  const d = await pipedGet(`/search?q=${encodeURIComponent(q)}&filter=${encodeURIComponent(filter)}`);
  const items = (d.items || []).map(normYtItem);
  sendJSON(res, 200, {
    total: items.length,
    page, rows: items.length,
    items: page > 1 ? [] : items,
  });
}
async function apiYtStreams(id, res) {
  // 1) yt-dlp primary: direct streams + full quality ladder (360p–1080p hybrid)
  let dlp = null;
  try { dlp = await dlpJson(id); } catch (_) {}
  if (dlp) {
    const payload = normDlpStreams(dlp, id);
    if (payload) {
      try {
        const s = await pipedGet('/search?q=' + encodeURIComponent((payload.title || id).slice(0, 80)) + '&filter=videos');
        payload.related = (s.items || []).filter(x => x.type === 'stream' && ytVideoId(x.url) !== id).map(normYtItem).slice(0, 12);
      } catch (_) {}
      return sendJSON(res, 200, payload);
    }
  }
  // 2) Piped fallback (proxied muxed streams)
  try {
    const d = await pipedGet(`/streams/${encodeURIComponent(id)}`);
    return sendJSON(res, 200, normYtStreams(d, id));
  } catch (e) {
    // stream extraction failed — recover the title via search so the UI can offer the same video from other sources
    let hint = { title: '', creator: '', thumb: '' };
    try {
      const s = await pipedGet(`/search?q=${encodeURIComponent(id)}&filter=videos`);
      const hit = (s.items || []).find(x => ytVideoId(x.url) === id) || (s.items || [])[0];
      if (hit) {
        const n = normYtItem(hit);
        hint = { title: n.title, creator: n.creator, thumb: n.thumb, creatorId: n.creatorId };
      }
    } catch (_) {}
    sendJSON(res, 200, {
      source: 'yt', kind: 'video', id,
      unavailable: true, reason: String(e.message || 'extract failed'),
      ...hint,
      qualities: [], subtitles: [], reviews: [], related: [],
    });
  }
}
async function apiYtChannel(id, res) {
  const d = await pipedGet(`/channel/${encodeURIComponent(id)}`);
  let videos = (d.relatedStreams || []).filter(x => x.type === 'stream').map(normYtItem);
  // fallback: search by channel name (Piped channel tabs are flaky)
  if (!videos.length && d.name) {
    try {
      const s = await pipedGet(`/search?q=${encodeURIComponent(d.name)}&filter=videos`);
      videos = (s.items || []).filter(x => x.type === 'stream').map(normYtItem);
    } catch (_) {}
  }
  sendJSON(res, 200, {
    id,
    name: d.name || id,
    avatar: d.avatarUrl || '',
    banner: d.bannerUrl || '',
    subscribers: d.subscriberCount ?? null,
    verified: !!d.verified,
    description: stripHtmlKeepLines(d.description || '').slice(0, 1500),
    videos,
  });
}
async function apiYtPlaylist(id, res) {
  const d = await pipedGet(`/playlists/${encodeURIComponent(id)}`);
  sendJSON(res, 200, {
    id,
    name: d.name || 'Playlist',
    thumbnail: d.thumbnailUrl || '',
    videos: (d.relatedStreams || []).filter(x => x.type === 'stream').map(normYtItem),
  });
}
async function apiYtTrending(query, res) {
  const region = (query.get('region') || 'US').toUpperCase();
  let d;
  try {
    d = await pipedGet(`/trending?region=${region}`);
  } catch (e) {
    d = await pipedGet(`/trending?region=US`);
  }
  const items = (Array.isArray(d) ? d : []).filter(x => x.type === 'stream').map(normYtItem);
  sendJSON(res, 200, { total: items.length, page: 1, rows: items.length, items });
}

/* ---------------- API: Dailymotion ---------------- */
async function apiDmSearch(query, res) {
  const q = (query.get('q') || '').trim();
  const page = Math.max(1, parseInt(query.get('page') || '1', 10) || 1);
  const limit = 24;
  const url = `https://api.dailymotion.com/videos?search=${encodeURIComponent(q)}&limit=${limit}&page=${page}&fields=${DM_FIELDS}&sort=relevance`;
  const r = await fetch(url, { headers: { 'user-agent': 'OpenTube/1.0' } });
  if (!r.ok) throw new Error('Dailymotion HTTP ' + r.status);
  const d = await r.json();
  const items = (d.list || []).map(normDmItem);
  sendJSON(res, 200, { total: d.total ?? items.length, page, rows: limit, items, hasMore: !!d.has_more });
}
async function apiDmMeta(id, res) {
  const r = await fetch(`https://www.dailymotion.com/player/metadata/video/${encodeURIComponent(id)}`, {
    headers: { 'user-agent': 'OpenTube/1.0', referer: 'https://www.dailymotion.com/' },
    redirect: 'follow',
  });
  if (!r.ok) throw new Error('Dailymotion metadata HTTP ' + r.status);
  const m = await r.json();
  if (m.error) throw new Error(m.error.title || 'Dailymotion error');
  sendJSON(res, 200, normDmMeta(m, id));
}
async function apiDmUser(username, res) {
  const r = await fetch(`https://api.dailymotion.com/user/${encodeURIComponent(username)}/videos?limit=24&fields=${DM_FIELDS}`, {
    headers: { 'user-agent': 'OpenTube/1.0' },
  });
  if (!r.ok) throw new Error('Dailymotion user HTTP ' + r.status);
  const d = await r.json();
  sendJSON(res, 200, {
    id: username, name: username, avatar: '', banner: '',
    subscribers: null, verified: false, description: '',
    videos: (d.list || []).map(normDmItem),
  });
}

/* ---------------- generic media proxy (Range) ---------------- */
function proxyAllowed(u) {
  try {
    const url = new URL(u);
    if (url.protocol !== 'https:') return false;
    const h = url.hostname.toLowerCase();
    return /piped/.test(h) ||
      /(^|\.)odycdn\.com$/.test(h) ||
      /(^|\.)dmcdn\.net$/.test(h) ||
      /(^|\.)dailymotion\.com$/.test(h) ||
      /\.akamaized\.net$/.test(h) ||
      /(^|\.)googlevideo\.com$/.test(h) ||
      /(^|\.)ytimg\.com$/.test(h) ||
      /(^|\.)ggpht\.com$/.test(h) ||
      /(^|\.)archive\.org$/.test(h);
  } catch (_) { return false; }
}
function ttmlToVtt(xml) {
  const ts = (s) => {
    s = String(s).trim();
    if (s.endsWith('s')) {
      const n = parseFloat(s);
      return isNaN(n) ? '00:00:00.000' : new Date(n * 1000).toISOString().substr(11, 12);
    }
    const p = s.split(':');
    let sec = 0;
    for (const x of p) sec = sec * 60 + (parseFloat(x) || 0);
    return new Date(sec * 1000).toISOString().substr(11, 12);
  };
  let out = 'WEBVTT\n\n';
  const re = /<p[^>]*\bbegin="([^"]+)"[^>]*\bend="([^"]+)"[^>]*>([\s\S]*?)<\/p>/g;
  let m, i = 0;
  while ((m = re.exec(xml))) {
    const text = m[3].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
    if (!text) continue;
    out += `${++i}\n${ts(m[1])} --> ${ts(m[2])}\n${text}\n\n`;
  }
  return out;
}
const sizeCache = new Map();
async function probeSize(u, baseHeaders) {
  if (sizeCache.has(u)) return sizeCache.get(u);
  try {
    const r = await fetch(u, {
      headers: { ...baseHeaders, range: 'bytes=0-' },
      redirect: 'follow',
    });
    let size = parseInt(r.headers.get('content-length') || '0', 10) || 0;
    const m = /\/(\d+)\s*$/.exec(r.headers.get('content-range') || '');
    if (m) size = Math.max(size, parseInt(m[1], 10));
    if (r.body) await r.body.cancel().catch(() => {});
    if (size > 0) { sizeCache.set(u, size); return size; }
  } catch (_) {}
  return 0;
}
async function sproxy(req, res) {
  const sp = new URL(req.url, 'http://x').searchParams;
  const u = sp.get('u') || '';
  const sizeHint = parseInt(sp.get('size') || '0', 10) || 0;
  if (!proxyAllowed(u)) { res.writeHead(403); return res.end('blocked host'); }
  const baseHeaders = { 'user-agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36' };

  const clientRange = req.headers.range || '';
  const rng = /bytes=(\d+)-(\d*)/.exec(clientRange);
  let size = sizeHint > 0 ? sizeHint : 0;
  if (rng && !size) size = await probeSize(u, baseHeaders);

  // rewrite open-ended ranges to bounded ones (Piped proxies ignore "bytes=N-")
  const headers = { ...baseHeaders };
  if (rng && size > 0) {
    const start = parseInt(rng[1], 10);
    const end = rng[2] ? Math.min(parseInt(rng[2], 10), size - 1) : size - 1;
    headers.range = `bytes=${start}-${end}`;
  } else if (clientRange) {
    headers.range = clientRange;
  }

  const r = await fetch(u, { headers, redirect: 'follow' });
  const ct = r.headers.get('content-type') || 'video/mp4';

  // subtitle track: convert TTML/XML to WebVTT on the fly
  if (/xml|ttml/i.test(ct) || /timedtext|caption/i.test(u)) {
    const text = await r.text();
    const vtt = /^WEBVTT/.test(text.trim()) ? text : ttmlToVtt(text);
    res.writeHead(200, {
      'content-type': 'text/vtt; charset=utf-8',
      'cache-control': 'public, max-age=86400',
      'access-control-allow-origin': '*',
    });
    return res.end(vtt);
  }

  const out = {
    'accept-ranges': 'bytes',
    'content-type': ct,
    'cache-control': 'public, max-age=3600',
    'access-control-allow-origin': '*',
  };

  if (rng && size > 0 && r.status !== 416) {
    const start = parseInt(rng[1], 10);
    const end = rng[2] ? Math.min(parseInt(rng[2], 10), size - 1) : size - 1;
    out['content-range'] = `bytes ${start}-${end}/${size}`;
    out['content-length'] = String(end - start + 1);
    res.writeHead(206, out);
    if (r.body) Readable.fromWeb(r.body).pipe(res); else res.end();
    return;
  }
  if (size > 0 && r.status === 200) {
    out['content-length'] = String(size);
    res.writeHead(200, out);
    if (r.body) Readable.fromWeb(r.body).pipe(res); else res.end();
    return;
  }
  for (const h of ['content-length', 'content-range']) {
    const v = r.headers.get(h);
    if (v) out[h] = v;
  }
  res.writeHead(r.status, out);
  if (r.body) Readable.fromWeb(r.body).pipe(res); else res.end();
}

/* ---------------- image + subtitle + IA stream proxies ---------------- */
async function imgProxy(id, res) {
  const r = await archiveGet(`${ARCHIVE}/services/img/${encodeURIComponent(id)}`);
  const ct = r.headers.get('content-type') || 'image/jpeg';
  res.writeHead(r.ok ? 200 : 404, {
    'content-type': ct.startsWith('image/') ? ct : 'image/jpeg',
    'cache-control': 'public, max-age=86400',
  });
  if (r.body) Readable.fromWeb(r.body).pipe(res); else res.end();
}
async function subsProxy(id, file, res) {
  const safe = file.split('/').map(encodeURIComponent).join('/');
  const r = await archiveGet(`${ARCHIVE}/download/${encodeURIComponent(id)}/${safe}`);
  if (!r.ok) { res.writeHead(404); return res.end(); }
  let text = await r.text();
  if (/\.srt$/i.test(file)) {
    text = text.replace(/\r/g, '').replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    text = 'WEBVTT\n\n' + text;
  } else if (!/^WEBVTT/.test(text.trim())) {
    text = 'WEBVTT\n\n' + text;
  }
  res.writeHead(200, {
    'content-type': 'text/vtt; charset=utf-8',
    'cache-control': 'public, max-age=86400',
    'access-control-allow-origin': '*',
  });
  res.end(text);
}
async function streamProxy(req, res, id, rest) {
  const safe = rest.split('/').map(encodeURIComponent).join('/');
  const target = `${ARCHIVE}/download/${encodeURIComponent(id)}/${safe}`;
  const headers = { 'user-agent': 'OpenTube/1.0' };
  if (req.headers.range) headers.range = req.headers.range;

  const r = await fetch(target, { headers, redirect: 'follow' });
  const out = {
    'accept-ranges': 'bytes',
    'content-type': r.headers.get('content-type') || 'video/mp4',
    'cache-control': 'public, max-age=3600',
  };
  for (const h of ['content-length', 'content-range']) {
    const v = r.headers.get(h);
    if (v) out[h] = v;
  }
  res.writeHead(r.status, out);
  if (r.body) Readable.fromWeb(r.body).pipe(res); else res.end();
}

/* ---------------- static files ---------------- */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};
function serveStatic(req, res, pathname) {
  let p = pathname === '/' ? '/index.html' : pathname;
  const file = path.join(PUBLIC_DIR, path.normalize(p));
  if (!file.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) {
      return fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e2, b2) => {
        if (e2) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'content-type': MIME['.html'] });
        res.end(b2);
      });
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'public, max-age=120' });
    res.end(buf);
  });
}

/* ---------------- Supabase: auth + cloud data ---------------- */
let SB = null;
try {
  SB = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
  if (!SB.supabaseUrl || !SB.publishableKey) SB = null;
} catch (_) { SB = null; }

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (_) { resolve({}); } });
  });
}
function userToken(req) {
  const a = String(req.headers['authorization'] || '').trim();
  return a.toLowerCase().startsWith('bearer ') ? a.slice(7).trim() : '';
}
async function sbFetch(pathname, { method = 'GET', body, token, headers: extra } = {}) {
  if (!SB) throw new Error('Supabase not configured');
  const headers = {
    'apikey': SB.publishableKey,
    'Authorization': 'Bearer ' + (token || SB.publishableKey),
    'Content-Type': 'application/json',
    ...(extra || {}),
  };
  const r = await fetch(SB.supabaseUrl + pathname, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let data = null;
  try { data = JSON.parse(text); } catch (_) { data = text; }
  if (!r.ok) {
    const msg = (data && (data.msg || data.message || data.error_description || data.error)) || ('Supabase ' + r.status);
    const err = new Error(typeof msg === 'string' ? msg : 'Supabase error');
    err.status = r.status;
    throw err;
  }
  return data;
}
const userCache = new Map();
async function verifyUser(req) {
  const token = userToken(req);
  if (!token) return null;
  if (userCache.has(token)) return userCache.get(token);
  const u = await sbFetch('/auth/v1/user', { token });
  userCache.set(token, u);
  setTimeout(() => userCache.delete(token), 60000);
  return u;
}
function itemCols(item) {
  item = item || {};
  return {
    video_source: String(item.source || 'ia').slice(0, 10),
    video_id: String(item.id || '').slice(0, 200),
    title: String(item.title || '').slice(0, 300),
    thumb: String(item.thumb || '').slice(0, 600),
    creator: String(item.creator || '').slice(0, 200),
  };
}
function rowToItem(r) {
  return {
    source: r.video_source, id: r.video_id, title: r.title, thumb: r.thumb,
    creator: r.creator, kind: 'video',
    date: r.watched_at || r.created_at,
    ts: new Date(r.watched_at || r.created_at).getTime(),
  };
}
async function apiDbState(req, res) {
  const u = await verifyUser(req);
  if (!u) return sendErr(res, 401, 'Not signed in');
  const token = userToken(req);
  const uid = u.id;
  const [likes, wl, subs, hist] = await Promise.all([
    sbFetch(`/rest/v1/ot_likes?user_id=eq.${uid}&order=created_at.desc&limit=200`, { token }),
    sbFetch(`/rest/v1/ot_watch_later?user_id=eq.${uid}&order=created_at.desc&limit=200`, { token }),
    sbFetch(`/rest/v1/ot_subs?user_id=eq.${uid}&order=created_at.desc&limit=100`, { token }),
    sbFetch(`/rest/v1/ot_history?user_id=eq.${uid}&order=watched_at.desc&limit=100`, { token }),
  ]);
  return sendJSON(res, 200, {
    user: { id: u.id, email: u.email, name: (u.user_metadata && u.user_metadata.name) || '' },
    likes: (likes || []).map(rowToItem),
    watchLater: (wl || []).map(rowToItem),
    subs: (subs || []).map(r => ({ name: r.channel_key, key: r.channel_key, source: r.source, ts: new Date(r.created_at).getTime() })),
    history: (hist || []).map(rowToItem),
  });
}
async function apiDbToggle(req, res, table) {
  const u = await verifyUser(req);
  if (!u) return sendErr(res, 401, 'Not signed in');
  const token = userToken(req);
  const b = await readBody(req);
  const cols = { user_id: u.id, ...itemCols(b.item) };
  if (b.on) {
    await sbFetch(`/rest/v1/${table}`, {
      method: 'POST', token, body: cols,
      headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    });
  } else {
    await sbFetch(
      `/rest/v1/${table}?user_id=eq.${u.id}&video_source=eq.${cols.video_source}&video_id=eq.${encodeURIComponent(cols.video_id)}`,
      { method: 'DELETE', token }
    );
  }
  return sendJSON(res, 200, { ok: true, on: !!b.on });
}
async function apiDbHistory(req, res) {
  const u = await verifyUser(req);
  if (!u) return sendErr(res, 401, 'Not signed in');
  const b = await readBody(req);
  await sbFetch('/rest/v1/ot_history', {
    method: 'POST', token: userToken(req),
    body: { user_id: u.id, ...itemCols(b.item), watched_at: new Date().toISOString() },
    headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
  });
  return sendJSON(res, 200, { ok: true });
}
async function apiDbSub(req, res) {
  const u = await verifyUser(req);
  if (!u) return sendErr(res, 401, 'Not signed in');
  const token = userToken(req);
  const b = await readBody(req);
  const key = String(b.channel_key || b.channel_name || '').slice(0, 200);
  if (!key) return sendErr(res, 400, 'channel_key required');
  if (b.on) {
    await sbFetch('/rest/v1/ot_subs', {
      method: 'POST', token,
      body: { user_id: u.id, channel_key: key, channel_name: String(b.channel_name || key).slice(0, 200), source: String(b.source || 'yt').slice(0, 10) },
      headers: { 'Prefer': 'resolution=merge-duplicates,return=minimal' },
    });
  } else {
    await sbFetch(`/rest/v1/ot_subs?user_id=eq.${u.id}&channel_key=eq.${encodeURIComponent(key)}`, { method: 'DELETE', token });
  }
  return sendJSON(res, 200, { ok: true, on: !!b.on });
}
async function apiDbCommentsGet(req, res, query) {
  const source = (query.get('source') || 'ia').slice(0, 10);
  const id = (query.get('id') || '').slice(0, 200);
  const rows = await sbFetch(
    `/rest/v1/ot_comments?video_source=eq.${encodeURIComponent(source)}&video_id=eq.${encodeURIComponent(id)}&order=created_at.desc&limit=50`,
    { token: userToken(req) || undefined }
  );
  sendJSON(res, 200, {
    items: (rows || []).map(r => ({
      user: r.user_name || 'User', text: r.body, ts: new Date(r.created_at).getTime(), cloud: true,
    })),
  });
}
async function apiDbCommentPost(req, res) {
  const u = await verifyUser(req);
  if (!u) return sendErr(res, 401, 'Not signed in');
  const b = await readBody(req);
  const text = String(b.text || '').slice(0, 1000).trim();
  if (!text) return sendErr(res, 400, 'text required');
  const name = String(b.name || (u.user_metadata && u.user_metadata.name) || u.email || 'User').slice(0, 60);
  const row = {
    user_id: u.id, video_source: String(b.source || 'ia').slice(0, 10),
    video_id: String(b.id || '').slice(0, 200), user_name: name, body: text,
  };
  await sbFetch('/rest/v1/ot_comments', {
    method: 'POST', token: userToken(req), body: row,
    headers: { 'Prefer': 'return=representation' },
  });
  return sendJSON(res, 200, { ok: true, item: { user: name, text, ts: Date.now(), cloud: true } });
}

/* ---------------- server ---------------- */
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = u.pathname;
  try {
    if (p === '/api/config') {
      return sendJSON(res, 200, { mode: 'proxy', name: 'OpenTube', version: 3, sources: ['yt', 'dm', 'ia'], accounts: !!SB });
    }
    /* auth */
    if (p === '/api/auth/signup' && req.method === 'POST') {
      const b = await readBody(req);
      const data = await sbFetch('/auth/v1/signup', {
        method: 'POST',
        body: {
          email: String(b.email || '').trim(), password: String(b.password || ''),
          data: { name: String(b.name || '').slice(0, 60) || String(b.email || '').split('@')[0] },
        },
      });
      return sendJSON(res, 200, data);
    }
    if (p === '/api/auth/login' && req.method === 'POST') {
      const b = await readBody(req);
      const data = await sbFetch('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: { email: String(b.email || '').trim(), password: String(b.password || '') },
      });
      return sendJSON(res, 200, data);
    }
    if (p === '/api/auth/refresh' && req.method === 'POST') {
      const b = await readBody(req);
      const data = await sbFetch('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST', body: { refresh_token: String(b.refresh_token || '') },
      });
      return sendJSON(res, 200, data);
    }
    if (p === '/api/auth/logout' && req.method === 'POST') {
      const tok = userToken(req);
      if (tok) { try { await sbFetch('/auth/v1/logout', { method: 'POST', token: tok }); } catch (_) {} }
      return sendJSON(res, 200, { ok: true });
    }
    /* cloud data */
    if (p === '/api/db/state') return await apiDbState(req, res);
    if (p === '/api/db/like' && req.method === 'POST') return await apiDbToggle(req, res, 'ot_likes');
    if (p === '/api/db/watchlater' && req.method === 'POST') return await apiDbToggle(req, res, 'ot_watch_later');
    if (p === '/api/db/history' && req.method === 'POST') return await apiDbHistory(req, res);
    if (p === '/api/db/sub' && req.method === 'POST') return await apiDbSub(req, res);
    if (p === '/api/db/comments' && req.method === 'GET') return await apiDbCommentsGet(req, res, u.searchParams);
    if (p === '/api/db/comment' && req.method === 'POST') return await apiDbCommentPost(req, res);
    if (p === '/api/search') return await apiSearch(u.searchParams, res);
    if (p.startsWith('/api/meta/')) return await apiMeta(p.slice('/api/meta/'.length), res);
    if (p === '/api/yt/search') return await apiYtSearch(u.searchParams, res);
    if (p === '/api/yt/trending') return await apiYtTrending(u.searchParams, res);
    if (p.startsWith('/api/yt/streams/')) return await apiYtStreams(p.slice('/api/yt/streams/'.length), res);
    if (p === '/api/yt/debug') return await apiYtDebug(req, res, u.searchParams);
    if (p === '/api/yt/hybrid') return await ytHybrid(req, res, u.searchParams);
    if (p.startsWith('/api/yt/channel/')) return await apiYtChannel(p.slice('/api/yt/channel/'.length), res);
    if (p.startsWith('/api/yt/playlist/')) return await apiYtPlaylist(p.slice('/api/yt/playlist/'.length), res);
    if (p === '/api/dm/search') return await apiDmSearch(u.searchParams, res);
    if (p.startsWith('/api/dm/meta/')) return await apiDmMeta(p.slice('/api/dm/meta/'.length), res);
    if (p.startsWith('/api/dm/user/')) return await apiDmUser(p.slice('/api/dm/user/'.length), res);
    if (p === '/sproxy') return await sproxy(req, res);
    if (p.startsWith('/img/')) return await imgProxy(p.slice('/img/'.length), res);
    if (p.startsWith('/subs/')) {
      const rest = p.slice('/subs/'.length);
      const i = rest.indexOf('/');
      if (i < 0) { res.writeHead(400); return res.end(); }
      return await subsProxy(rest.slice(0, i), decodeURIComponent(rest.slice(i + 1)), res);
    }
    if (p.startsWith('/stream/')) {
      const rest = p.slice('/stream/'.length);
      const i = rest.indexOf('/');
      if (i < 0) { res.writeHead(400); return res.end(); }
      return await streamProxy(req, res, rest.slice(0, i), rest.slice(i + 1));
    }
    return serveStatic(req, res, p);
  } catch (e) {
    console.error('ERR', p, e.message);
    if (!res.headersSent) sendErr(res, 502, e.message || 'upstream error');
    else res.end();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`OpenTube running at http://${HOST}:${PORT}`);
});

// optional second port (e.g. preview port) sharing the same app
const PORT2 = parseInt(process.env.PORT2 || '0', 10);
if (PORT2 > 0 && PORT2 !== Number(PORT)) {
  const server2 = http.createServer((req, res) => server.emit('request', req, res));
  server2.listen(PORT2, HOST, () => {
    console.log(`OpenTube also running at http://${HOST}:${PORT2}`);
  });
}
