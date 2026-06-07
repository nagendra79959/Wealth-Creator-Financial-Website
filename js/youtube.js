/* ================================================================
   WEALTH CREATOR — YouTube & Content Data Module
   Handles video/article data and rendering
================================================================ */

// ── VIDEO DATA ────────────────────────────────────────────────────
window.videoData = [
  {
    id:1,
    title:"Nifty 50 లో పెట్టుబడి ఎలా పెట్టాలి? | Beginners Complete Guide Telugu",
    category:"Stock Market",
    emoji:"📈",
    views:"2.4L",
    duration:"15:32",
    date:"2 days ago",
    url:"https://www.youtube.com/@WealthCreatorOfficial",
    bg:"linear-gradient(135deg,#0d1b4e 0%,#1a2d8a 100%)"
  },
  {
    id:2,
    title:"₹1000 SIP తో Crorepati ఎలా అవ్వాలి? | SIP Calculator & Strategy",
    category:"SIP Investment",
    emoji:"💰",
    views:"3.8L",
    duration:"18:45",
    date:"5 days ago",
    url:"https://www.youtube.com/@WealthCreatorOfficial",
    bg:"linear-gradient(135deg,#0d3a1a 0%,#1a7a3a 100%)"
  },
  {
    id:3,
    title:"Best Mutual Funds 2024 | Top 5 Funds Telugu లో | High Returns",
    category:"Mutual Funds",
    emoji:"📊",
    views:"1.9L",
    duration:"22:10",
    date:"1 week ago",
    url:"https://www.youtube.com/@WealthCreatorOfficial",
    bg:"linear-gradient(135deg,#3a0d0d 0%,#8a2d2d 100%)"
  },
  {
    id:4,
    title:"Dividend Income Strategy | Monthly Passive Income from Stocks",
    category:"Dividend Stocks",
    emoji:"💎",
    views:"1.2L",
    duration:"16:28",
    date:"2 weeks ago",
    url:"https://www.youtube.com/@WealthCreatorOfficial",
    bg:"linear-gradient(135deg,#0d2233 0%,#1a5880 100%)"
  },
  {
    id:5,
    title:"PM Yojanas 2024 | Government Schemes Complete Guide Telugu లో",
    category:"Government Schemes",
    emoji:"🏛️",
    views:"4.5L",
    duration:"12:55",
    date:"3 weeks ago",
    url:"https://www.youtube.com/@WealthCreatorOfficial",
    bg:"linear-gradient(135deg,#250d3a 0%,#5a2d8a 100%)"
  },
  {
    id:6,
    title:"Tax Save చేయండి | Section 80C Complete Guide | Save ₹1.5L Tax",
    category:"Tax Saving",
    emoji:"🧾",
    views:"5.1L",
    duration:"20:15",
    date:"1 month ago",
    url:"https://www.youtube.com/@WealthCreatorOfficial",
    bg:"linear-gradient(135deg,#3a280d 0%,#8a5c2d 100%)"
  },
  {
    id:7,
    title:"Term Insurance vs Endowment | Which is Better? Insurance Guide",
    category:"Insurance",
    emoji:"🛡️",
    views:"98K",
    duration:"19:40",
    date:"1 month ago",
    url:"https://www.youtube.com/@WealthCreatorOfficial",
    bg:"linear-gradient(135deg,#0d3333 0%,#1a7a7a 100%)"
  },
  {
    id:8,
    title:"Personal Finance Tips | Budget Manage ఎలా చేయాలి? | Money Management",
    category:"Personal Finance",
    emoji:"👛",
    views:"2.1L",
    duration:"17:20",
    date:"5 weeks ago",
    url:"https://www.youtube.com/@WealthCreatorOfficial",
    bg:"linear-gradient(135deg,#2a1a3a 0%,#6a3a8a 100%)"
  }
];

