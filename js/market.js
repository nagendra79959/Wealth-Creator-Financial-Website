/* ================================================================
   WEALTH CREATOR — Live Market Data Module v2.0
   Multiple API strategies — works even when opened as file://
   Auto-refreshes every 5 minutes | Smart fallback on failure
================================================================ */

// ── SYMBOLS ───────────────────────────────────────────────────────
const MARKET_SYMBOLS = [
  { sym:'^NSEI',        label:'NIFTY 50',   prefix:'',   heroId:'heroNifty',  decimals:0 },
  { sym:'^BSESN',       label:'SENSEX',     prefix:'',   heroId:'heroSensex', decimals:0 },
  { sym:'USDINR=X',     label:'USD/INR',    prefix:'₹',  heroId:'heroUsdInr', decimals:2 },
  { sym:'GC=F',         label:'GOLD/10g',   prefix:'₹',  heroId:'heroGold',   decimals:0, isGold:true },
  { sym:'RELIANCE.NS',  label:'RELIANCE',   prefix:'₹',  heroId:null,         decimals:2 },
  { sym:'HDFCBANK.NS',  label:'HDFC BANK',  prefix:'₹',  heroId:null,         decimals:2 },
  { sym:'TCS.NS',       label:'TCS',        prefix:'₹',  heroId:null,         decimals:2 },
  { sym:'INFY.NS',      label:'INFOSYS',    prefix:'₹',  heroId:null,         decimals:2 },
  { sym:'SBIN.NS',      label:'SBI',        prefix:'₹',  heroId:null,         decimals:2 },
  { sym:'ICICIBANK.NS', label:'ICICI',      prefix:'₹',  heroId:null,         decimals:2 },
  { sym:'BAJFINANCE.NS',label:'BAJAJ FIN',  prefix:'₹',  heroId:null,         decimals:2 },
  { sym:'WIPRO.NS',     label:'WIPRO',      prefix:'₹',  heroId:null,         decimals:2 },
];

// ── FALLBACK (updated to realistic 2025-26 values) ────────────────
const FALLBACK = [
  { sym:'^NSEI',        label:'NIFTY 50',   price:24800, chgPct:0.45,  prefix:'',  decimals:0, heroId:'heroNifty'  },
  { sym:'^BSESN',       label:'SENSEX',     price:81500, chgPct:0.48,  prefix:'',  decimals:0, heroId:'heroSensex' },
  { sym:'USDINR=X',     label:'USD/INR',    price:84.50, chgPct:-0.12, prefix:'₹', decimals:2, heroId:'heroUsdInr' },
  { sym:'GC=F',         label:'GOLD/10g',   price:95200, chgPct:0.80,  prefix:'₹', decimals:0, heroId:'heroGold'   },
  { sym:'RELIANCE.NS',  label:'RELIANCE',   price:1450,  chgPct:0.65,  prefix:'₹', decimals:2, heroId:null },
  { sym:'HDFCBANK.NS',  label:'HDFC BANK',  price:1780,  chgPct:-0.22, prefix:'₹', decimals:2, heroId:null },
  { sym:'TCS.NS',       label:'TCS',        price:3950,  chgPct:0.55,  prefix:'₹', decimals:2, heroId:null },
  { sym:'INFY.NS',      label:'INFOSYS',    price:1690,  chgPct:1.10,  prefix:'₹', decimals:2, heroId:null },
  { sym:'SBIN.NS',      label:'SBI',        price:780,   chgPct:1.30,  prefix:'₹', decimals:2, heroId:null },
  { sym:'ICICIBANK.NS', label:'ICICI',      price:1320,  chgPct:-0.18, prefix:'₹', decimals:2, heroId:null },
  { sym:'BAJFINANCE.NS',label:'BAJAJ FIN',  price:8900,  chgPct:0.90,  prefix:'₹', decimals:2, heroId:null },
  { sym:'WIPRO.NS',     label:'WIPRO',      price:560,   chgPct:0.40,  prefix:'₹', decimals:2, heroId:null },
];

let usdInrLive = 84.50;
let isMarketOpen = false;

// ── FORMAT PRICE ──────────────────────────────────────────────────
function fmtPrice(price, prefix, decimals) {
  if (!price && price !== 0) return prefix + '---';
  if (price >= 10000) return prefix + Math.round(price).toLocaleString('en-IN');
  if (decimals === 0) return prefix + Math.round(price).toLocaleString('en-IN');
  return prefix + Number(price).toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

// ── FETCH WITH TIMEOUT ────────────────────────────────────────────
async function tFetch(url, ms = 8000) {
  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, mode: 'cors' });
    clearTimeout(tid);
    return r;
  } catch(e) { clearTimeout(tid); throw e; }
}

