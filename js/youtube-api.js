/* ================================================================
   WEALTH CREATOR — YouTube Data API v3 Integration
   Automatically fetches latest videos, thumbnails, views, dates
   Caches to localStorage (30 min TTL) to save API quota
================================================================ */

// ╔══════════════════════════════════════════════════════════════╗
// ║           PASTE YOUR YOUTUBE DATA API KEY BELOW              ║
// ║  Get it free at: https://console.cloud.google.com           ║
// ╚══════════════════════════════════════════════════════════════╝
const YT_API_KEY     = 'AIzaSyBLQwPqwOc2u6rjA9Ij9vbG0U9ZMv0oqTM';
const YT_CHANNEL_HANDLE = 'WealthCreatorOfficial'; // Your channel handle
const YT_MAX_RESULTS = 12;                    // Videos to fetch
const CACHE_TTL_MS   = 30 * 60 * 1000;       // 30 minutes cache

// ── BASE URLs ─────────────────────────────────────────────────────
const BASE = 'https://www.googleapis.com/youtube/v3';

// ── CACHE HELPERS ─────────────────────────────────────────────────
const CACHE_KEY = 'wc_yt_cache';
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (Date.now() - obj.ts > CACHE_TTL_MS) return null; // expired
    return obj.data;
  } catch { return null; }
}
function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

// ── FORMAT HELPERS ────────────────────────────────────────────────
function fmtViews(n) {
  n = parseInt(n, 10);
  if (isNaN(n)) return '—';
  if (n >= 10000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000000)  return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000)     return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString('en-IN');
}

function fmtDuration(iso) {
  // ISO 8601 → MM:SS or HH:MM:SS
  if (!iso) return '';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return '';
  const h = parseInt(m[1] || 0);
  const min = parseInt(m[2] || 0);
  const s = parseInt(m[3] || 0);
  if (h > 0) return `${h}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${min}:${String(s).padStart(2,'0')}`;
}

function parseDurSecs(iso) {
  // Returns total seconds from ISO 8601 duration
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1]||0)*3600) + (parseInt(m[2]||0)*60) + parseInt(m[3]||0);
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return Math.floor(diff/60) + ' min ago';
  if (diff < 86400) return Math.floor(diff/3600) + ' hours ago';
  if (diff < 604800)return Math.floor(diff/86400) + ' days ago';
  if (diff < 2592000)return Math.floor(diff/604800) + ' weeks ago';
  return Math.floor(diff/2592000) + ' months ago';
}

// ── API CALLS ─────────────────────────────────────────────────────

// STEP 1 — Get channel info (channel ID + uploads playlist ID)
async function getChannelInfo() {
  const url = `${BASE}/channels?part=id,contentDetails,statistics&forHandle=${YT_CHANNEL_HANDLE}&key=${YT_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Channel fetch failed: ${res.status}`);
  const data = await res.json();
  if (!data.items?.length) throw new Error('Channel not found');
  const ch = data.items[0];
  return {
    channelId:       ch.id,
    uploadsPlaylist: ch.contentDetails.relatedPlaylists.uploads,
    subscriberCount: ch.statistics.subscriberCount,
    videoCount:      ch.statistics.videoCount,
    viewCount:       ch.statistics.viewCount,
  };
}

// STEP 2 — Get latest video IDs from uploads playlist
async function getPlaylistVideos(playlistId) {
  const url = `${BASE}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${YT_MAX_RESULTS}&key=${YT_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Playlist fetch failed: ${res.status}`);
  const data = await res.json();
  if (!data.items?.length) throw new Error('No videos found');

  return data.items.map(item => ({
    videoId:     item.contentDetails.videoId,
    title:       item.snippet.title,
    description: item.snippet.description,
    thumbnail:   item.snippet.thumbnails?.maxres?.url
                 || item.snippet.thumbnails?.high?.url
                 || item.snippet.thumbnails?.medium?.url,
    publishedAt: item.snippet.publishedAt,
    channelTitle:item.snippet.channelTitle,
  }));
}