// ── ARTICLE DATA ──────────────────────────────────────────────────
window.articleData = [
  {
    id:1,
    title:"SIP Investment Guide: ₹500 తో మొదలుపెట్టండి | Complete Beginner's Guide",
    category:"SIP Investment",
    type:"Article",
    emoji:"📰",
    url:"article-sip.html",
    date:"June 3, 2026",
    readTime:"8 min read",
    excerpt:"SIP (Systematic Investment Plan) అనేది చిన్న మొత్తాలతో సంపద నిర్మించే అత్యుత్తమ మార్గం. నెలకు కేవలం ₹500 తో మొదలుపెట్టి, దీర్ఘకాలంలో లక్షలు సంపాదించవచ్చు.",
    img:"assets/images/article-sip.jpg"
  },
  {
    id:2,
    title:"Stock Market Basics: మీ మొదటి Investment ముందు ఇవి తెలుసుకోండి",
    category:"Stock Market",
    type:"Article",
    emoji:"📰",
    url:"article-stocks.html",
    date:"May 28, 2026",
    readTime:"10 min read",
    excerpt:"Stock market లో invest చేయాలనుకుంటున్నారా? ముందుగా ఈ basic concepts అర్థం చేసుకోవడం చాలా అవసరం. Demat account నుండి stock selection వరకు complete guide.",
    img:"assets/images/article-stocks.jpg"
  },
  {
    id:3,
    title:"Section 80C Investment Options | Best Tax Saving Instruments 2024",
    category:"Tax Saving",
    type:"Article",
    emoji:"📰",
    url:"article-tax.html",
    date:"May 20, 2026",
    readTime:"7 min read",
    excerpt:"ఈ financial year లో ₹1.5 లక్షల వరకు tax save చేయవచ్చు Section 80C ద్వారా. ELSS, PPF, NPS, NSC — ఏది మీకు best option? Complete comparison guide.",
    img:"assets/images/article-tax.jpg"
  },
  {
    id:4,
    title:"Best Mutual Funds 2024 | Top Performing Funds Telugu లో | High Returns",
    category:"Mutual Funds",
    type:"Article",
    emoji:"📊",
    url:"article-mutual-funds.html",
    date:"May 15, 2026",
    readTime:"9 min read",
    excerpt:"2024 లో best performing mutual funds ఏవి? ELSS, Large Cap, Mid Cap, Small Cap — ఏది choose చేయాలి? Risk మరియు returns బట్టి right fund ఎలా select చేయాలో తెలుసుకోండి.",
    img:"assets/images/article-mutual-funds.png"
  },
  {
    id:5,
    title:"PM Government Schemes 2024 | PPF, NPS, Sukanya Complete Guide Telugu",
    category:"Government Schemes",
    type:"Article",
    emoji:"🏛️",
    url:"article-govt-schemes.html",
    date:"May 8, 2026",
    readTime:"12 min read",
    excerpt:"Government-backed investment schemes అన్నీ ఒక చోట. PPF, NPS, Sukanya Samriddhi, PM Yojanas — benefits, eligibility, apply ఎలా చేయాలో simple Telugu లో.",
    img:"assets/images/article-govt-schemes.png"
  },
  {
    id:6,
    title:"Personal Finance Basics | Budget Manage ఎలా చేయాలి? | 50-30-20 Rule",
    category:"Personal Finance",
    type:"Article",
    emoji:"👛",
    url:"article-personal-finance.html",
    date:"May 1, 2026",
    readTime:"6 min read",
    excerpt:"Personal finance అంటే ఏమిటి? Budget plan ఎలా చేయాలి? 50-30-20 rule అంటే ఏమిటి? Emergency fund, debt management — మీ financial life transform చేయండి.",
    img:"assets/images/article-personal-finance.png"
  }
];


// ── CATEGORY FILTER ──────────────────────────────────────────────
// NOTE: Category filtering is handled by filterVideosByCategory() in youtube-api.js
// This renderVideos() function is kept as fallback only (when API fails)