// ── STRATEGY 1 : allorigins ───────────────────────────────────────
async function tryAllorigins(syms) {
  const base = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${syms}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,marketState`;
  const url  = `https://api.allorigins.win/get?url=${encodeURIComponent(base)}`;
  const res  = await tFetch(url);
  if (!res.ok) throw new Error('allorigins not ok');
  const wrap = await res.json();
  const data = typeof wrap.contents === 'string' ? JSON.parse(wrap.contents) : wrap.contents;
  const list = data?.quoteResponse?.result;
  if (!list?.length) throw new Error('empty');
  return list;
}

// ── STRATEGY 2 : corsproxy.io ─────────────────────────────────────
async function tryCorsproxy(syms) {
  const base = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${syms}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,marketState`;
  const url  = `https://corsproxy.io/?${encodeURIComponent(base)}`;
  const res  = await tFetch(url);
  if (!res.ok) throw new Error('corsproxy not ok');
  const data = await res.json();
  const list = data?.quoteResponse?.result;
  if (!list?.length) throw new Error('empty');
  return list;
}

// ── STRATEGY 3 : thingproxy ──────────────────────────────────────
async function tryThingproxy(syms) {
  const base = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${syms}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent`;
  const url  = `https://thingproxy.freeboard.io/fetch/${base}`;
  const res  = await tFetch(url);
  if (!res.ok) throw new Error('thingproxy not ok');
  const data = await res.json();
  const list = data?.quoteResponse?.result;
  if (!list?.length) throw new Error('empty');
  return list;
}

// ── STRATEGY 4 : Yahoo Finance v8 chart endpoint ──────────────────
// Fetches one symbol at a time — slower but different endpoint
async function tryYahooV8Single(sym) {
  const url = `https://api.allorigins.win/get?url=${encodeURIComponent(
    `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`
  )}`;
  const res  = await tFetch(url);
  if (!res.ok) throw new Error('v8 not ok');
  const wrap = await res.json();
  const data = typeof wrap.contents === 'string' ? JSON.parse(wrap.contents) : wrap.contents;
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error('no meta');
  return {
    symbol: sym,
    regularMarketPrice: meta.regularMarketPrice,
    regularMarketChange: meta.regularMarketPrice - meta.chartPreviousClose,
    regularMarketChangePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
    marketState: meta.currentTradingPeriod ? 'REGULAR' : 'CLOSED',
  };
}

// ── STRATEGY 5 : Stooq (works without CORS proxy!) ───────────────
// Stooq returns CSV and allows CORS — great for Indian indices
async function tryStooq() {
  const stooqSymbols = {
    '^NSEI':    '^nsei.in',  // NIFTY 50
    '^BSESN':   '^bsesn.in', // SENSEX
    'USDINR=X': 'usd_inr.fx',
  };

  const results = [];
  for (const [yahooSym, stooqSym] of Object.entries(stooqSymbols)) {
    try {
      const url = `https://stooq.com/q/l/?s=${stooqSym}&f=sd2t2ohlcvn&h&e=csv`;
      const res = await tFetch(url, 6000);
      if (!res.ok) continue;
      const csv = await res.text();
      const lines = csv.trim().split('\n');
      if (lines.length < 2) continue;
      const cols = lines[1].split(',');
      // CSV: Symbol,Date,Time,Open,High,Low,Close,Volume,Name
      const close  = parseFloat(cols[6]);
      const open   = parseFloat(cols[3]);
      if (isNaN(close)) continue;
      const chg    = close - open;
      const chgPct = (chg / open) * 100;
      results.push({
        symbol: yahooSym,
        regularMarketPrice: close,
        regularMarketChange: chg,
        regularMarketChangePercent: chgPct,
        marketState: 'REGULAR',
      });
    } catch(_) {}
  }
  if (!results.length) throw new Error('stooq empty');
  return results;
}

