/* ================= OpenTube app (multi-source) ================= */
'use strict';

/* ---------- state ---------- */
const state = {
  lang: localStorage.getItem('ot_lang') || ((navigator.language || '').startsWith('bn') ? 'bn' : 'en'),
  theme: localStorage.getItem('ot_theme') || 'dark',
};

/* ---------- i18n ---------- */
const DICT = {
  bn: {
    searchPlaceholder: 'গান, ভিডিও, চ্যানেল খুঁজুন...',
    navHome: 'হোম', navTrending: 'ট্রেন্ডিং', navMovies: 'মুভি', navTv: 'টিভি সিরিজ',
    navMusic: 'মিউজিক', navCartoons: 'কার্টুন', navNews: 'নিউজ', navScience: 'সায়েন্স',
    navEdu: 'এডুকেশন', navTech: 'টেক', navBengali: 'বাংলা', navDocs: 'ডকুমেন্টারি',
    navNature: 'নেচার', navSports: 'স্পোর্টস', navClassics: 'ক্লাসিক',
    navHistory: 'হিস্ট্রি', navWatchLater: 'পরে দেখব', navLiked: 'পছন্দের', navSubs: 'সাবস্ক্রিপশন',
    loadPreparing: 'প্রস্তুত হচ্ছে...', loadBuffering: 'বাফার হচ্ছে...', qualitySwitched: 'নেটওয়ার্ক ধীর — কোয়ালিটি পরিবর্তন করা হলো',
    navSongs: 'গান 🎵', navYtTrending: 'YouTube ট্রেন্ডিং', navYtMusic: 'মিউজিক ভিডিও',
    hero: 'YouTube-এর সম্পূর্ণ ক্যাটালগ + ফ্রি মুভি ও ডকুমেন্টারি — গান, ভিডিও, চ্যানেল সব এক জায়গায়।',
    rowYtTrending: '🔥 YouTube ট্রেন্ডিং', rowSongs: '🎵 গান (Songs)', rowBanglaSongs: '🎶 বাংলা গান',
    rowYtMusic: '🎸 মিউজিক ভিডিও', rowBengali: '🇧🇩 আপনার জন্য বাংলা',
    rowClassics: '🎬 ক্লাসিক মুভি', rowCartoons: '🧒 কার্টুন ও অ্যানিমেশন',
    rowNasa: '🚀 NASA ও মহাকাশ', rowDocs: '🎥 ডকুমেন্টারি', rowNews: '📰 নিউজরিল ও ইতিহাস',
    seeAll: 'সব দেখুন', downloads: 'ডাউনলোড', views: 'ভিউ', likes: 'লাইক',
    like: 'পছন্দ', dislike: 'না-পছন্দ', save: 'সেভ', saved: 'সেভ হয়েছে',
    share: 'শেয়ার', copied: 'লিংক কপি হয়েছে!', subscribe: 'সাবস্ক্রাইব', subscribed: 'সাবস্ক্রাইবড',
    quality: 'কোয়ালিটি', download: 'ডাউনলোড', subtitles: 'সাবটাইটেল', none: 'নেই',
    comments: 'কমেন্ট', noComments: 'এখনো কোনো কমেন্ট নেই। প্রথম কমেন্টটি আপনিই দিন!',
    cName: 'আপনার নাম', cText: 'একটি কমেন্ট লিখুন...', post: 'পোস্ট',
    related: 'সম্পর্কিত ভিডিও', showMore: 'আরও দেখুন', showLess: 'কম দেখুন',
    loadMore: 'আরও ভিডিও লোড করুন', noResults: 'কোনো ভিডিও পাওয়া যায়নি',
    noResultsText: 'অন্য কিছু সার্চ করে দেখুন, অথবা ক্যাটাগরি থেকে ব্রাউজ করুন।',
    errorTitle: 'কিছু একটা সমস্যা হয়েছে', errorText: 'সার্ভারে সাথে সংযোগ করা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।',
    retry: 'আবার চেষ্টা করুন', sortLabel: 'সাজান',
    sortRelevance: 'প্রাসঙ্গিকতা', sortTrending: 'ট্রেন্ডিং', sortPopular: 'সবচেয়ে জনপ্রিয়',
    sortNewest: 'নতুন', sortRating: 'রেটিং',
    tabAll: 'সব', tabSongs: 'গান 🎵', tabYt: 'YouTube ▶', tabDm: 'Dailymotion', tabArchive: 'Archive 🎞',
    historyEmpty: 'আপনার দেখা ভিডিওগুলো এখানে দেখা যাবে।', watchLaterEmpty: 'পরে দেখার জন্য ভিডিও সেভ করুন।',
    likedEmpty: 'যে ভিডিওগুলো পছন্দ করবেন সেগুলো এখানে জমা হবে।', subsEmpty: 'কোনো চ্যানেল সাবস্ক্রাইব করা নেই।',
    emptyIcon: '🎬', titleHistory: 'দেখা ভিডিও', titleWatchLater: 'পরে দেখব',
    titleLiked: 'পছন্দের ভিডিও', titleSubs: 'সাবস্ক্রিপশন',
    agoNow: 'এইমাত্র', agoMin: 'মিনিট আগে', agoHour: 'ঘণ্টা আগে', agoDay: 'দিন আগে',
    agoWeek: 'সপ্তাহ আগে', agoMonth: 'মাস আগে', agoYear: 'বছর আগে',
    searchFor: 'সার্চ ফলাফল', channelTitle: 'চ্যানেল', playlistTitle: 'প্লেলিস্ট',
    noPlayable: 'এই ভিডিওটি এখন প্লে করা যাচ্ছে না', openArchive: 'Archive.org-এ দেখুন',
    videoUnavailable: 'ভিডিওটি এখন চালু করা যাচ্ছে না', altsTitle: 'অন্য সোর্সে একই ভিডিও/গান দেখুন',
    altsHint: 'সোর্সের সাময়িক সমস্যা — নিচের যেকোনো ভিডিওতে ট্যাপ করুন, সাথে সাথে চলবে।', searchEverywhere: 'সব জায়গায় খুঁজুন',
    you: 'আপনি', localComments: 'আপনার ডিভাইসে সংরক্ষিত', star: 'রেটিং',
    subscribers: 'সাবস্ক্রাইবার', verified: '✓ ভেরিফাইড', channelVideos: 'ভিডিও',
    signIn: 'সাইন ইন', signOut: 'সাইন আউট', authLogin: 'লগইন', authSignup: 'নতুন অ্যাকাউন্ট',
    authEmail: 'ইমেইল', authPassword: 'পাসওয়ার্ড (৬+ অক্ষর)', authName: 'আপনার নাম',
    authSubmitLogin: 'লগইন করুন', authSubmitSignup: 'অ্যাকাউন্ট খুলুন',
    authHint: 'লগইন করলে আপনার লাইক, কমেন্ট, হিস্ট্রি ও সাবস্ক্রিপশন সব ডিভাইসে সেভ থাকবে।',
    authWelcome: 'স্বাগতম', authErr: 'সমস্যা হয়েছে', cloudSaved: '☁️ ক্লাউডে সেভ হয়েছে',
    loginToComment: 'কমেন্ট করতে সাইন ইন করুন', noAccounts: 'অ্যাকাউন্ট সিস্টেম বন্ধ আছে',
  },
  en: {
    searchPlaceholder: 'Search songs, videos, channels...',
    navHome: 'Home', navTrending: 'Trending', navMovies: 'Movies', navTv: 'TV Series',
    navMusic: 'Music', navCartoons: 'Cartoons', navNews: 'News', navScience: 'Science',
    navEdu: 'Education', navTech: 'Tech', navBengali: 'Bengali', navDocs: 'Documentaries',
    navNature: 'Nature', navSports: 'Sports', navClassics: 'Classics',
    navHistory: 'History', navWatchLater: 'Watch later', navLiked: 'Liked', navSubs: 'Subscriptions',
    loadPreparing: 'Preparing...', loadBuffering: 'Buffering...', qualitySwitched: 'Slow network - quality switched',
    navSongs: 'Songs 🎵', navYtTrending: 'YouTube Trending', navYtMusic: 'Music Videos',
    hero: "YouTube's full catalog plus free movies & documentaries — songs, videos and channels, all in one place.",
    rowYtTrending: '🔥 YouTube Trending', rowSongs: '🎵 Songs', rowBanglaSongs: '🎶 Bengali songs',
    rowYtMusic: '🎸 Music videos', rowBengali: '🇧🇩 Bengali picks for you',
    rowClassics: '🎬 Classic movies', rowCartoons: '🧒 Cartoons & animation',
    rowNasa: '🚀 NASA & space', rowDocs: '🎥 Documentaries', rowNews: '📰 Newsreels & history',
    seeAll: 'See all', downloads: 'downloads', views: 'views', likes: 'likes',
    like: 'Like', dislike: 'Dislike', save: 'Save', saved: 'Saved',
    share: 'Share', copied: 'Link copied!', subscribe: 'Subscribe', subscribed: 'Subscribed',
    quality: 'Quality', download: 'Download', subtitles: 'Subtitles', none: 'None',
    comments: 'Comments', noComments: 'No comments yet. Be the first!',
    cName: 'Your name', cText: 'Write a comment...', post: 'Post',
    related: 'Related videos', showMore: 'Show more', showLess: 'Show less',
    loadMore: 'Load more videos', noResults: 'No videos found',
    noResultsText: 'Try a different search, or browse from the categories.',
    errorTitle: 'Something went wrong', errorText: 'Could not reach the server. Please try again in a moment.',
    retry: 'Try again', sortLabel: 'Sort by',
    sortRelevance: 'Relevance', sortTrending: 'Trending', sortPopular: 'Most popular',
    sortNewest: 'Newest', sortRating: 'Rating',
    tabAll: 'All', tabSongs: 'Songs 🎵', tabYt: 'YouTube ▶', tabDm: 'Dailymotion', tabArchive: 'Archive 🎞',
    historyEmpty: 'Videos you watch will show up here.', watchLaterEmpty: 'Save videos to watch later.',
    likedEmpty: 'Videos you like will be collected here.', subsEmpty: 'No subscriptions yet.',
    emptyIcon: '🎬', titleHistory: 'Watch history', titleWatchLater: 'Watch later',
    titleLiked: 'Liked videos', titleSubs: 'Subscriptions',
    agoNow: 'just now', agoMin: 'minutes ago', agoHour: 'hours ago', agoDay: 'days ago',
    agoWeek: 'weeks ago', agoMonth: 'months ago', agoYear: 'years ago',
    searchFor: 'Search results', channelTitle: 'Channel', playlistTitle: 'Playlist',
    noPlayable: 'This video cannot be played right now', openArchive: 'View on Archive.org',
    videoUnavailable: 'Video unavailable right now', altsTitle: 'Watch the same video from other sources',
    altsHint: 'Temporary source problem — tap any video below to watch instantly.', searchEverywhere: 'Search everywhere',
    you: 'You', localComments: 'Saved on your device', star: 'Rating',
    subscribers: 'subscribers', verified: '✓ Verified', channelVideos: 'videos',
    signIn: 'Sign in', signOut: 'Sign out', authLogin: 'Sign in', authSignup: 'Create account',
    authEmail: 'Email', authPassword: 'Password (6+ chars)', authName: 'Your name',
    authSubmitLogin: 'Sign in', authSubmitSignup: 'Create account',
    authHint: 'Sign in to keep your likes, comments, history and subscriptions on every device.',
    authWelcome: 'Welcome', authErr: 'Something went wrong', cloudSaved: '☁️ Saved to cloud',
    loginToComment: 'Sign in to comment', noAccounts: 'Accounts are disabled',
  },
};
function t(key) { return (DICT[state.lang] && DICT[state.lang][key]) || DICT.en[key] || key; }