// ── RENDER VIDEOS ─────────────────────────────────────────────────
function renderVideos(filter){
  const grid = document.getElementById('videoGrid');
  if(!grid) return;
  const filtered = filter==='All'
    ? window.videoData
    : window.videoData.filter(v=>v.category===filter);

  if(filtered.length===0){
    grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--t3);">
      <div style="font-size:3rem;margin-bottom:12px;">🔍</div>
      <p>No videos in this category yet. Check back soon!</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(v => {
    const videoUrl = `https://www.youtube.com/results?search_query=Wealth+Creator+` + encodeURIComponent(v.title);
    return `
    <div class="video-card reveal" data-cat="${v.category}">
      <div class="video-thumb">
        <div class="v-thumb-ph" style="background:${v.bg};">
          <span style="font-size:3rem;">${v.emoji}</span>
          <span style="font-size:.68rem;color:rgba(255,255,255,.55);font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${v.category}</span>
        </div>
        <span class="v-duration">${v.duration}</span>
        <div class="v-play-overlay">
          <div class="v-play-btn">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      <div class="video-info">
        <span class="v-tag">${v.emoji} ${v.category}</span>
        <h3 class="v-title">${v.title}</h3>
        <div class="v-meta">
          <span>👁️ ${v.views} views</span>
          <span>📅 ${v.date}</span>
        </div>
      </div>
      <div class="video-cta">
        <a href="${videoUrl}" target="_blank" rel="noopener" class="btn-watch">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.58 6.19a2.51 2.51 0 0 0-1.77-1.77C18.25 4 12 4 12 4s-6.25 0-7.81.42a2.51 2.51 0 0 0-1.77 1.77C2 7.75 2 12 2 12s0 4.25.42 5.81a2.51 2.51 0 0 0 1.77 1.77C5.75 20 12 20 12 20s6.25 0 7.81-.42a2.51 2.51 0 0 0 1.77 1.77C22 16.25 22 12 22 12s0-4.25-.42-5.81zM10 15.46V8.54L16 12l-6 3.46z"/>
          </svg>
          Watch on YouTube
        </a>
      </div>
    </div>
  `}).join('');

  // Trigger scroll reveal for new cards
  requestAnimationFrame(()=>{
    grid.querySelectorAll('.reveal').forEach(el=>{
      const io = new IntersectionObserver(entries=>{
        entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible') });
      },{threshold:.1});
      io.observe(el);
    });
  });
}

// ── RENDER TRENDING VIDEOS (Most Viewed) ─────────────────────────
window.renderTrendingVideos = function(apiVideos) {
  const el = document.getElementById('trendingVideosList');
  if(!el) return;

  let sorted = [];
  if (apiVideos && apiVideos.length) {
    // Sort real live videos by views (descending)
    sorted = [...apiVideos]
      .sort((a, b) => parseInt(b.viewCount || 0) - parseInt(a.viewCount || 0))
      .slice(0, 6);
  } else {
    // Sort mock fallback data
    sorted = [...window.videoData].sort((a,b)=>{
      const parse = s=>{
        if(s.includes('L')) return parseFloat(s)*100000;
        if(s.includes('K')) return parseFloat(s)*1000;
        return parseFloat(s);
      };
      return parse(b.views)-parse(a.views);
    });
  }

  el.innerHTML = sorted.map((v,i)=>{
    const videoUrl = (v.url && !v.url.includes('@')) 
      ? v.url 
      : `https://www.youtube.com/results?search_query=Wealth+Creator+` + encodeURIComponent(v.title);
    
    let viewsText = '—';
    if (v.views) {
      viewsText = v.views;
    } else if (v.viewCount) {
      viewsText = typeof fmtViews === 'function' ? fmtViews(v.viewCount) : v.viewCount;
    }

    let durationText = '';
    if (v.duration) {
      durationText = v.duration.startsWith('PT') ? (typeof fmtDuration === 'function' ? fmtDuration(v.duration) : v.duration) : v.duration;
    }

    let thumbHtml = `<div class="t-thumb-ph">${v.emoji || '📹'}</div>`;
    if (v.thumbnail) {
      thumbHtml = `
        <div class="t-thumb-api" style="width:44px;height:44px;border-radius:8px;flex-shrink:0;overflow:hidden;background:#111;">
          <img src="${v.thumbnail}" alt="${v.title}" style="width:100%;height:100%;object-fit:cover;">
        </div>`;
    }

    return `
      <div class="trending-item" onclick="window.open('${videoUrl}','_blank')" style="cursor:pointer;" title="Watch: ${v.title}">
        <div class="t-rank ${i<3?'top':''}">${i+1}</div>
        ${thumbHtml}
        <div class="t-info">
          <div class="t-title">${v.title}</div>
          <div class="t-meta">
            <span>👁️ ${viewsText} views</span>
            ${durationText ? `<span>⏱️ ${durationText}</span>` : ''}
            <span>📂 ${v.category || (typeof getCategoryFromTitle === 'function' ? getCategoryFromTitle(v.title).label : 'Finance')}</span>
          </div>
        </div>
        <div style="flex-shrink:0;color:var(--t3);font-size:.75rem;padding-right:4px;">↗</div>
      </div>`;
  }).join('');
};