// ── MASTER FETCH: tries all strategies in order ───────────────────
async function fetchLiveData() {
  const syms = MARKET_SYMBOLS.map(s => encodeURIComponent(s.sym)).join(',');

  const strategies = [
    { name: 'AllOrigins',  fn: () => tryAllorigins(syms)  },
    { name: 'CorsProxy',   fn: () => tryCorsproxy(syms)   },
    { name: 'ThingProxy',  fn: () => tryThingproxy(syms)  },
    { name: 'Stooq (CSV)', fn: () => tryStooq()            },
  ];

  for (const strategy of strategies) {
    try {
      console.log(`[Markets] Trying ${strategy.name}...`);
      const results = await strategy.fn();
      console.log(`[Markets] ✅ ${strategy.name} succeeded! Got ${results.length} quotes.`);
      return results;
    } catch (e) {
      console.warn(`[Markets] ❌ ${strategy.name} failed:`, e.message);
    }
  }

  // All failed — try fetching key symbols one by one via v8 endpoint
  try {
    console.log('[Markets] Trying Yahoo v8 individual symbol fetch...');
    const keySyms = ['^NSEI', '^BSESN', 'USDINR=X', 'GC=F'];
    const results = await Promise.allSettled(keySyms.map(tryYahooV8Single));
    const good = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    if (good.length > 0) {
      console.log(`[Markets] ✅ v8 partial success: ${good.length} symbols`);
      return good;
    }
  } catch(_) {}

  console.warn('[Markets] ⚠️ All strategies failed — using fallback data');
  return null;
}

// ── PROCESS API RESULTS → NORMALIZED ARRAY ────────────────────────
function processResults(apiResults) {
  const usdRes = apiResults.find(r => r.symbol === 'USDINR=X');
  if (usdRes?.regularMarketPrice) usdInrLive = usdRes.regularMarketPrice;

  const nsei = apiResults.find(r => r.symbol === '^NSEI');
  isMarketOpen = nsei?.marketState === 'REGULAR';

  // Build output: for each configured symbol, try to find API result
  return MARKET_SYMBOLS.map(cfg => {
    const r = apiResults.find(res => res.symbol === cfg.sym);

    // If no API data for this symbol, use fallback value for it
    if (!r) {
      const fb = FALLBACK.find(f => f.sym === cfg.sym);
      return fb ? { ...fb } : null;
    }

    let price  = r.regularMarketPrice;
    let prefix = cfg.prefix;
    let decs   = cfg.decimals;

    // Gold: Yahoo gives USD/oz → convert to ₹/10g
    if (cfg.isGold) {
      price  = Math.round((price * usdInrLive) / 31.1035 * 10);
      prefix = '₹';
      decs   = 0;
    }

    return {
      sym:    cfg.sym,
      label:  cfg.label,
      price,
      chgPct: r.regularMarketChangePercent ?? 0,
      prefix,
      decimals: decs,
      heroId: cfg.heroId,
    };
  }).filter(Boolean);
}

// ── RENDER TICKER ─────────────────────────────────────────────────
function renderTicker(items) {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  const html = items.map(item => {
    const up = item.chgPct >= 0;
    return `<div class="ticker-item">
      <span class="sym">${item.label}</span>
      <span class="prc">${fmtPrice(item.price, item.prefix, item.decimals)}</span>
      <span class="chg ${up?'up':'down'}">${up?'▲':'▼'} ${Math.abs(item.chgPct).toFixed(2)}%</span>
    </div>`;
  }).join('');
  track.innerHTML = html + html; // Double → seamless CSS scroll
}

// ── UPDATE HERO CARD ──────────────────────────────────────────────
function updateHeroStats(items) {
  items.forEach(item => {
    if (!item.heroId) return;
    const card = document.getElementById(item.heroId);
    if (!card) return;
    const valEl = card.querySelector('.hero-stat-val');
    const chgEl = card.querySelector('.hero-stat-change');
    const up    = item.chgPct >= 0;
    const sign  = up ? '+' : '';
    if (valEl) {
      valEl.textContent = fmtPrice(item.price, item.prefix, item.decimals);
      valEl.className   = `hero-stat-val ${up?'up':'down'}`;
    }
    if (chgEl) {
      chgEl.textContent = `${up?'▲':'▼'} ${sign}${item.chgPct.toFixed(2)}%`;
      chgEl.className   = `hero-stat-change ${up?'up':'down'}`;
    }
  });
}

// ── SET STATUS DOT & TOOLTIP ──────────────────────────────────────
function setLiveStatus(live) {
  const dot    = document.querySelector('.live-dot');
  const liveEl = document.querySelector('.hero-card-live');
  const now    = new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:true});
  if (dot)    dot.style.background = live ? '#00D68F' : '#FFD700';
  if (liveEl) liveEl.setAttribute('title',
    `${live ? '🟢 Live prices' : '🟡 Demo prices (API offline)'} · ${now}`);
}