// STEP 3 — Get video statistics & duration (view count, likes, duration)
async function getVideoStats(videoIds) {
  const ids = videoIds.join(',');
  const url = `${BASE}/videos?part=statistics,contentDetails,snippet&id=${ids}&key=${YT_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
  const data = await res.json();

  const map = {};
  data.items?.forEach(v => {
    map[v.id] = {
      viewCount:    v.statistics.viewCount   || '0',
      likeCount:    v.statistics.likeCount   || '0',
      commentCount: v.statistics.commentCount|| '0',
      duration:     v.contentDetails.duration,
      tags:         v.snippet.tags?.slice(0,3) || [],
    };
  });
  return map;
}

// ── MASTER FETCH ──────────────────────────────────────────────────
async function fetchAllYTData(forceRefresh = false) {
  // Check if API key is configured
  if (!YT_API_KEY || YT_API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('[YouTube API] API key not configured — using mock data');
    return null;
  }

  // Return cache if available and not forcing refresh
  if (!forceRefresh) {
    const cached = readCache();
    if (cached) {
      console.log('[YouTube API] Using cached data');
      return cached;
    }
  }

  try {
    console.log('[YouTube API] Fetching live data...');

    // Step 1: Channel info
    const channelInfo = await getChannelInfo();
    console.log('[YouTube API] Channel ID:', channelInfo.channelId);

    // Step 2: Latest videos
    const videos = await getPlaylistVideos(channelInfo.uploadsPlaylist);
    console.log('[YouTube API] Fetched', videos.length, 'videos');

    // Step 3: Stats for all videos
    const videoIds = videos.map(v => v.videoId);
    const stats = await getVideoStats(videoIds);

    // Merge everything
    const enriched = videos.map(v => {
      const dur = stats[v.videoId]?.duration || '';
      // Detect Shorts: duration <= 60s  (PT0S, PT30S, PT1M, etc.)
      const durSecs = parseDurSecs(dur);
      const isShort = durSecs > 0 && durSecs <= 62;
      return {
        ...v,
        ...(stats[v.videoId] || {}),
        isShort,
        url: isShort
          ? `https://www.youtube.com/shorts/${v.videoId}`
          : `https://www.youtube.com/watch?v=${v.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${v.videoId}?autoplay=1&rel=0&modestbranding=1`,
      };
    });

    const result = { channelInfo, videos: enriched, fetchedAt: new Date().toISOString() };
    writeCache(result);

    console.log('[YouTube API] ✅ Success! Data cached for 30 minutes.');
    return result;

  } catch (err) {
    console.error('[YouTube API] ❌ Error:', err.message);
    return null;
  }
}

// Helper to launch video modal from card data attributes (immune to string escaping bugs)
function playVideoFromCard(card) {
  if (!card) return;
  const videoId = card.getAttribute('data-video-id');
  const title = card.getAttribute('data-title');
  const thumbnail = card.getAttribute('data-thumbnail');
  const isShort = card.getAttribute('data-is-short') === 'true';
  const ytUrl = card.getAttribute('data-url');
  openVideoPlayer(videoId, title, thumbnail, isShort, ytUrl);
}