/* ---------- utils ---------- */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function toBn(s) { return String(s).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]); }
function maybeBn(s) { return state.lang === 'bn' ? toBn(s) : s; }
function fmtNum(n) {
  if (n == null || isNaN(n)) return '';
  n = Number(n);
  let s;
  if (state.lang === 'bn') {
    if (n >= 1e7) s = (n / 1e7).toFixed(1).replace(/\.0$/, '') + ' কোটি';
    else if (n >= 1e5) s = (n / 1e5).toFixed(1).replace(/\.0$/, '') + ' লাখ';
    else if (n >= 1e3) s = (n / 1e3).toFixed(1).replace(/\.0$/, '') + ' হাজার';
    else s = String(n);
    return toBn(s);
  }
  if (n >= 1e9) s = (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  else if (n >= 1e6) s = (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  else if (n >= 1e3) s = (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  else s = String(n);
  return s;
}
function fmtDur(sec) {
  if (!sec && sec !== 0) return '';
  sec = Math.round(Number(sec));
  if (sec < 0) return '';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const str = h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
  return maybeBn(str);
}
function timeAgo(d) {
  if (!d) return '';
  let dt = new Date(d);
  if (isNaN(dt.getTime())) {
    const y = String(d).match(/(\d{4})/);
    return y ? maybeBn(y[1]) : '';
  }
  const sec = (Date.now() - dt.getTime()) / 1000;
  if (sec < 0) return maybeBn(dt.getFullYear());
  const v = (n, unit) => maybeBn(n) + ' ' + unit;
  if (sec < 60) return t('agoNow');
  if (sec < 3600) return v(Math.floor(sec / 60), t('agoMin'));
  if (sec < 86400) return v(Math.floor(sec / 3600), t('agoHour'));
  if (sec < 86400 * 7) return v(Math.floor(sec / 86400), t('agoDay'));
  if (sec < 86400 * 30) return v(Math.floor(sec / (86400 * 7)), t('agoWeek'));
  if (sec < 86400 * 365) return v(Math.floor(sec / (86400 * 30)), t('agoMonth'));
  return v(Math.floor(sec / (86400 * 365)), t('agoYear'));
}
function fmtSize(bytes) {
  if (!bytes) return '';
  const b = Number(bytes);
  if (b > 1073741824) return maybeBn((b / 1073741824).toFixed(1)) + ' GB';
  if (b > 1048576) return maybeBn(Math.round(b / 1048576)) + ' MB';
  return maybeBn(Math.round(b / 1024)) + ' KB';
}

/* ---------- session & cloud ---------- */
function getSession() {
  try { return JSON.parse(localStorage.getItem('ot_session') || 'null'); } catch (_) { return null; }
}
function setSession(s) {
  if (s) localStorage.setItem('ot_session', JSON.stringify(s));
  else localStorage.removeItem('ot_session');
  session = s;
}
let session = getSession();
let DB = { likes: [], watchLater: [], subs: [], history: [] };

async function authedFetch(path, body, method, _retried) {
  const s = getSession();
  const doFetch = (tok) => fetch(path, {
    method: method || (body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...(tok ? { Authorization: 'Bearer ' + tok } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let r = await doFetch(s && s.access_token);
  if (r.status === 401 && s && s.refresh_token && !_retried) {
    try {
      const rr = await fetch('/api/auth/refresh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: s.refresh_token }),
      });
      if (rr.ok) {
        const ns = await rr.json();
        const merged = { ...s, ...ns, user: ns.user || s.user };
        setSession(merged);
        r = await authedFetch(path, body, method, true);
      }
    } catch (_) {}
  }
  return r;
}
function cloudSync(path, payload) {
  if (!session) return;
  authedFetch(path, payload).then(r => {
    if (r.ok) showToast(t('cloudSaved'));
    return r.json();
  }).catch(() => {});
}
async function loadDbState() {
  if (!session) return;
  try {
    const r = await authedFetch('/api/db/state');
    if (r.ok) {
      const d = await r.json();
      DB = {
        likes: d.likes || [], watchLater: d.watchLater || [],
        subs: d.subs || [], history: d.history || [],
      };
      if (d.user) {
        const s = getSession();
        if (s) setSession({ ...s, user: { ...(s.user || {}), ...d.user } });
      }
    }
  } catch (_) {}
}

/* ---------- storage (local + cloud merged) ---------- */
function getList(key) {
  let local = [];
  try { local = JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { local = []; }
  const cloudKey = { ot_liked: 'likes', ot_watchlater: 'watchLater', ot_history: 'history' }[key];
  if (cloudKey && DB[cloudKey] && DB[cloudKey].length) {
    const seen = new Set();
    const merged = [];
    for (const it of [...DB[cloudKey], ...local]) {
      const k = (it.source || 'ia') + ':' + it.id;
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(it);
    }
    return merged;
  }
  return local;
}
function setList(key, v) { localStorage.setItem(key, JSON.stringify(v.slice(0, 200))); }
function upsertItem(key, item) {
  const local = (() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; }
  })().filter(x => !(x.id === item.id && (x.source || 'ia') === (item.source || 'ia')));
  local.unshift(item);
  setList(key, local);
}
function toggleItem(key, item) {
  const local = (() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; }
  })();
  const i = local.findIndex(x => x.id === item.id && (x.source || 'ia') === (item.source || 'ia'));
  let on;
  if (i >= 0) { local.splice(i, 1); setList(key, local); on = false; }
  else { local.unshift(item); setList(key, local); on = true; }
  const cloudPath = { ot_liked: '/api/db/like', ot_watchlater: '/api/db/watchlater' }[key];
  if (cloudPath) cloudSync(cloudPath, { item, on });
  return on;
}
function hasItem(key, id, source) {
  return getList(key).some(x => x.id === id && (x.source || 'ia') === (source || 'ia'));
}
function getSubs() {
  let local = [];
  try { local = JSON.parse(localStorage.getItem('ot_subs') || '[]'); } catch (_) {}
  const seen = new Set();
  const merged = [];
  for (const s of [...(DB.subs || []), ...local]) {
    const name = s.name || s.key;
    if (!name || seen.has(name)) continue;
    seen.add(name);
    merged.push({ ...s, name });
  }
  return merged;
}
function toggleSub(name, extra) {
  const local = (() => {
    try { return JSON.parse(localStorage.getItem('ot_subs') || '[]'); } catch (_) { return []; }
  })();
  const i = local.findIndex(s => s.name === name);
  let on;
  if (i >= 0) { local.splice(i, 1); on = false; }
  else { local.unshift({ name, ts: Date.now(), ...extra }); on = true; }
  setList('ot_subs', local);
  cloudSync('/api/db/sub', { on, channel_key: name, channel_name: name, source: (extra && extra.source) || 'yt' });
  return on;
}

/* ---------- api ---------- */
async function api(path) {
  let lastErr = new Error('network error');
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await new Promise(r => setTimeout(r, 1500 * attempt));
    let r;
    try { r = await fetch(path); }
    catch (e) { lastErr = e; continue; } // network drop → auto retry
    if (r.ok) return r.json();
    let msg = 'HTTP ' + r.status;
    try { const j = await r.json(); if (j.error) msg = j.error; } catch (_) {}
    lastErr = new Error(msg);
    if (r.status < 500 && r.status !== 429) throw lastErr; // client error → don't retry
  }
  throw lastErr;
}

/* ---------- routes helpers ---------- */
function watchHref(item) {
  if (!item) return '#/home';
  if (item.kind === 'channel') return '#/channel/' + encodeURIComponent((item.source || 'yt') + ':' + (item.id || ''));
  if (item.kind === 'playlist') return '#/playlist/' + encodeURIComponent((item.source || 'yt') + ':' + (item.id || ''));
  return '#/watch/' + encodeURIComponent((item.source || 'ia') + ':' + item.id);
}
function channelHref(item) {
  if (!item) return '#/home';
  const src = item.source || 'ia';
  const id = item.creatorId || item.creator || '';
  if (!id) return '#/home';
  return '#/channel/' + encodeURIComponent(src + ':' + id);
}
function splitSid(s) {
  s = String(s || '');
  const i = s.indexOf(':');
  if (i < 0) return { source: 'ia', id: s };
  return { source: s.slice(0, i), id: s.slice(i + 1) };
}

/* ---------- categories & home rows ---------- */
const CATS = [
  { key: 'yt-trending', icon: '🔥', label: 'navYtTrending', src: 'yt', ykind: 'trending' },
  { key: 'songs', icon: '🎵', label: 'navSongs', href: '#/search?q=songs&src=songs' },
  { key: 'yt-music', icon: '🎸', label: 'navYtMusic', href: '#/search?q=official%20music%20video&src=yt&filter=music_videos' },
  { key: 'movies', icon: '🎬', label: 'navMovies', q: 'collection:feature_films', sort: 'popular' },
  { key: 'tv', icon: '📺', label: 'navTv', q: 'collection:classic_tv', sort: 'popular' },
  { key: 'cartoons', icon: '🧒', label: 'navCartoons', q: '(subject:animation OR cartoons)', sort: 'popular' },
  { key: 'news', icon: '📰', label: 'navNews', q: '(collection:newsreels OR collection:prelinger)', sort: 'popular' },
  { key: 'science', icon: '🚀', label: 'navScience', q: 'collection:nasa', sort: 'popular' },
  { key: 'education', icon: '🎓', label: 'navEdu', q: 'subject:education', sort: 'popular' },
  { key: 'tech', icon: '💻', label: 'navTech', q: 'subject:technology', sort: 'popular' },
  { key: 'bengali', icon: '🇧🇩', label: 'navBengali', q: '(bengali OR language:ben)', sort: 'popular' },
  { key: 'docs', icon: '🎥', label: 'navDocs', q: 'subject:documentary', sort: 'popular' },
  { key: 'nature', icon: '🌿', label: 'navNature', q: 'subject:nature', sort: 'popular' },
  { key: 'sports', icon: '⚽', label: 'navSports', q: 'subject:sports', sort: 'popular' },
  { key: 'classics', icon: '🎞️', label: 'navClassics', q: 'subject:silent', sort: 'popular' },
];
function catByKey(k) { return CATS.find(c => c.key === k) || CATS[0]; }

function homeRows() {
  return [
    { title: t('rowYtTrending'), src: 'yt', ykind: 'trending', more: '#/browse/yt-trending' },
    { title: t('rowSongs'), src: 'songs', q: 'official audio', more: '#/search?q=songs&src=songs' },
    { title: t('rowBanglaSongs'), src: 'yt', filter: 'music_songs', q: 'bangla song', more: '#/search?q=bangla%20song&src=yt&filter=music_songs' },
    { title: t('rowYtMusic'), src: 'yt', filter: 'music_videos', q: 'official music video', more: '#/search?q=music%20video&src=yt&filter=music_videos' },
    { title: t('rowBengali'), src: 'ia', q: '(bengali OR language:ben)', sort: 'popular', more: '#/browse/bengali' },
    { title: t('rowClassics'), src: 'ia', q: 'collection:feature_films', sort: 'popular', more: '#/browse/movies' },
    { title: t('rowCartoons'), src: 'ia', q: '(subject:animation OR cartoons)', sort: 'popular', more: '#/browse/cartoons' },
    { title: t('rowNasa'), src: 'ia', q: 'collection:nasa', sort: 'popular', more: '#/browse/science' },
    { title: t('rowDocs'), src: 'ia', q: 'subject:documentary', sort: 'popular', more: '#/browse/docs' },
    { title: t('rowNews'), src: 'ia', q: '(collection:newsreels OR collection:prelinger)', sort: 'popular', more: '#/browse/news' },
  ];
}

/* ---------- components ---------- */
const SRC_LABEL = { yt: '▶ YT', dm: '◆ DM', ia: '■ ARCHIVE' };
function videoCard(item) {
  const initial = esc((item.title || item.name || '?').trim().charAt(0) || '?');
  const isChannel = item.kind === 'channel';
  const isPlaylist = item.kind === 'playlist';
  const creator = (!isChannel && item.creator) ? `<div class="card-sub"><span class="dim" data-act="channel" data-source="${esc(item.source)}" data-name="${esc(item.creator)}" data-cid="${esc(item.creatorId || '')}">${esc(item.creator)}</span></div>` : '';
  const stats = [];
  if (item.views != null && item.views > 0) stats.push(fmtNum(item.views) + ' ' + t('views'));
  if (isChannel && item.subscribers != null) stats.push(fmtNum(item.subscribers) + ' ' + t('subscribers'));
  const ago = timeAgo(item.date);
  if (ago && !isChannel) stats.push(ago);
  const durBadge = (item.duration && item.duration > 0)
    ? `<span class="dur">${fmtDur(item.duration)}</span>`
    : `<span class="dur" style="display:none"></span>`;
  const srcBadge = `<span class="src-badge src-${esc(item.source || 'ia')}">${SRC_LABEL[item.source] || 'ARCHIVE'}</span>`;
  return `
  <a class="card" href="${watchHref(item)}" data-did="${esc(item.id)}" data-source="${esc(item.source || 'ia')}">
    <div class="thumb">
      <img loading="lazy" src="${esc(item.thumb || '')}" alt=""
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="fallback">${isChannel ? '👤' : isPlaylist ? '☰' : initial}</div>
      ${srcBadge}
      ${isChannel || isPlaylist ? '' : durBadge}
    </div>
    <div class="card-meta">
      <div class="avatar">${isChannel ? '👤' : initial}</div>
      <div class="card-text">
        <div class="card-title">${esc(item.title)}${item.verified ? ' <span class="verified-dot">✓</span>' : ''}</div>
        ${creator}
        ${stats.length ? `<div class="card-sub">${stats.join(' • ')}</div>` : ''}
      </div>
    </div>
  </a>`;
}
function videoRow(title, items, moreHref) {
  return `
  <section class="row">
    <div class="row-head">
      <h2 class="row-title">${esc(title)}</h2>
      ${moreHref ? `<a class="row-more" href="${moreHref}">${t('seeAll')} ›</a>` : ''}
    </div>
    <div class="row-scroll">${items.map(videoCard).join('')}</div>
  </section>`;
}
function grid(items) { return `<div class="grid">${items.map(videoCard).join('')}</div>`; }
function spinner() { return `<div class="loading-state"><div class="spinner"></div></div>`; }
function emptyState(title, text, icon) {
  return `<div class="empty-state">
    <div class="big">${icon || t('emptyIcon')}</div>
    <h2>${esc(title)}</h2><p>${esc(text)}</p>
  </div>`;
}
function errorState(msg) {
  return `<div class="empty-state">
    <div class="big">⚠️</div>
    <h2>${t('errorTitle')}</h2>
    <p>${esc(msg || t('errorText'))}</p>
    <button class="btn-retry" data-act="retry">${t('retry')}</button>
  </div>`;
}
function sortSelect(current) {
  const opts = [
    ['relevance', 'sortRelevance'], ['trending', 'sortTrending'], ['popular', 'sortPopular'],
    ['newest', 'sortNewest'], ['rating', 'sortRating'],
  ];
  return `<label class="pill">📊 ${t('sortLabel')}
    <select id="sortSelect">${opts.map(([v, k]) =>
      `<option value="${v}" ${v === current ? 'selected' : ''}>${t(k)}</option>`).join('')}
    </select></label>`;
}

/* ---------- duration enrichment (lazy, for IA cards) ---------- */
const durQueue = [];
let durActive = 0;
function queueDurations(root) {
  root.querySelectorAll('[data-did][data-source="ia"]').forEach(el => {
    const badge = el.querySelector('.dur');
    if (badge && !badge.textContent && !el.dataset.durQueued) {
      el.dataset.durQueued = '1';
      durQueue.push(el);
    }
  });
  pumpDurations();
}
function pumpDurations() {
  while (durActive < 6 && durQueue.length) {
    const el = durQueue.shift();
    if (!el.isConnected) continue;
    durActive++;
    api('/api/meta/' + encodeURIComponent(el.dataset.did))
      .then(m => {
        const badge = el.querySelector('.dur');
        if (badge && m.duration) {
          badge.textContent = fmtDur(m.duration);
          badge.style.display = '';
        }
      })
      .catch(() => {})
      .finally(() => { durActive--; pumpDurations(); });
  }
}

/* ---------- views ---------- */
const view = document.getElementById('view');
const chipsRow = document.getElementById('chipsRow');

function renderChips(activeKey) {
  chipsRow.innerHTML = CATS.map(c => {
    const href = c.href || ('#/browse/' + c.key);
    return `<a class="chip ${c.key === activeKey ? 'active' : ''}" href="${href}">${c.icon} ${t(c.label)}</a>`;
  }).join('');
  chipsRow.style.display = activeKey === null ? 'none' : 'flex';
}

/* row data fetcher (home + browse) */
async function fetchRow(r) {
  if (r.src === 'songs') {
    const d = await runSearch({ q: r.q || 'songs', source: 'songs', page: 1 });
    return d.items || [];
  }
  if (r.src === 'yt') {
    if (r.ykind === 'trending') {
      const d = await api('/api/yt/trending?region=BD');
      return d.items || [];
    }
    const d = await api(`/api/yt/search?q=${encodeURIComponent(r.q || 'songs')}&filter=${encodeURIComponent(r.filter || 'videos')}`);
    return (d.items || []).filter(x => x.kind === 'video');
  }
  const d = await api(`/api/search?q=${encodeURIComponent(r.q || '')}&sort=${r.sort || 'popular'}&rows=14`);
  return d.items || [];
}

async function renderHome() {
  renderChips(null);
  document.title = 'OpenTube';
  const rows = homeRows();
  view.innerHTML = `<div class="hero-note">✨ ${esc(t('hero'))}</div>` +
    rows.map(r => `
      <section class="row" data-row>
        <div class="row-head">
          <h2 class="row-title">${esc(r.title)}</h2>
          <a class="row-more" href="${r.more}">${t('seeAll')} ›</a>
        </div>
        <div class="row-scroll"><div class="spinner" style="margin:30px auto"></div></div>
      </section>`).join('');

  const sectionEls = view.querySelectorAll('[data-row]');
  rows.forEach((r, i) => {
    fetchRow(r)
      .then(items => {
        const el = sectionEls[i];
        if (!el || !el.isConnected) return;
        el.querySelector('.row-scroll').innerHTML = items.length
          ? items.slice(0, 14).map(videoCard).join('')
          : '';
        queueDurations(el);
      })
      .catch(() => {
        const el = sectionEls[i];
        if (el && el.isConnected) el.querySelector('.row-scroll').innerHTML = '';
      });
  });
}

async function renderBrowse(catKey, sortOverride) {
  const cat = catByKey(catKey);
  if (cat.href) { location.hash = cat.href; return; }
  renderChips(cat.key);

  if (cat.src === 'yt' && cat.ykind === 'trending') {
    document.title = t(cat.label) + ' · OpenTube';
    view.innerHTML = `
      <h1 class="page-title">${cat.icon} ${esc(t(cat.label))}</h1>
      <div id="results">${spinner()}</div>`;
    try {
      const d = await api('/api/yt/trending?region=BD');
      const res = document.getElementById('results');
      if (!res || !res.isConnected) return;
      res.innerHTML = d.items.length ? grid(d.items) : emptyState(t('noResults'), t('noResultsText'));
      queueDurations(res);
    } catch (e) {
      const res = document.getElementById('results');
      if (res && res.isConnected) res.innerHTML = errorState(e.message);
    }
    window.__loadMore = null;
    window.__resort = null;
    return;
  }

  const sort = sortOverride || cat.sort || 'popular';
  document.title = t(cat.label) + ' · OpenTube';
  view.innerHTML = `
    <h1 class="page-title">${cat.icon} ${esc(t(cat.label))}</h1>
    <div class="watch-bar">${sortSelect(sort)}</div>
    <div id="results">${spinner()}</div>`;

  let page = 1;
  const load = async (append) => {
    const res = document.getElementById('results');
    try {
      const d = await api(`/api/search?q=${encodeURIComponent(cat.q)}&sort=${sort}&page=${page}&rows=24`);
      if (!res || !res.isConnected) return;
      const html = d.items.length ? grid(d.items) : emptyState(t('noResults'), t('noResultsText'));
      if (append) {
        const old = res.querySelector('.grid');
        if (old) old.insertAdjacentHTML('beforeend', d.items.map(videoCard).join(''));
        else res.innerHTML = html;
        res.querySelectorAll('.load-more-wrap').forEach(x => x.remove());
      } else res.innerHTML = html;
      queueDurations(res);
      if (page * 24 < (d.total || 0)) {
        res.insertAdjacentHTML('beforeend',
          `<div class="load-more-wrap"><button class="btn-load" data-act="loadmore">⬇ ${t('loadMore')}</button></div>`);
      }
    } catch (e) {
      if (res && res.isConnected) res.innerHTML = errorState(e.message);
    }
  };
  window.__loadMore = async () => { page++; await load(true); };
  window.__resort = (s) => renderBrowse(catKey, s);
  await load(false);
}

/* ---------- unified search ---------- */
async function runSearch({ q, source, filter, sort, page }) {
  source = source || 'all';
  sort = sort || 'relevance';
  page = page || 1;
  if (source === 'yt') {
    const f = (filter && filter !== 'all') ? filter : 'videos';
    const d = await api(`/api/yt/search?q=${encodeURIComponent(q)}&filter=${encodeURIComponent(f)}`);
    return { items: d.items || [], total: (d.items || []).length, page, hasMore: false };
  }
  if (source === 'dm') {
    const d = await api(`/api/dm/search?q=${encodeURIComponent(q)}&page=${page}`);
    return { items: d.items || [], total: d.total || 0, page, hasMore: !!d.hasMore };
  }
  if (source === 'ia') {
    const d = await api(`/api/search?q=${encodeURIComponent(q)}&sort=${sort}&page=${page}&rows=24`);
    return { items: d.items || [], total: d.total || 0, page, hasMore: page * 24 < (d.total || 0) };
  }
  if (source === 'songs') {
    // songs tab: YouTube music + Dailymotion + Archive, merged
    const [yt, dm, ia] = await Promise.allSettled([
      api(`/api/yt/search?q=${encodeURIComponent(q)}&filter=music_songs`),
      api(`/api/dm/search?q=${encodeURIComponent(q)}&page=${page}`),
      api(`/api/search?q=${encodeURIComponent(q)}&sort=${sort}&page=${page}&rows=12`),
    ]);
    const items = [];
    if (yt.status === 'fulfilled') items.push(...(yt.value.items || []));
    if (dm.status === 'fulfilled') items.push(...(dm.value.items || []));
    if (ia.status === 'fulfilled') items.push(...(ia.value.items || []));
    return { items, total: items.length, page, hasMore: false };
  }
  if (source === 'alts') {
    // alternatives for an unplayable video: Dailymotion + Archive (phrase-matched)
    const [dm, ia] = await Promise.allSettled([
      api(`/api/dm/search?q=${encodeURIComponent(q)}&page=1`),
      api(`/api/search?q=${encodeURIComponent('"' + q + '"')}&sort=popular&page=1&rows=12`),
    ]);
    const items = [];
    if (dm.status === 'fulfilled') items.push(...(dm.value.items || []));
    if (ia.status === 'fulfilled') items.push(...(ia.value.items || []));
    return { items, total: items.length, page: 1, hasMore: false };
  }
  // all sources merged
  const [yt, dm, ia] = await Promise.allSettled([
    api(`/api/yt/search?q=${encodeURIComponent(q)}&filter=videos`),
    api(`/api/dm/search?q=${encodeURIComponent(q)}&page=${page}`),
    api(`/api/search?q=${encodeURIComponent(q)}&sort=${sort}&page=${page}&rows=24`),
  ]);
  const items = [];
  if (yt.status === 'fulfilled') items.push(...(yt.value.items || []));
  if (dm.status === 'fulfilled') items.push(...(dm.value.items || []));
  if (ia.status === 'fulfilled') items.push(...(ia.value.items || []));
  const total = (ia.status === 'fulfilled' ? ia.value.total || 0 : 0) +
    (dm.status === 'fulfilled' ? dm.value.total || 0 : 0) + (yt.status === 'fulfilled' ? 20 : 0);
  const hasMore = (ia.status === 'fulfilled' && page * 24 < (ia.value.total || 0)) ||
    (dm.status === 'fulfilled' && dm.value.hasMore);
  return { items, total, page, hasMore };
}

async function renderSearch(q, source, filter, sort) {
  renderChips(null);
  source = source || 'all';
  filter = filter || '';
  sort = sort || 'relevance';
  document.title = (q || 'Search') + ' · OpenTube';
  document.getElementById('searchInput').value = q || '';

  const tabs = [
    ['all', '', 'tabAll'], ['yt', 'videos', 'tabYt'], ['songs', '', 'tabSongs'],
    ['dm', '', 'tabDm'], ['ia', '', 'tabArchive'],
  ];
  const tabHtml = tabs.map(([src, f, k]) => {
    const active = src === source && (f || '') === (filter || '');
    return `<a class="chip ${active ? 'active' : ''}" href="#/search?q=${encodeURIComponent(q || '')}&src=${src}${f ? '&filter=' + f : ''}">${t(k)}</a>`;
  }).join('');

  view.innerHTML = `
    <h1 class="page-title">🔍 ${esc(t('searchFor'))}${q ? ': “' + esc(q) + '”' : ''}</h1>
    <div class="chips-row" style="position:static;padding-top:0">${tabHtml}</div>
    <div class="watch-bar">${sortSelect(sort)}</div>
    <div id="results">${spinner()}</div>`;

  let page = 1;
  const load = async (append) => {
    const res = document.getElementById('results');
    try {
      const d = await runSearch({ q, source, filter, sort, page });
      if (!res || !res.isConnected) return;
      const body = d.items.length
        ? grid(d.items) + (d.total ? `<div class="page-sub" style="margin-top:18px">≈ ${fmtNum(d.total)} ${state.lang === 'bn' ? 'টি ফলাফল' : 'results'}</div>` : '')
        : emptyState(t('noResults'), t('noResultsText'));
      if (append) {
        const old = res.querySelector('.grid');
        if (old) old.insertAdjacentHTML('beforeend', d.items.map(videoCard).join(''));
        else res.innerHTML = body;
        res.querySelectorAll('.load-more-wrap').forEach(x => x.remove());
      } else res.innerHTML = body;
      queueDurations(res);
      if (d.hasMore) {
        res.insertAdjacentHTML('beforeend',
          `<div class="load-more-wrap"><button class="btn-load" data-act="loadmore">⬇ ${t('loadMore')}</button></div>`);
      }
    } catch (e) {
      if (res && res.isConnected) res.innerHTML = errorState(e.message);
    }
  };
  window.__loadMore = async () => { page++; await load(true); };
  window.__resort = (s) => renderSearch(q, source, filter, s);
  await load(false);
}

/* ---------- watch page (source-aware) ---------- */
async function fetchMeta(source, id) {
  if (source === 'yt') return api('/api/yt/streams/' + encodeURIComponent(id));
  if (source === 'dm') return api('/api/dm/meta/' + encodeURIComponent(id));
  return api('/api/meta/' + encodeURIComponent(id));
}

async function renderWatch(sid) {
  renderChips(null);
  const { source, id } = splitSid(sid);
  view.innerHTML = spinner();
  let m;
  try {
    m = await fetchMeta(source, id);
  } catch (e) {
    view.innerHTML = errorState(e.message);
    return;
  }
  m.source = source;
  if (m.unavailable) {
    document.title = (m.title || id) + ' · OpenTube';
    view.innerHTML = `
      <div class="unavail-card">
        ${m.thumb ? `<img class="unavail-thumb" src="${esc(m.thumb)}" alt="" onerror="this.style.display='none'">` : ''}
        <div style="min-width:0">
          <h1 class="watch-title" style="margin-top:0">${esc(m.title || t('videoUnavailable'))}</h1>
          <p class="unavail-reason">⚠ ${t('altsHint')}</p>
          <div class="watch-actions" style="margin-top:14px">
            <button class="pill" data-act="retry">🔄 ${t('retry')}</button>
            <a class="pill" href="#/search?q=${encodeURIComponent((m.title || id).slice(0, 60))}">🔍 ${t('searchEverywhere')}</a>
          </div>
        </div>
      </div>
      <h2 style="margin:28px 0 14px">${t('altsTitle')}</h2>
      <div id="altsBox">${spinner()}</div>`;
    (async () => {
      const box = document.getElementById('altsBox');
      try {
        const d = await runSearch({ q: m.title || id, source: 'alts', page: 1 });
        if (!box || !box.isConnected) return;
        const items = d.items.slice(0, 12);
        box.innerHTML = items.length ? grid(items) : emptyState(t('noResults'), t('noResultsText'));
      } catch (_) {
        if (box && box.isConnected) box.innerHTML = emptyState(t('noResults'), t('noResultsText'));
      }
    })();
    return;
  }
  document.title = m.title + ' · OpenTube';
  const histItem = {
    id, source, title: m.title, thumb: m.thumb, creator: m.creator,
    duration: m.duration, views: m.views, date: m.date, ts: Date.now(),
  };
  upsertItem('ot_history', histItem);
  cloudSync('/api/db/history', { item: histItem });

  const dqi = m.defaultQuality || 0;
  const q0 = (m.qualities && m.qualities[dqi]) || (m.qualities && m.qualities[0]);
  const liked = hasItem('ot_liked', id, source);
  const saved = hasItem('ot_watchlater', id, source);
  const subKey = m.creatorId || m.creator;
  const subbed = subKey ? getSubs().some(s => s.name === subKey) : false;

  const stats = [];
  if (m.views != null && m.views > 0) stats.push(`<b>${fmtNum(m.views)}</b> ${t('views')}`);
  if (m.likes != null && m.likes > 0) stats.push(`👍 ${fmtNum(m.likes)}`);
  if (source === 'ia' && m.downloads != null) stats.push(`<b>${fmtNum(m.downloads)}</b> ${t('downloads')}`);
  const ago = timeAgo(m.date);
  if (ago) stats.push(ago);
  if (m.rating) stats.push(`⭐ ${maybeBn(Number(m.rating).toFixed(1))}/5`);

  const qualityHtml = (m.qualities && m.qualities.length > 1)
    ? `<label class="pill">⚙️ ${t('quality')}
        <select id="qualitySel">${m.qualities.map((q, i) =>
          `<option value="${i}" ${i === dqi ? 'selected' : ''}>${esc(q.label)}${q.size ? ' · ' + fmtSize(q.size) : ''}</option>`).join('')}
       </select></label>`
    : '';
  const dlHtml = q0
    ? `<a class="pill" href="${esc(q0.url)}" download target="_blank" rel="noopener">⬇ ${t('download')}</a>`
    : '';

  let playerHtml;
  if (q0) {
    playerHtml = `<div class="player-wrap">
        <video id="player" controls playsinline autoplay poster="${esc(m.thumb || '')}">
          <source src="${esc(q0.url)}" type="video/mp4">
          ${(m.subtitles || []).map((s, i) => `<track kind="subtitles" src="${esc(s.url)}" label="${esc(s.label)}" ${i === 0 ? 'default' : ''}>`).join('')}
        </video>
        <div id="playerLoad" class="player-load hide"><div class="spinner"></div><div id="playerLoadTxt">${t('loadPreparing')}</div></div>
      </div>`;
  } else if (m.embedUrl) {
    playerHtml = `<div class="player-wrap">
        <iframe src="${esc(m.embedUrl)}" style="width:100%;height:100%;border:0" allowfullscreen
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"></iframe>
      </div>`;
  } else {
    playerHtml = `<div class="player-wrap" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px">
        <div style="font-size:40px">🎞️</div>
        <div style="color:#aaa">${t('noPlayable')}</div>
        ${source === 'ia' ? `<a class="pill" href="https://archive.org/details/${encodeURIComponent(id)}" target="_blank" rel="noopener">${t('openArchive')} ↗</a>` : ''}
      </div>`;
  }

  const commentHtml = (c, isReview) => `
    <div class="comment">
      <div class="avatar">${esc((c.user || '?').charAt(0))}</div>
      <div>
        <div class="comment-head">${esc(c.user || 'Anonymous')}
          <span>${esc(timeAgo(c.date || c.ts))}</span>
          ${isReview && c.stars ? `<div class="comment-stars">${'★'.repeat(Math.round(c.stars))}${'☆'.repeat(5 - Math.round(c.stars))}</div>` : ''}
          ${c.cloud ? `<span class="cloud-tag">☁️</span>` : ''}
        </div>
        <div class="comment-text">${esc(c.text)}</div>
      </div>
    </div>`;
  const localComments = getList('ot_comments_' + source + '_' + id);
  const reviewHtml = (m.reviews || []).map(r => commentHtml({ ...r, user: r.user, text: r.text, date: r.date }, true)).join('');
  const localHtml = localComments.map(c => commentHtml(c, false)).join('');

  const subsLine = m.subscribers != null ? `<div class="card-sub">${fmtNum(m.subscribers)} ${t('subscribers')}</div>` : '';

  view.innerHTML = `
  <div class="watch-layout">
    <div>
      ${playerHtml}
      <h1 class="watch-title">${esc(m.title)}</h1>
      <div class="watch-bar">
        <div class="watch-stats">${stats.join(' · ')}</div>
        <div class="watch-actions">
          <button class="pill ${liked ? 'on' : ''}" data-act="like">👍 ${t('like')}</button>
          <button class="pill" data-act="dislike">👎 ${t('dislike')}</button>
          <button class="pill ${saved ? 'on' : ''}" data-act="save">🔖 ${saved ? t('saved') : t('save')}</button>
          <button class="pill" data-act="share">🔗 ${t('share')}</button>
          ${qualityHtml}
          ${dlHtml}
        </div>
      </div>
      <div class="channel-bar">
        <div class="avatar">${esc((m.creator || '?').charAt(0))}</div>
        <div>
          <a class="channel-name" href="#/channel/${encodeURIComponent(source + ':' + (m.creatorId || m.creator || 'unknown'))}" data-act="channel" data-source="${esc(source)}" data-name="${esc(m.creator)}" data-cid="${esc(m.creatorId || '')}">${esc(m.creator || t('channelTitle'))}</a>
          ${m.verified ? `<span class="verified-dot"> ${t('verified')}</span>` : ''}
          ${subsLine}
        </div>
        <button class="btn-sub ${subbed ? 'subd' : ''}" data-act="subscribe" data-name="${esc(subKey || m.creator)}">
          ${subbed ? '✓ ' + t('subscribed') : t('subscribe')}
        </button>
      </div>
      <div class="desc-box collapsed" data-act="expand">
        ${m.description ? esc(m.description) : esc(m.title)}
        <span class="more">${t('showMore')}</span>
      </div>
      ${m.subjects && m.subjects.length ? `<div class="subject-chips">${m.subjects.map(s =>
        `<a href="#/search?q=${encodeURIComponent('subject:"' + s + '"')}&src=ia">#${esc(s)}</a>`).join('')}</div>` : ''}
      <section class="comments">
        <h2>${t('comments')} ${maybeBn('' + ((m.reviews || []).length + localComments.length))}</h2>
        <form class="comment-form" id="commentForm">
          <div class="avatar">${esc(t('you').charAt(0))}</div>
          <div style="flex:1;display:flex;flex-direction:column;gap:10px">
            <input type="text" id="cName" maxlength="40" placeholder="${t('cName')}" value="${esc((session && session.user && session.user.name) || localStorage.getItem('ot_name') || '')}" ${session ? 'readonly' : ''}>
            <input type="text" id="cText" maxlength="500" placeholder="${session ? t('cText') : t('loginToComment') + ' / ' + t('cText')}">
          </div>
          <button class="pill" type="submit">💬 ${t('post')}</button>
        </form>
        <div id="commentList">${localHtml || reviewHtml ? localHtml + reviewHtml : `<p style="color:var(--text2);font-size:14px">${t('noComments')}</p>`}</div>
      </section>
    </div>
    <aside>
      <h2 style="font-size:16px;margin-bottom:12px">${t('related')}</h2>
      <div class="related-list" id="relatedList">${spinner()}</div>
    </aside>
  </div>`;

  // player quality switching
  const video = document.getElementById('player');
  const qsel = document.getElementById('qualitySel');
  if (video && qsel) {
    qsel.addEventListener('change', () => {
      const q = m.qualities[[...qsel.options].findIndex(o => o.selected)];
      if (!q) return;
      const time = video.currentTime, playing = !video.paused;
      video.src = q.url;
      video.currentTime = time;
      if (playing) video.play().catch(() => {});
    });
  }
  // auto-recover + quality fallback: never leave the user with a dead player
  if (video) {
    const loadBox = document.getElementById('playerLoad');
    const loadTxt = document.getElementById('playerLoadTxt');
    let vTried = 0, stallTimer = null;
    const hideLoad = () => { if (loadBox) loadBox.classList.add('hide'); if (stallTimer) { clearTimeout(stallTimer); stallTimer = null; } };
    const showLoad = (msg) => { if (loadBox) { loadBox.classList.remove('hide'); if (loadTxt) loadTxt.textContent = msg; } };
    const fallbackIdx = () => {
      const quals = m.qualities || [];
      const curIdx = qsel ? [...qsel.options].findIndex(o => o.selected) : 0;
      const cur = quals[curIdx] || {};
      const lower = quals.map((q, i) => ({ q, i })).filter(x => x.i !== curIdx && (!cur.height || (x.q.height || 0) < cur.height));
      if (lower.length) {
        lower.sort((a, b) => ((a.q.instant ? 0 : 1) - (b.q.instant ? 0 : 1)) || ((b.q.height || 0) - (a.q.height || 0)));
        return lower[0].i;
      }
      return curIdx;
    };
    const armStall = () => {
      if (stallTimer) clearTimeout(stallTimer);
      stallTimer = setTimeout(() => {
        if (!video.isConnected || vTried >= 3) return;
        vTried++;
        const next = fallbackIdx();
        if (qsel && next >= 0) {
          showToast(t('qualitySwitched') + ' \u2192 ' + (((m.qualities || [])[next] || {}).label || ''));
          qsel.selectedIndex = next;
          qsel.dispatchEvent(new Event('change'));
        }
        armStall();
      }, 20000);
    };
    video.addEventListener('loadstart', () => { showLoad(t('loadPreparing')); armStall(); });
    video.addEventListener('waiting', () => showLoad(t('loadBuffering')));
    video.addEventListener('playing', hideLoad);
    video.addEventListener('canplay', hideLoad);
    video.addEventListener('loadeddata', hideLoad);
    video.addEventListener('error', () => {
      if (vTried >= 3) return;
      vTried++;
      setTimeout(() => {
        if (!video.isConnected) return;
        const next = fallbackIdx();
        if (qsel && next >= 0) {
          showToast(t('qualitySwitched') + ' \u2192 ' + (((m.qualities || [])[next] || {}).label || ''));
          qsel.selectedIndex = next;
          qsel.dispatchEvent(new Event('change'));
        } else {
          const cur = video.currentSrc || video.src;
          if (cur) { video.src = cur; video.load(); video.play().catch(() => {}); }
        }
        armStall();
      }, 1500);
    }, true);
  }

  // comment form
  const cf = document.getElementById('commentForm');
  if (cf) cf.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (session && session.user && session.user.name) || (document.getElementById('cName').value || t('you')).trim();
    const text = document.getElementById('cText').value.trim();
    if (!text) return;
    if (!session) localStorage.setItem('ot_name', name);
    const l = getList('ot_comments_' + source + '_' + id);
    l.unshift({ user: name, text, ts: Date.now() });
    setList('ot_comments_' + source + '_' + id, l);
    if (session) cloudSync('/api/db/comment', { source, id, text, name });
    renderWatch(sid);
    setTimeout(() => {
      const c = document.querySelector('.comments');
      if (c) c.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  });

  // cloud comments
  (async () => {
    const box = document.getElementById('commentList');
    if (!box || !box.isConnected) return;
    try {
      const r = await fetch(`/api/db/comments?source=${encodeURIComponent(source)}&id=${encodeURIComponent(id)}`);
      if (!r.ok) return;
      const d = await r.json();
      const cloud = (d.items || []).filter(c => c.text);
      if (cloud.length && box.isConnected) {
        box.innerHTML = cloud.map(c => commentHtml(c, false)).join('') + localHtml + reviewHtml;
      }
    } catch (_) {}
  })();

  // related videos
  const relBox = document.getElementById('relatedList');
  const fill = (items) => {
    if (!relBox || !relBox.isConnected) return;
    const list = (items || []).filter(x => x.id !== id && x.kind !== 'channel').slice(0, 12);
    relBox.innerHTML = list.length ? list.map(r => `
      <a class="rel-card" href="${watchHref(r)}" data-did="${esc(r.id)}" data-source="${esc(r.source)}">
        <div class="rel-thumb">
          <img loading="lazy" src="${esc(r.thumb || '')}" alt="" onerror="this.style.display='none'">
          ${(r.duration && r.duration > 0) ? `<span class="dur" style="position:absolute;right:6px;bottom:6px;background:rgba(0,0,0,.82);color:#fff;font-size:11px;padding:1px 5px;border-radius:4px;">${fmtDur(r.duration)}</span>` : ''}
        </div>
        <div class="rel-info">
          <div class="rel-title">${esc(r.title)}</div>
          <div class="rel-sub">${esc(r.creator || '')}</div>
          <div class="rel-sub">${r.views ? fmtNum(r.views) + ' ' + t('views') : ''}</div>
        </div>
      </a>`).join('') : emptyState(t('noResults'), t('noResultsText'));
    queueDurations(relBox);
  };

  (async () => {
    try {
      if (m.related && m.related.length) return fill(m.related);
      // fallback: search same title/creator words
      const terms = (m.title || '').split(/\s+/).slice(0, 4).join(' ');
      const d = await runSearch({ q: terms || m.creator || 'video', source: source === 'ia' ? 'yt' : source, filter: 'videos', sort: 'relevance', page: 1 });
      fill(d.items);
    } catch (_) {
      if (relBox && relBox.isConnected) relBox.innerHTML = emptyState(t('noResults'), t('noResultsText'));
    }
  })();
}

/* ---------- channel page ---------- */
async function renderChannel(sid) {
  renderChips(null);
  const { source, id } = splitSid(sid);
  view.innerHTML = spinner();
  try {
    let data;
    if (source === 'yt') {
      data = await api('/api/yt/channel/' + encodeURIComponent(id));
    } else if (source === 'dm') {
      data = await api('/api/dm/user/' + encodeURIComponent(id));
    } else {
      // IA creator search
      const d = await api(`/api/search?creator=${encodeURIComponent(id)}&sort=popular&rows=24`);
      data = { id, name: id, avatar: '', banner: '', subscribers: null, verified: false, description: '', videos: d.items || [] };
    }
    document.title = data.name + ' · OpenTube';
    const subKey = data.id || data.name;
    const subbed = getList('ot_subs').some(s => s.name === subKey);
    view.innerHTML = `
      <div class="channel-bar" style="border-top:none;flex-wrap:nowrap">
        ${data.avatar
          ? `<img class="avatar" src="${esc(data.avatar)}" style="width:64px;height:64px;object-fit:cover" alt="" onerror="this.style.display='none'">`
          : `<div class="avatar" style="width:64px;height:64px;font-size:26px">${esc((data.name || '?').charAt(0))}</div>`}
        <div>
          <h1 class="page-title" style="margin:0">${esc(data.name)} ${data.verified ? '<span class="verified-dot">✓</span>' : ''}</h1>
          <div class="page-sub" style="margin:4px 0 0">
            ${data.subscribers != null ? fmtNum(data.subscribers) + ' ' + t('subscribers') + ' · ' : ''}
            ${maybeBn(data.videos.length + '')} ${t('channelVideos')}
          </div>
        </div>
        <button class="btn-sub ${subbed ? 'subd' : ''}" data-act="subscribe" data-name="${esc(subKey)}" style="margin-left:auto">
          ${subbed ? '✓ ' + t('subscribed') : t('subscribe')}
        </button>
      </div>
      ${data.description ? `<div class="desc-box collapsed" data-act="expand" style="margin-bottom:20px">${esc(data.description)}<span class="more">${t('showMore')}</span></div>` : ''}
      <div id="results">${data.videos.length ? grid(data.videos) : emptyState(t('noResults'), t('noResultsText'))}</div>`;
    queueDurations(view);
  } catch (e) {
    view.innerHTML = errorState(e.message);
  }
}

/* ---------- playlist page ---------- */
async function renderPlaylist(sid) {
  renderChips(null);
  const { source, id } = splitSid(sid);
  view.innerHTML = spinner();
  try {
    if (source !== 'yt') throw new Error('unsupported');
    const data = await api('/api/yt/playlist/' + encodeURIComponent(id));
    document.title = data.name + ' · OpenTube';
    view.innerHTML = `
      <h1 class="page-title">☰ ${esc(data.name)}</h1>
      <div class="page-sub" style="margin-bottom:18px">${maybeBn(data.videos.length + '')} ${t('channelVideos')}</div>
      <div id="results">${data.videos.length ? grid(data.videos) : emptyState(t('noResults'), t('noResultsText'))}</div>`;
  } catch (e) {
    view.innerHTML = errorState(e.message);
  }
}

/* ---------- library ---------- */
async function renderLibrary(tab) {
  renderChips(null);
  const titles = {
    history: ['titleHistory', 'historyEmpty', '🕐'],
    watchlater: ['titleWatchLater', 'watchLaterEmpty', '🔖'],
    liked: ['titleLiked', 'likedEmpty', '👍'],
    subs: ['titleSubs', 'subsEmpty', '📺'],
  };
  const [tk, ek, icon] = titles[tab] || titles.history;
  document.title = t(tk) + ' · OpenTube';
  view.innerHTML = `<h1 class="page-title">${icon} ${esc(t(tk))}</h1><div id="results">${spinner()}</div>`;
  const res = document.getElementById('results');
  try {
    if (tab === 'subs') {
      const subs = getSubs();
      if (!subs.length) { res.innerHTML = emptyState(t(tk), t(ek), '💤'); return; }
      res.innerHTML = '';
      for (const s of subs) {
        const holder = document.createElement('section');
        holder.className = 'row';
        const route = String(s.name).startsWith('UC') ? 'yt:' + s.name : (String(s.name).includes(' ') ? 'ia:' + s.name : s.name.includes(':') ? s.name : 'yt:' + s.name);
        holder.innerHTML = `
          <div class="row-head">
            <h2 class="row-title"><a href="#/channel/${encodeURIComponent(route)}">${esc(s.name)}</a></h2>
            <button class="row-more" data-act="subscribe" data-name="${esc(s.name)}" style="background:none">✕ ${t('subscribed')}</button>
          </div>
          <div class="row-scroll"><div class="spinner" style="margin:24px auto"></div></div>`;
        res.appendChild(holder);
        (async (name, box) => {
          try {
            let items = [];
            if (name.startsWith('UC')) {
              const d = await api('/api/yt/channel/' + encodeURIComponent(name));
              items = d.videos || [];
            } else {
              const d = await runSearch({ q: name, source: 'yt', filter: 'videos', page: 1 });
              items = d.items;
            }
            box.innerHTML = items.length ? items.slice(0, 10).map(videoCard).join('') : `<div class="page-sub">—</div>`;
            queueDurations(box);
          } catch (_) { box.innerHTML = `<div class="page-sub">—</div>`; }
        })(s.name, holder.querySelector('.row-scroll'));
      }
    } else {
      const key = { history: 'ot_history', watchlater: 'ot_watchlater', liked: 'ot_liked' }[tab] || 'ot_history';
      const items = getList(key);
      res.innerHTML = items.length ? grid(items) : emptyState(t(tk), t(ek), '💤');
      queueDurations(res);
    }
  } catch (e) {
    res.innerHTML = errorState(e.message);
  }
}

/* ---------- router ---------- */
function parseRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  const [p, qs] = h.split('?');
  const parts = p.split('/').filter(Boolean).map(decodeURIComponent);
  return { parts, params: new URLSearchParams(qs || '') };
}
function setActiveNav(route) {
  document.querySelectorAll('.side-item').forEach(el => el.classList.remove('active'));
  const key = route.parts[0] === 'browse' ? route.parts[1] : route.parts[0];
  const el = document.querySelector(`.side-item[data-route="${key}"]`);
  if (el) el.classList.add('active');
}
async function render() {
  const route = parseRoute();
  setActiveNav(route);
  closeSidebar();
  window.scrollTo({ top: 0 });
  durQueue.length = 0;
  const [a, b] = route.parts;
  if (!a || a === 'home') return renderHome();
  if (a === 'browse') return renderBrowse(b || 'yt-trending', route.params.get('sort'));
  if (a === 'search') return renderSearch(route.params.get('q') || '', route.params.get('src') || 'all', route.params.get('filter') || '', route.params.get('sort'));
  if (a === 'watch') return renderWatch(b || '');
  if (a === 'channel') return renderChannel(b || '');
  if (a === 'playlist') return renderPlaylist(b || '');
  if (a === 'library') return renderLibrary(b || 'history');
  return renderHome();
}
window.addEventListener('hashchange', render);

/* ---------- sidebar & topbar ---------- */
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
function openSidebar() { sidebar.classList.add('open'); overlay.classList.add('show'); }
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
document.getElementById('menuBtn').addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
overlay.addEventListener('click', closeSidebar);

document.getElementById('searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = document.getElementById('searchInput').value.trim();
  if (q) location.hash = '#/search?q=' + encodeURIComponent(q);
});

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('ot_theme', state.theme);
}
document.getElementById('themeBtn').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
});
function applyLang() {
  localStorage.setItem('ot_lang', state.lang);
  document.documentElement.lang = state.lang;
  document.getElementById('langLabel').textContent = state.lang === 'bn' ? 'EN' : 'বাং';
  document.getElementById('searchInput').placeholder = t('searchPlaceholder');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
}
document.getElementById('langBtn').addEventListener('click', () => {
  state.lang = state.lang === 'bn' ? 'en' : 'bn';
  applyLang();
  render();
});