// ── LOADING PLACEHOLDER ───────────────────────────────────────────
function showLoading() {
  const track = document.getElementById('tickerTrack');
  if (track && !track.innerHTML.includes('ticker-item')) {
    const items = Array(6).fill(
      `<div class="ticker-item">
        <span class="sym" style="color:var(--gold)">⏳</span>
        <span class="prc" style="color:var(--t3)">Loading live data...</span>
      </div>`
    ).join('');
    track.innerHTML = items;
  }
}

const EDUCATIONAL_TIPS = [
  "📈 SIP Tip: Start early to maximize the power of compounding. Small monthly investments can build huge wealth!",
  "💡 Diversification: Never put all your eggs in one basket. Divide your investments across stocks, mutual funds, and gold.",
  "🎥 Wealth Creator: Subscribe to our YouTube channel for weekly videos explaining stock market and personal finance in Telugu.",
  "🛡️ Insurance: Secure your family's future with a Term Insurance and Health Insurance plan before starting to invest.",
  "📢 Market Hours: Indian Stock Market is open from Monday to Friday, 9:15 AM to 3:30 PM IST.",
  "❌ Avoid Scams: Wealth Creator never asks for money or provides stock tips on WhatsApp or Telegram. Beware of fake accounts!",
  "📊 Mutual Funds: Prefer Direct Mutual Funds over Regular Funds to save commission charges and earn 1-2% higher returns.",
];

function checkIndianMarketOpen() {
  try {
    const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    const dict = {};
    parts.forEach(p => dict[p.type] = p.value);
    
    const day = dict.weekday; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
    const hr = parseInt(dict.hour, 10);
    const min = parseInt(dict.minute, 10);
    
    // Weekend check
    if (day === 'Sat' || day === 'Sun') return false;
    
    // Trading hours: 9:15 AM to 3:30 PM (9:15 to 15:30)
    const currentMins = hr * 60 + min;
    const openMins = 9 * 60 + 15;
    const closeMins = 15 * 60 + 30;
    
    return currentMins >= openMins && currentMins <= closeMins;
  } catch (e) {
    return false;
  }
}

function updateMarketStatusDisplay() {
  const liveTag = document.getElementById('marketLiveTag');
  const liveText = document.getElementById('marketLiveText');
  if (!liveTag || !liveText) return;

  const isOpen = checkIndianMarketOpen();
  if (isOpen) {
    liveTag.classList.remove('closed');
    liveText.textContent = 'MARKET OPEN';
  } else {
    liveTag.classList.add('closed');
    liveText.textContent = 'MARKET CLOSED';
  }
}

function renderEducationalTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  const html = EDUCATIONAL_TIPS.map(tip => {
    return `<div class="ticker-item" style="max-width: none; margin-right: 50px;">
      <span class="prc" style="color: var(--t1); font-weight: 500; white-space: nowrap;">${tip}</span>
    </div>`;
  }).join('');
  track.innerHTML = html + html; // Double for seamless scroll
}

function updateHeroStatsUnavailable() {
  const ids = ['heroNifty', 'heroSensex', 'heroGold', 'heroUsdInr'];
  ids.forEach(id => {
    const card = document.getElementById(id);
    if (!card) return;
    const valEl = card.querySelector('.hero-stat-val');
    const chgEl = card.querySelector('.hero-stat-change');
    if (valEl) {
      valEl.textContent = 'Offline';
      valEl.className = 'hero-stat-val';
      valEl.style.color = 'var(--t3)';
    }
    if (chgEl) {
      chgEl.textContent = 'API Offline';
      chgEl.className = 'hero-stat-change';
      chgEl.style.color = 'var(--t3)';
    }
  });
}

// ── MAIN UPDATE LOOP ──────────────────────────────────────────────
async function updateMarketData() {
  showLoading();
  updateMarketStatusDisplay();
  const apiResults = await fetchLiveData();

  if (apiResults) {
    const items = processResults(apiResults);
    renderTicker(items);
    updateHeroStats(items);
    setLiveStatus(true);
  } else {
    // API Failed or offline: Do not display hardcoded stock prices!
    renderEducationalTicker();
    updateHeroStatsUnavailable();
    setLiveStatus(false);
  }
}

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateMarketData();
  updateMarketStatusDisplay();
  setInterval(updateMarketData, 5 * 60 * 1000);           // refresh every 5 min
  setInterval(updateMarketStatusDisplay, 60 * 1000);       // check status every minute
  document.addEventListener('visibilitychange', () => {   // refresh on tab focus
    if (!document.hidden) {
      updateMarketData();
      updateMarketStatusDisplay();
    }
  });
});