// ── RENDER VIDEO GRID ─────────────────────────────────────────────
function renderVideoGrid(videos, containerId = 'videoGrid') {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  grid.innerHTML = videos.map((v, i) => {
    const cat   = getCategoryFromTitle(v.title);
    const thumb = v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`;
    const isShort   = v.isShort ? 'true' : 'false';
    const shortBadge = v.isShort ? '<span class="short-badge">📱 Short</span>' : '';

    return `
    <div class="video-card reveal ${i > 0 ? `reveal-d${Math.min(i,4)}` : ''}"
         data-video-id="${v.videoId}"
         data-title="${escStr(v.title)}"
         data-thumbnail="${escStr(thumb)}"
         data-is-short="${isShort}"
         data-url="${escStr(v.url || '')}"
         onclick="playVideoFromCard(this)"
         role="button" tabindex="0"
         aria-label="Watch: ${escStr(v.title)}"
         onkeydown="if(event.key==='Enter')playVideoFromCard(this)">

      <div class="video-thumb-wrap">
        <img
          src="${thumb}"
          alt="${escStr(v.title)}"
          class="video-thumb"
          loading="lazy"
          onerror="this.src='https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg'"
        >
        <div class="play-overlay" aria-hidden="true">
          <div class="play-btn-circle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        ${v.duration && !v.isShort ? `<div class="duration-badge">${fmtDuration(v.duration)}</div>` : ''}
        ${shortBadge}
        <div class="video-cat-tag">${cat.emoji} ${cat.label}</div>
      </div>

      <div class="video-info">
        <h3 class="video-title">${v.title}</h3>
        <div class="video-meta-row">
          <span class="vm-item">👁️ ${fmtViews(v.viewCount)} views</span>
          <span class="vm-sep">·</span>
          <span class="vm-item">❤️ ${fmtViews(v.likeCount)} likes</span>
          <span class="vm-sep">·</span>
          <span class="vm-item">🕐 ${timeAgo(v.publishedAt)}</span>
        </div>
        <p class="video-desc">${(v.description||'').slice(0,100)}${(v.description||'').length>100?'...':''}</p>
        <div class="video-actions">
          <button class="btn-watch" onclick="event.stopPropagation();playVideoFromCard(this.closest('.video-card'))">
            ${v.isShort ? '📱 Watch Short' : '▶ Watch Now'}
          </button>
          <a href="${v.url}" target="_blank" rel="noopener"
             onclick="event.stopPropagation()"
             class="btn-yt-link" aria-label="Open on YouTube">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF0000"><path d="M21.58 6.19a2.51 2.51 0 0 0-1.77-1.77C18.25 4 12 4 12 4s-6.25 0-7.81.42a2.51 2.51 0 0 0-1.77 1.77C2 7.75 2 12 2 12s0 4.25.42 5.81a2.51 2.51 0 0 0 1.77 1.77C5.75 20 12 20 12 20s6.25 0 7.81-.42a2.51 2.51 0 0 0 1.77-1.77C22 16.25 22 12 22 12s0-4.25-.42-5.81zM10 15.46V8.54L16 12l-6 3.46z"/></svg>
            YouTube
          </a>
        </div>
      </div>
    </div>`;
  }).join('');

  // Re-run scroll reveal for newly added cards
  requestAnimationFrame(() => {
    grid.querySelectorAll('.reveal').forEach(el => {
      // Force immediately visible (cards already in viewport after filter/initial load)
      el.classList.add('visible');
    });
  });
}


// ── YOUTUBE IFRAME API LOADER ─────────────────────────────────────
// Loads official YT API once; queues callbacks until ready
let _ytApiReady = false;
let _ytApiQueue = [];
let _ytPlayer   = null;
let _modalData  = {};

function loadYTAPI(cb) {
  if (_ytApiReady && window.YT?.Player) { cb(); return; }
  _ytApiQueue.push(cb);
  if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return;
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
}
// Global callback required by YouTube API
window.onYouTubeIframeAPIReady = function () {
  _ytApiReady = true;
  _ytApiQueue.forEach(fn => fn());
  _ytApiQueue = [];
};

// ── OPEN VIDEO PLAYER — 1 CLICK, ZERO ERRORS ──────────────────────
function openVideoPlayer(videoId, title, thumbnail, isShort, ytUrl) {
  const modal = document.getElementById('videoModal');
  if (!modal) return;

  _modalData = { videoId, title, thumbnail, isShort, ytUrl };

  const thumb    = thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const watchUrl = ytUrl || (isShort
    ? `https://www.youtube.com/shorts/${videoId}`
    : `https://www.youtube.com/watch?v=${videoId}`);

  // Build base modal shell
  modal.innerHTML = `
    <div class="video-modal-box" onclick="event.stopPropagation()">

      <!-- Header -->
      <div class="video-modal-header">
        <h3 class="video-modal-title" title="${escStr(title)}">${escStr(title)}</h3>
        <div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">
          <a href="${watchUrl}" target="_blank" rel="noopener"
             class="btn btn-yt" style="padding:7px 14px;font-size:.76rem;gap:6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 6.19a2.51 2.51 0 0 0-1.77-1.77C18.25 4 12 4 12 4s-6.25 0-7.81.42a2.51 2.51 0 0 0-1.77 1.77C2 7.75 2 12 2 12s0 4.25.42 5.81a2.51 2.51 0 0 0 1.77 1.77C5.75 20 12 20 12 20s6.25 0 7.81-.42a2.51 2.51 0 0 0 1.77-1.77C22 16.25 22 12 22 12s0-4.25-.42-5.81zM10 15.46V8.54L16 12l-6 3.46z"/></svg>
            ${isShort ? 'Watch Short' : 'Open on YouTube'}
          </a>
          <button onclick="closeVideoPlayer()" class="vm-close-btn" aria-label="Close">✕</button>
        </div>
      </div>

      <!-- Player area -->
      <div class="video-modal-player" id="vmPlayer">
        ${isShort ? buildShortScreen(thumb, title, watchUrl) : buildLoadingScreen(thumb)}
      </div>
    </div>`;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  history.pushState({ videoModal: true }, '', `#v=${videoId}`);

  // For regular videos: load YT IFrame API and create player immediately
  if (!isShort) {
    loadYTAPI(() => createYTPlayer(videoId, thumb, watchUrl));
  }
}

// ── LOADING SCREEN (shown while player initialises) ───────────────
function buildLoadingScreen(thumb) {
  return `
    <div id="vmLoadingScreen" style="
      position:absolute;inset:0;
      background:url('${thumb}') center/cover no-repeat;
      display:flex;align-items:center;justify-content:center;
    ">
      <div style="position:absolute;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(2px);"></div>
      <div class="vm-spinner" style="position:relative;z-index:2;"></div>
    </div>
    <div id="ytApiPlayerDiv" style="position:absolute;inset:0;opacity:0;transition:opacity .4s;"></div>`;
}

// ── CREATE YT.PLAYER (official API) ───────────────────────────────
function createYTPlayer(videoId, thumb, watchUrl) {
  const container = document.getElementById('ytApiPlayerDiv');
  if (!container || !window.YT?.Player) return;

  _ytPlayer = new YT.Player('ytApiPlayerDiv', {
    videoId,
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay:       1,
      rel:            0,
      modestbranding: 1,
      playsinline:    1,
      enablejsapi:    1,
    },
    events: {
      onReady(e) {
        // Hide loading screen, show player
        const loading = document.getElementById('vmLoadingScreen');
        if (loading) loading.style.display = 'none';
        const playerDiv = document.getElementById('ytApiPlayerDiv');
        if (playerDiv) playerDiv.style.opacity = '1';
        e.target.playVideo();
      },
      onError(e) {
        // Error codes 101 & 150 = embedding disabled by channel owner
        // Error 5 = HTML5 player error  |  Error 100 = not found
        console.warn('[WC Player] YouTube embed error code:', e.data);
        showEmbedErrorScreen(thumb, watchUrl);
      }
    }
  });
}