/* ---------- toast ---------- */
let toastTimer = null;
function showToast(msg) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------- auth UI ---------- */
const authArea = document.getElementById('authArea');
function renderAuthArea() {
  if (!authArea) return;
  const s = getSession();
  if (s && s.user) {
    const name = s.user.name || s.user.email || 'User';
    authArea.innerHTML = `
      <button class="avatar auth-avatar" data-act="signout" title="${esc(name)} · ${t('signOut')}">${esc(name.charAt(0).toUpperCase())}</button>`;
  } else {
    authArea.innerHTML = `<button class="pill auth-btn" data-act="signin">👤 ${t('signIn')}</button>`;
  }
}
function showAuthModal(mode) {
  const login = mode !== 'signup';
  let el = document.getElementById('authModal');
  if (el) el.remove();
  el = document.createElement('div');
  el.id = 'authModal';
  el.className = 'modal-overlay';
  el.innerHTML = `
    <div class="modal-card">
      <button class="modal-close" data-act="closemodal">✕</button>
      <div class="brand" style="margin-bottom:6px">
        <svg viewBox="0 0 48 48" class="brand-logo"><defs><linearGradient id="bgm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ff4d4d"/><stop offset="1" stop-color="#ff2e63"/></linearGradient></defs>
          <rect x="2" y="6" width="44" height="36" rx="10" fill="url(#bgm)"/><path d="M20 15.5v17l14-8.5z" fill="#fff"/></svg>
        <span class="brand-name">OpenTube</span>
      </div>
      <h2>${login ? t('authLogin') : t('authSignup')}</h2>
      <p class="modal-hint">${t('authHint')}</p>
      <form id="authForm">
        ${login ? '' : `<input type="text" id="afName" maxlength="40" placeholder="${t('authName')}">`}
        <input type="email" id="afEmail" required placeholder="${t('authEmail')}">
        <input type="password" id="afPassword" required minlength="6" placeholder="${t('authPassword')}">
        <div id="afError" class="modal-error"></div>
        <button class="modal-submit" type="submit">${login ? t('authSubmitLogin') : t('authSubmitSignup')}</button>
      </form>
      <button class="modal-switch" data-act="switchauth" data-mode="${login ? 'signup' : 'login'}">
        ${login ? t('authSignup') + ' →' : '← ' + t('authLogin')}
      </button>
    </div>`;
  document.body.appendChild(el);
  el.addEventListener('click', (e) => { if (e.target === el) el.remove(); });
  const form = el.querySelector('#authForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errBox = el.querySelector('#afError');
    errBox.textContent = '';
    const email = el.querySelector('#afEmail').value.trim();
    const password = el.querySelector('#afPassword').value;
    const nameEl = el.querySelector('#afName');
    const name = nameEl ? nameEl.value.trim() : '';
    try {
      const path = login ? '/api/auth/login' : '/api/auth/signup';
      const r = await fetch(path, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await r.json();
      if (!r.ok || data.error) throw new Error(data.msg || data.error_description || data.message || data.error || t('authErr'));
      if (data.access_token) {
        setSession(data);
        await loadDbState();
        renderAuthArea();
        el.remove();
        showToast('🎉 ' + t('authWelcome') + ', ' + (data.user && (data.user.user_metadata && data.user.user_metadata.name || data.user.email) || email));
        render();
      } else {
        // signup without instant session (email confirm flow) — ask to log in
        showAuthModal('login');
        showToast('✉️ ' + t('authLogin'));
      }
    } catch (err) {
      errBox.textContent = '⚠ ' + (err.message || t('authErr'));
    }
  });
}

