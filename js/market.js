/* ================================================================
   WEALTH CREATOR — Financial Tips & Market Status Module
   Updates top ticker with premium financial tips.
   Manages TradingView widget and live market status.
================================================================ */

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
    
    if (day === 'Sat' || day === 'Sun') return false;
    
    const currentMins = hr * 60 + min;
    const openMins = 9 * 60 + 15;     // 9:15 AM
    const closeMins = 15 * 60 + 30;   // 3:30 PM
    
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
      <span class="sym" style="color: var(--gold); font-size: 0.8rem; font-family: var(--fh); font-weight: 700; margin-right: 6px;">WC TIPS</span>
      <span class="prc" style="color: var(--t1); font-weight: 500; white-space: nowrap;">${tip}</span>
    </div>`;
  }).join('');
  track.innerHTML = html + html; // Double for seamless scroll
}

let lastRenderedTheme = null;

// Global function to dynamically load/reload TradingView widget on theme switch
window.renderTradingViewWidget = function(theme) {
  const container = document.getElementById('tradingview-widget-container');
  if (!container) return;

  if (lastRenderedTheme === theme && container.children.length > 0) {
    console.log('[Market Widget] TradingView widget already rendered for theme:', theme);
    return;
  }

  console.log('[Market Widget] Rendering TradingView widget for theme:', theme);
  lastRenderedTheme = theme;

  // Clear previous
  container.innerHTML = '';

  // Create wrapper with required class
  const wrapper = document.createElement('div');
  wrapper.className = 'tradingview-widget-container';
  wrapper.style.width = '100%';
  wrapper.style.height = '340px';
  wrapper.style.position = 'relative';

  // Create widget div with required class
  const widgetDiv = document.createElement('div');
  widgetDiv.className = 'tradingview-widget-container__widget';
  widgetDiv.style.width = '100%';
  widgetDiv.style.height = '100%';
  
  // Add a beautiful fallback UI visible under file:// protocol or if widget script is blocked
  widgetDiv.innerHTML = `
    <div class="market-fallback-card" style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed rgba(255, 215, 0, 0.2);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      box-sizing: border-box;
    ">
      <div style="font-size: 2.2rem; margin-bottom: 12px;">📊</div>
      <h4 style="font-family: var(--fh); font-size: 0.95rem; color: var(--t1); margin: 0 0 8px 0; font-weight: 700; letter-spacing: 0.5px;">Live Nifty 50 &amp; Sensex</h4>
      <p style="font-size: 0.76rem; color: var(--t2); line-height: 1.5; max-width: 290px; margin: 0 0 16px 0;">
        Live interactive charts require a web server connection. Click the button below to view the real-time indexes directly on TradingView!
      </p>
      <a href="https://in.tradingview.com/symbols/NSE-NIFTY/" target="_blank" rel="noopener nofollow" style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--gold);
        color: #000;
        padding: 8px 18px;
        border-radius: 30px;
        font-size: 0.78rem;
        font-weight: 700;
        text-decoration: none;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.25);
        transition: transform 0.2s, box-shadow 0.2s;
      " onmouseover="this.style.transform='scale(1.03)';" onmouseout="this.style.transform='none';">
        📈 View Live Markets
      </a>
    </div>
  `;
  wrapper.appendChild(widgetDiv);

  // Add a copyright / fallback link under the widget
  const copyright = document.createElement('div');
  copyright.className = 'tradingview-widget-copyright';
  copyright.style.cssText = 'text-align: center; margin-top: 8px; font-size: 0.78rem; font-family: var(--fb);';
  copyright.innerHTML = `<a href="https://in.tradingview.com/symbols/NSE-NIFTY/" rel="noopener nofollow" target="_blank" style="color: var(--t3); text-decoration: none; font-weight: 500;">Track Nifty 50 & Sensex on TradingView</a>`;
  wrapper.appendChild(copyright);

  // Append wrapper to container first BEFORE appending the script tag to maintain DOM context
  container.appendChild(wrapper);

  // Create script tag with config
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
  script.async = true;

  const config = {
    "colorTheme": theme === 'light' ? 'light' : 'dark',
    "dateRange": "12M",
    "showChart": true,
    "locale": "en",
    "largeChartUrl": "",
    "isTransparent": true,
    "showSymbolLogo": true,
    "showFloatingTooltip": false,
    "width": "100%",
    "height": "340",
    "tabs": [
      {
        "title": "Markets",
        "symbols": [
          {
            "s": "FOREXCOM:INDIA50",
            "d": "Nifty 50"
          },
          {
            "s": "BSE:SENSEX",
            "d": "Sensex"
          },
          {
            "s": "FX_IDC:USDINR",
            "d": "USD / INR"
          },
          {
            "s": "FX_IDC:XAUINR",
            "d": "Gold Spot (INR)"
          }
        ]
      }
    ]
  };

  script.text = JSON.stringify(config);
  wrapper.appendChild(script);
};

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderEducationalTicker();
  updateMarketStatusDisplay();
  
  // Render TradingView widget based on the active theme
  const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  window.renderTradingViewWidget(activeTheme);
  
  // Keep status updated
  setInterval(updateMarketStatusDisplay, 60 * 1000);
});