// ── EMBED ERROR SCREEN (auto-shown on Error 101/150/153) ──────────
function showEmbedErrorScreen(thumb, watchUrl) {
  const player = document.getElementById('vmPlayer');
  if (!player) return;
  const { title } = _modalData;

  player.innerHTML = `
    <div class="vm-short-screen">
      <img src="${thumb}" alt="" class="vm-bg-thumb">
      <div class="vm-short-overlay">
        <div class="vm-short-badge" style="background:rgba(255,165,0,.18);border-color:rgba(255,165,0,.4);color:#FFB347;">
          🔒 Embed Restricted
        </div>
        <h4 class="vm-short-title">${escStr(title)}</h4>
        <p class="vm-short-note">
          This video cannot be played here directly.<br>
          Click below to watch it on YouTube — opens in a new tab.
        </p>
        <a href="${watchUrl}" target="_blank" rel="noopener" class="vm-watch-yt-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 6.19a2.51 2.51 0 0 0-1.77-1.77C18.25 4 12 4 12 4s-6.25 0-7.81.42a2.51 2.51 0 0 0-1.77 1.77C2 7.75 2 12 2 12s0 4.25.42 5.81a2.51 2.51 0 0 0 1.77 1.77C5.75 20 12 20 12 20s6.25 0 7.81-.42a2.51 2.51 0 0 0 1.77-1.77C22 16.25 22 12 22 12s0-4.25-.42-5.81zM10 15.46V8.54L16 12l-6 3.46z"/></svg>
          Watch on YouTube
        </a>
      </div>
    </div>`;
}