/* ---------- delegated actions ---------- */
function currentWatchSid() {
  const r = parseRoute();
  return r.parts[0] === 'watch' ? r.parts[1] : null;
}
function metaSnapshot(id, source) {
  const titleEl = document.querySelector('.watch-title');
  const chanEl = document.querySelector('.channel-name');
  return {
    id, source: source || 'ia',
    title: titleEl ? titleEl.textContent.trim() : id,
    thumb: '/img/' + id,
    creator: chanEl ? chanEl.textContent.trim() : '',
    date: '', ts: Date.now(),
  };
}
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) {
    if (e.target.closest('.side-item')) closeSidebar();
    return;
  }
  const act = el.dataset.act;

  if (act === 'signin') { showAuthModal('login'); return; }
  if (act === 'signout') {
    if (session) {
      authedFetch('/api/auth/logout', {}, 'POST').catch(() => {});
      setSession(null);
      DB = { likes: [], watchLater: [], subs: [], history: [] };
      renderAuthArea();
      showToast('👋 ' + t('signOut'));
      render();
    }
    return;
  }
  if (act === 'closemodal') {
    const m = document.getElementById('authModal');
    if (m) m.remove();
    return;
  }
  if (act === 'switchauth') {
    showAuthModal(el.dataset.mode === 'signup' ? 'signup' : 'login');
    return;
  }

  if (act === 'channel') {
    e.preventDefault();
    const source = el.dataset.source || 'yt';
    const cid = el.dataset.cid;
    const name = el.dataset.name;
    const target = cid ? (source + ':' + cid) : (source + ':' + name);
    if (name || cid) location.hash = '#/channel/' + encodeURIComponent(target);
    return;
  }
  if (act === 'retry') { render(); return; }
  if (act === 'loadmore') {
    el.disabled = true;
    if (window.__loadMore) await window.__loadMore();
    return;
  }
  if (act === 'expand') {
    const box = el.closest('.desc-box');
    box.classList.toggle('collapsed');
    const more = box.querySelector('.more');
    if (more) more.textContent = box.classList.contains('collapsed') ? t('showMore') : t('showLess');
    return;
  }

  const sid = currentWatchSid();
  if (!sid) return;
  const { source, id } = splitSid(sid);

  if (act === 'like') {
    const on = toggleItem('ot_liked', { id, source, ...metaSnapshot(id, source) });
    el.classList.toggle('on', on);
    showToast(on ? '❤️ ' + t('saved') : t('like'));
    return;
  }
  if (act === 'dislike') {
    el.classList.toggle('on');
    showToast('👎');
    return;
  }
  if (act === 'save') {
    const on = toggleItem('ot_watchlater', { id, source, ...metaSnapshot(id, source) });
    el.classList.toggle('on', on);
    el.innerHTML = `🔖 ${on ? t('saved') : t('save')}`;
    showToast(on ? '🔖 ' + t('saved') : t('save'));
    return;
  }
  if (act === 'share') {
    const url = location.origin + location.pathname + '#/watch/' + encodeURIComponent(sid);
    try {
      await navigator.clipboard.writeText(url);
      showToast('🔗 ' + t('copied'));
    } catch (_) {
      showToast(url);
    }
    return;
  }
  if (act === 'subscribe') {
    const name = el.dataset.name;
    if (!name) return;
    const on = toggleSub(name, { source: el.dataset.source || 'yt' });
    showToast(on ? '📺 ' + t('subscribe') : '✓ ' + t('subscribed'));
    document.querySelectorAll('[data-act="subscribe"]').forEach(btn => {
      const isSub = getSubs().some(s => s.name === btn.dataset.name);
      btn.classList.toggle('subd', isSub);
      btn.textContent = isSub ? '✓ ' + t('subscribed') : t('subscribe');
    });
    return;
  }
});

/* sort select delegation */
document.addEventListener('change', (e) => {
  if (e.target.id === 'sortSelect' && window.__resort) {
    window.__resort(e.target.value);
  }
});

/* ---------- keyboard shortcuts ---------- */
document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  const v = document.getElementById('player');
  switch (e.key) {
    case ' ': case 'k':
      if (v) { e.preventDefault(); v.paused ? v.play().catch(() => {}) : v.pause(); }
      break;
    case 'j': if (v) v.currentTime = Math.max(0, v.currentTime - 10); break;
    case 'l': if (v) v.currentTime = v.currentTime + 10; break;
    case 'f':
      if (v) {
        e.preventDefault();
        if (document.fullscreenElement) document.exitFullscreen();
        else v.requestFullscreen && v.requestFullscreen().catch(() => {});
      }
      break;
    case 'm': if (v) v.muted = !v.muted; break;
    case '/':
      e.preventDefault();
      document.getElementById('searchInput').focus();
      break;
  }
});

/* ---------- boot ---------- */
applyTheme();
applyLang();
renderAuthArea();
if (!location.hash) location.hash = '#/home';
render();
loadDbState().then(() => { renderAuthArea(); render(); });