// ── RENDER TRENDING ───────────────────────────────────────────────
function renderTrending(){
  // Populate Most Viewed
  window.renderTrendingVideos(null);

  // Popular Articles trending
  const artEl = document.getElementById('trendingArticlesList');
  if(artEl){
    artEl.innerHTML = window.articleData.map((a,i)=>`
      <div class="trending-item" onclick="window.open('${a.url}','_blank')" style="cursor:pointer;">
        <div class="t-rank ${i<3?'top':''}">${i+1}</div>
        <div class="t-thumb-ph">📰</div>
        <div class="t-info">
          <div class="t-title">${a.title}</div>
          <div class="t-meta">
            <span>📂 ${a.category}</span>
            <span>⏱️ ${a.readTime}</span>
            <span>📅 ${a.date}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Recent Uploads — use real API data if available, else mock
  renderRecentUploads(null);
}

// ── RENDER RECENT UPLOADS (called with real API data from youtube-api.js) ──
window.renderRecentUploads = function(apiVideos) {
  const recEl = document.getElementById('trendingRecentList');
  if (!recEl) return;

  // Use real API data if provided, else mock
  if (apiVideos && apiVideos.length) {
    recEl.innerHTML = apiVideos.slice(0, 6).map((v, i) => `
      <div class="trending-item" onclick="window.open('${v.url}','_blank')" style="cursor:pointer;"
           title="Watch: ${v.title}">
        <div class="t-rank">${i+1}</div>
        <div class="t-thumb-api" style="
          width:44px;height:44px;border-radius:8px;flex-shrink:0;overflow:hidden;
          background:#111;
        ">
          <img src="${v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/default.jpg`}"
               alt="${v.title}"
               style="width:100%;height:100%;object-fit:cover;"
               onerror="this.parentElement.innerHTML='📹'">
        </div>
        <div class="t-info">
          <div class="t-title">${v.title}</div>
          <div class="t-meta">
            <span>👁️ ${v.viewCount ? (parseInt(v.viewCount)>=1000?(parseInt(v.viewCount)/1000).toFixed(1)+'K':v.viewCount) : '—'} views</span>
            <span>📅 ${v.publishedAt ? new Date(v.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : ''}</span>
            ${v.isShort ? '<span style="color:#FF6B7A;font-size:.7rem;font-weight:700;">📱 Short</span>' : ''}
          </div>
        </div>
        <div style="flex-shrink:0;color:var(--t3);font-size:.75rem;padding-right:4px;">↗</div>
      </div>
    `).join('');
  } else {
    // Fallback to mock data
    const recent = window.videoData.slice(0, 5);
    recEl.innerHTML = recent.map((v, i) => {
      const videoUrl = `https://www.youtube.com/results?search_query=Wealth+Creator+` + encodeURIComponent(v.title);
      return `
      <div class="trending-item" onclick="window.open('${videoUrl}','_blank')" style="cursor:pointer;">
        <div class="t-rank">${i+1}</div>
        <div class="t-thumb-ph">${v.emoji}</div>
        <div class="t-info">
          <div class="t-title">${v.title}</div>
          <div class="t-meta">
            <span>👁️ ${v.views} views</span>
            <span>⏱️ ${v.duration}</span>
            <span>🆕 ${v.date}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }
};



// ── RENDER ARTICLES ───────────────────────────────────────────────
function renderArticles(){
  const grid = document.getElementById('articlesGrid');
  if(!grid) return;

  // Show only latest 3 on homepage; all 6 available on articles.html
  const toShow = window.articleData.slice(0, 3);

  grid.innerHTML = toShow.map(a=>`
    <article class="article-card reveal"
             onclick="window.open('${a.url}','_blank')"
             role="button" tabindex="0"
             style="cursor:pointer;"
             onkeydown="if(event.key==='Enter')window.open('${a.url}','_blank')"
             aria-label="Read article: ${a.title}">
      <div class="article-img">
        <img src="${a.img}" alt="${a.title}" loading="lazy"
             onerror="this.parentElement.style.background='linear-gradient(135deg,#0d1b3e 0%,#090e24 100%)';this.style.display='none'">
        <span class="a-cat">${a.category}</span>
      </div>
      <div class="article-body">
        <div class="a-date">📅 ${a.date}</div>
        <h3 class="a-title">${a.title}</h3>
        <p class="a-excerpt">${a.excerpt}</p>
        <div class="article-footer">
          <span class="a-read-time">⏱️ ${a.readTime}</span>
          <a href="${a.url}" target="_blank" rel="noopener"
             onclick="event.stopPropagation()"
             class="btn-readmore">Read More →</a>
        </div>
      </div>
    </article>
  `).join('');
}



// ── INIT ON DOM READY ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  // initCategoryFilter() removed — now handled by youtube-api.js
  renderTrending();
  renderArticles();
});