// ── SHORT SCREEN (built upfront, no API needed) ───────────────────
function buildShortScreen(thumb, title, watchUrl) {
  return `
    <div class="vm-short-screen">
      <img src="${thumb}" alt="${escStr(title)}" class="vm-bg-thumb">
      <div class="vm-short-overlay">
        <div class="vm-short-badge">📱 YouTube Short</div>
        <h4 class="vm-short-title">${escStr(title)}</h4>
        <p class="vm-short-note">YouTube Shorts cannot be embedded here.<br>Watch it directly on YouTube.</p>
        <a href="${watchUrl}" target="_blank" rel="noopener" class="vm-watch-yt-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 6.19a2.51 2.51 0 0 0-1.77-1.77C18.25 4 12 4 12 4s-6.25 0-7.81.42a2.51 2.51 0 0 0-1.77 1.77C2 7.75 2 12 2 12s0 4.25.42 5.81a2.51 2.51 0 0 0 1.77 1.77C5.75 20 12 20 12 20s6.25 0 7.81-.42a2.51 2.51 0 0 0 1.77-1.77C22 16.25 22 12 22 12s0-4.25-.42-5.81zM10 15.46V8.54L16 12l-6 3.46z"/></svg>
          Watch Short on YouTube
        </a>
      </div>
    </div>`;
}

// ── CLOSE PLAYER ──────────────────────────────────────────────────
function closeVideoPlayer() {
  // Stop & destroy YT player cleanly
  if (_ytPlayer?.destroy) { try { _ytPlayer.destroy(); } catch {} }
  _ytPlayer = null;

  const modal = document.getElementById('videoModal');
  if (!modal) return;
  modal.classList.remove('active');
  setTimeout(() => { modal.innerHTML = ''; }, 300);
  document.body.style.overflow = '';

  // ✅ FIX: Clean hash WITHOUT navigating away from the page
  // history.back() was causing the page to reload and lose the video grid!
  if (location.hash.startsWith('#v=')) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

// Close on backdrop click
document.addEventListener('click', e => {
  const modal = document.getElementById('videoModal');
  if (modal?.classList.contains('active') && e.target === modal) closeVideoPlayer();
});
// Close on browser Back (Escape key too)
window.addEventListener('popstate', () => closeVideoPlayer());
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideoPlayer(); });



// ── RENDER CHANNEL STATS ──────────────────────────────────────────
function renderChannelStats(info) {
  if (!info) return;

  // Update stat counters in stats bar if using real data
  const updates = [
    { selector: '[data-count="500"]', value: Math.round(parseInt(info.subscriberCount)/1000) + 'K+', raw: parseInt(info.subscriberCount)/1000, suffix:'K+' },
    { selector: '[data-count="200"]', value: info.videoCount + '+', raw: parseInt(info.videoCount), suffix:'+' },
  ];

  updates.forEach(u => {
    const el = document.querySelector(u.selector);
    if (el) {
      el.dataset.count  = u.raw;
      el.dataset.suffix = u.suffix;
    }
  });
}

// ── RENDER "FETCHED AT" BADGE ─────────────────────────────────────
function renderFetchedBadge(fetchedAt) {
  const badge = document.getElementById('ytFetchedBadge');
  if (!badge) return;
  const t = new Date(fetchedAt).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:true});
  badge.textContent = `🔄 Updated ${t}`;
  badge.style.display = 'inline-flex';
}

// ── CATEGORY DETECTION ────────────────────────────────────────────
// NOTE: cat values MUST exactly match the onclick values in index.html pills!
function getCategoryFromTitle(title) {
  const t = title.toLowerCase();

  // Mutual Funds (separate from SIP)
  if (t.includes('mutual fund') || t.includes('mf ') || t.includes('elss') || t.includes('debt fund') || t.includes('equity fund') || t.includes('flexi') || t.includes('index fund') || t.includes('small cap') || t.includes('mid cap') || t.includes('large cap'))
    return { label:'Mutual Funds',    emoji:'📊', cat:'Mutual Funds'        };

  // SIP Investment
  if (t.includes('sip') || t.includes('systematic investment') || t.includes('invest') || t.includes('portfolio'))
    return { label:'SIP / Invest',    emoji:'💰', cat:'SIP Investment'      };

  // Stock Market (English + Telugu keywords)
  if (t.includes('stock') || t.includes('share') || t.includes('nifty') || t.includes('sensex') || t.includes('market') || t.includes('trading') || t.includes('equity') || t.includes('ipo'))
    return { label:'Stock Market',    emoji:'📈', cat:'Stock Market'        };

  // Dividend
  if (t.includes('dividend'))
    return { label:'Dividend',        emoji:'💎', cat:'Dividend Stocks'     };

  // Tax Saving
  if (t.includes('tax') || t.includes('80c') || t.includes('itr') || t.includes('income tax') || t.includes('tds'))
    return { label:'Tax Saving',      emoji:'🧾', cat:'Tax Saving'          };

  // Government Schemes (English + Telugu: yojana, scheme, pf, provident)
  if (t.includes('ppf') || t.includes('nps') || t.includes('yojana') || t.includes('scheme') || t.includes('sukanya') || t.includes('provident') || t.includes('government') || t.includes('epf') || t.includes('pmay') || t.includes('pm '))
    return { label:'Gov. Schemes',    emoji:'🏛️', cat:'Government Schemes'  };

  // Insurance
  if (t.includes('insurance') || t.includes('term plan') || t.includes('term life') || t.includes('health') || t.includes('life cover') || t.includes('ulip'))
    return { label:'Insurance',       emoji:'🛡️', cat:'Insurance'           };

  // FD / RD / Savings (Telugu: FD lo, savings)
  if (t.includes(' fd') || t.includes('fd ') || t.includes('fixed deposit') || t.includes('recurring') || t.includes('savings') || t.includes('bank'))
    return { label:'Savings / FD',    emoji:'🏦', cat:'Personal Finance'    };

  // Default
  return   { label:'Finance',         emoji:'📊', cat:'Personal Finance'    };
}

// ── ESCAPE HELPER ─────────────────────────────────────────────────
function escStr(s) {
  return (s || '').replace(/`/g,"'").replace(/\\/g,'\\\\').replace(/"/g,'&quot;');
}

// ── SHOW API KEY WARNING ──────────────────────────────────────────
function showApiKeyWarning() {
  const grid = document.getElementById('videoGrid');
  if (!grid) return;

  // Only show if still placeholder
  if (YT_API_KEY !== 'YOUR_API_KEY_HERE') return;

  grid.innerHTML = `
    <div style="
      grid-column:1/-1;
      background:linear-gradient(135deg,rgba(255,71,87,.08),rgba(255,71,87,.04));
      border:1px dashed rgba(255,71,87,.4);
      border-radius:var(--r-xl);padding:48px 32px;text-align:center;
    ">
      <div style="font-size:3rem;margin-bottom:16px;">🔑</div>
      <h3 style="font-family:var(--fh);font-size:1.4rem;font-weight:800;color:#FF6B7A;margin-bottom:12px;">
        YouTube API Key Required
      </h3>
      <p style="color:var(--t2);font-size:.9rem;max-width:500px;margin:0 auto 24px;line-height:1.8;">
        To display your live YouTube videos, please add your <strong>YouTube Data API v3 key</strong>
        to the file <code style="background:var(--glass);padding:2px 8px;border-radius:6px;color:var(--gold);">js/youtube-api.js</code>
      </p>
      <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r-md);
                  padding:16px 24px;display:inline-block;text-align:left;margin-bottom:24px;font-family:monospace;font-size:.85rem;">
        <span style="color:var(--t3);">// Line 14 in youtube-api.js</span><br>
        <span style="color:#FF6B7A;">const YT_API_KEY = </span><span style="color:#FFD700;">'<strong>PASTE_YOUR_KEY_HERE</strong>'</span><span style="color:var(--t1);">;</span>
      </div>
      <br>
      <a href="https://console.cloud.google.com" target="_blank" rel="noopener"
         class="btn btn-gold" style="margin-right:12px;">
        🔑 Get Free API Key →
      </a>
      <a href="https://www.youtube.com/@WealthCreatorOfficial" target="_blank" rel="noopener"
         class="btn btn-outline">
        Watch on YouTube
      </a>
    </div>`;
}

// ── CATEGORY FILTER (for video grid) ─────────────────────────────
let allFetchedVideos = [];

function filterVideosByCategory(cat, btn) {
  // ── Update pills ──────────────────────────────────────────────
  document.querySelectorAll('.category-pill').forEach(p => {
    p.classList.remove('active');
    p.setAttribute('aria-pressed','false');
  });
  const activeBtn = btn || event?.target;
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.setAttribute('aria-pressed','true');
  }

  // Guard: data not loaded yet
  if (!allFetchedVideos.length) return;

  const filtered = cat === 'All'
    ? allFetchedVideos
    : allFetchedVideos.filter(v => getCategoryFromTitle(v.title).cat === cat);

  if (filtered.length === 0) {
    // ── No match: show friendly empty state ──────────────────────
    const grid = document.getElementById('videoGrid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:64px 24px;color:var(--t3);">
          <div style="font-size:3rem;margin-bottom:14px;">🔍</div>
          <h3 style="font-family:var(--fh);font-size:1.1rem;color:var(--t2);margin-bottom:8px;">No videos in this category yet</h3>
          <p style="font-size:.84rem;margin-bottom:24px;">New videos are uploaded regularly. Check back soon!</p>
          <button onclick="filterVideosByCategory('All',document.querySelector('.category-pill'))"
                  class="btn btn-outline" style="font-size:.82rem;padding:10px 24px;">
            ← Show All Videos
          </button>
        </div>`;
    }
    return;
  }

  // ── Render matched videos ─────────────────────────────────────
  renderVideoGrid(filtered);

  // Force cards visible immediately (skip IntersectionObserver delay on re-filter)
  requestAnimationFrame(() => {
    document.querySelectorAll('#videoGrid .reveal').forEach(el => el.classList.add('visible'));
  });
}


// ── MAIN INIT ─────────────────────────────────────────────────────
async function initYouTubeAPI(forceRefresh = false) {
  // If API key not set, show warning and return
  if (!YT_API_KEY || YT_API_KEY === 'YOUR_API_KEY_HERE') {
    showApiKeyWarning();
    return;
  }

  // Show loading skeleton
  showVideoSkeleton();

  const result = await fetchAllYTData(forceRefresh);

  if (result) {
    allFetchedVideos = result.videos;
    window.videoData = result.videos; // Sync live data for search
    renderVideoGrid(result.videos);
    renderChannelStats(result.channelInfo);
    renderFetchedBadge(result.fetchedAt);
    // ✅ Update Recent Uploads with real YouTube data
    if (typeof window.renderRecentUploads === 'function') {
      window.renderRecentUploads(result.videos);
    }
    // ✅ Update Most Viewed with real YouTube data
    if (typeof window.renderTrendingVideos === 'function') {
      window.renderTrendingVideos(result.videos);
    }
    console.log('[YouTube API] ✅ Videos rendered successfully');

  } else {
    // Fall back to mock data from youtube.js
    console.warn('[YouTube API] Using mock data fallback');
    if (typeof renderVideos === 'function') renderVideos();
  }
}

// ── LOADING SKELETON ──────────────────────────────────────────────
function showVideoSkeleton() {
  const grid = document.getElementById('videoGrid');
  if (!grid || grid.querySelector('.video-card')) return;

  const skeleton = `
    <div class="video-card" style="pointer-events:none;">
      <div class="video-thumb-wrap" style="background:var(--glass);border-radius:var(--r-md) var(--r-md) 0 0;">
        <div style="width:100%;aspect-ratio:16/9;background:linear-gradient(90deg,var(--glass) 25%,var(--glass-str) 50%,var(--glass) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;"></div>
      </div>
      <div class="video-info">
        <div style="height:16px;background:var(--glass);border-radius:4px;margin-bottom:8px;animation:shimmer 1.5s infinite;"></div>
        <div style="height:12px;background:var(--glass);border-radius:4px;width:70%;margin-bottom:8px;animation:shimmer 1.5s infinite;"></div>
        <div style="height:10px;background:var(--glass);border-radius:4px;width:50%;animation:shimmer 1.5s infinite;"></div>
      </div>
    </div>`;

  grid.innerHTML = skeleton.repeat(6);
}

// ── AUTO REFRESH ──────────────────────────────────────────────────
// Refresh every 30 minutes, and also when tab becomes visible
document.addEventListener('DOMContentLoaded', () => {
  initYouTubeAPI();
  setInterval(() => initYouTubeAPI(true), 30 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const cache = readCache();
      if (!cache) initYouTubeAPI();
    }
  });
});
