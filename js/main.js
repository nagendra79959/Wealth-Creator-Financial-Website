/* ================================================================
   WEALTH CREATOR — Core JavaScript
   Navbar, Dark Mode, Counters, FAQ, Search, Trending Tabs, etc.
================================================================ */

// ── SUBSTACK CONFIGURATION ─────────────────────────────────────────
window.SUBSTACK_SUBDOMAIN = 'wealthcreatortelugu'; // Change this to your actual Substack subdomain

// ── GOOGLE SHEETS DATABASE CONFIGURATION ───────────────────────────
window.GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxPwdoC_TJeRRl7AxtqzsD4jnf09DQsPYBl119FMMj0RKqQm2fwBalNL58yBCyvSQfn/exec';

document.addEventListener('DOMContentLoaded', () => {
  // NOTE: Ticker is now handled by js/market.js (live data)
  initNavbar();
  initMobileMenu();
  initTheme();
  initScrollReveal();
  initCounters();
  initFAQ();
  initTrendingTabs();
  initScrollTop();
  initSearch();
  initNewsletter();
  initShareButtons();
  initSmoothScroll();
  initScrollSpy();
  initViewerReviews();
});

/* ── STOCK TICKER ────────────────────────────────────────────────────
   Ticker is now managed by js/market.js with LIVE Yahoo Finance data.
   This static version is kept only as a last-resort backup reference.
─────────────────────────────────────────────────────────────────── */

/* ── STICKY NAVBAR ────────────────────────────────────────────────── */
function initNavbar(){
  const nav = document.getElementById('navbar');
  const subBtn = document.getElementById('navSubBtn');
  if(!nav) return;

  let lastY = 0;
  window.addEventListener('scroll',()=>{
    const y = window.scrollY;
    if(y > 60) nav.classList.add('scrolled');
    else        nav.classList.remove('scrolled');
    if(subBtn){
      if(y > 400) subBtn.style.display = 'flex';
      else         subBtn.style.display = 'none';
    }
    lastY = y;
  },{passive:true});
}

/* ── MOBILE MENU ─────────────────────────────────────────────────── */
function initMobileMenu(){
  const burger = document.getElementById('hamburger');
  const menu   = document.getElementById('mobileMenu');
  if(!burger||!menu) return;

  burger.addEventListener('click',()=>{
    const open = burger.classList.toggle('open');
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click',()=>{
      burger.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── DARK / LIGHT THEME ──────────────────────────────────────────── */
function initTheme(){
  const btn = document.getElementById('themeToggle');
  let saved = 'dark';
  try {
    saved = localStorage.getItem('wc-theme') || 'dark';
  } catch (e) {
    console.warn('[Theme] localStorage is not available, default to dark:', e);
  }
  applyTheme(saved);

  btn?.addEventListener('click',()=>{
    const current = document.documentElement.getAttribute('data-theme');
    const next = current==='dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem('wc-theme', next);
    } catch (e) {
      console.warn('[Theme] localStorage is not available, could not save theme:', e);
    }
  });
}

function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if(btn) btn.textContent = theme==='dark' ? '☀️' : '🌙';
  if(typeof window.renderTradingViewWidget === 'function') {
    window.renderTradingViewWidget(theme);
  }
}

/* ── SCROLL REVEAL ───────────────────────────────────────────────── */
function initScrollReveal(){
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  },{threshold:.12, rootMargin:'0px 0px -40px 0px'});

  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}

/* ── ANIMATED COUNTERS ───────────────────────────────────────────── */
function initCounters(){
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting && !e.target.dataset.counted){
        e.target.dataset.counted='1';
        countUp(e.target);
        io.unobserve(e.target);
      }
    });
  },{threshold:.5});

  document.querySelectorAll('[data-count]').forEach(el=>io.observe(el));
}

function countUp(el){
  const target  = parseFloat(el.dataset.count);
  const suffix  = el.dataset.suffix || '';
  const prefix  = el.dataset.prefix || '';
  const dur     = 2200;
  const start   = performance.now();
  const isFloat = !Number.isInteger(target);

  const tick = now => {
    const p = Math.min((now-start)/dur, 1);
    const e = 1-Math.pow(1-p,3);           // ease-out cubic
    const v = target * e;
    el.textContent = prefix + (isFloat ? v.toFixed(1) : Math.floor(v).toLocaleString('en-IN')) + suffix;
    if(p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ── FAQ ACCORDION ───────────────────────────────────────────────── */
function initFAQ(){
  document.querySelectorAll('.faq-q').forEach(q=>{
    q.addEventListener('click',()=>{
      const item   = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i=>i.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
    });
  });
}

/* ── TRENDING TABS ───────────────────────────────────────────────── */
function initTrendingTabs(){
  const tabs  = document.querySelectorAll('.trending-tab');
  const panes = document.querySelectorAll('.trending-content');

  tabs.forEach(tab=>{
    tab.addEventListener('click',()=>{
      tabs.forEach(t=>t.classList.remove('active'));
      panes.forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab)?.classList.add('active');
    });
  });
}

/* ── SCROLL TO TOP ───────────────────────────────────────────────── */
function initScrollTop(){
  const btn = document.getElementById('scrollTopBtn');
  if(!btn) return;

  window.addEventListener('scroll',()=>{
    btn.classList.toggle('visible', window.scrollY > 500);
  },{passive:true});

  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}

/* ── SEARCH MODAL ────────────────────────────────────────────────── */
function initSearch(){
  const overlay  = document.getElementById('searchOverlay');
  const input    = document.getElementById('searchInput');
  const closeBtn = document.getElementById('searchCloseBtn');
  const searchBtn= document.getElementById('searchBtn');
  const results  = document.getElementById('searchResults');

  const open = ()=>{
    overlay?.classList.add('active');
    setTimeout(()=>input?.focus(), 200);
    document.body.style.overflow='hidden';
  };
  const close = ()=>{
    overlay?.classList.remove('active');
    document.body.style.overflow='';
    if(input) input.value='';
    if(results) results.innerHTML='';
  };

  searchBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', e=>{ if(e.target===overlay) close(); });

  document.addEventListener('keydown', e=>{
    if(e.key==='Escape') close();
    if((e.ctrlKey||e.metaKey) && e.key==='k'){ e.preventDefault(); open(); }
  });

  let timer;
  input?.addEventListener('input',()=>{
    clearTimeout(timer);
    timer = setTimeout(()=>doSearch(input.value.trim(), results), 280);
  });
}

function doSearch(q, container){
  if(!container) return;
  if(!q || q.length<2){ container.innerHTML=''; return; }

  const all = [...(window.videoData||[]),...(window.articleData||[])];
  const hits = all.filter(item => {
    if (!item) return false;
    const title = (item.title || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const type = (item.type || 'Video').toLowerCase();
    const desc = (item.description || item.excerpt || '').toLowerCase();
    const query = q.toLowerCase();

    // Match type with support for plural/singular forms (e.g. 'videos' matches 'video')
    const typeMatches = 
      type.includes(query) || 
      query.includes(type) ||
      (type === 'video' && (query.includes('video') || query === 'videos')) ||
      (type === 'article' && (query.includes('article') || query === 'articles'));

    return title.includes(query) || 
           category.includes(query) || 
           desc.includes(query) || 
           typeMatches;
  });

  if(!hits.length){
    container.innerHTML=`<div style="padding:24px;text-align:center;color:var(--t3);">No results for "<strong>${q}</strong>"</div>`;
    return;
  }

  container.innerHTML = hits.slice(0,8).map(item=>`
    <div class="s-result" onclick="window.open('${item.url||'articles.html'}','_blank')">
      <span style="font-size:1.5rem;flex-shrink:0;">${item.emoji||'📹'}</span>
      <div>
        <div class="s-result-title">${item.title || 'Untitled'}</div>
        <div class="s-result-meta">${item.type||'Video'} &bull; ${item.category || 'General'}</div>
      </div>
    </div>
  `).join('');
}

function initNewsletter(){
  const form = document.getElementById('newsletterForm');
  form?.addEventListener('submit', e=>{
    e.preventDefault();
    const input = form.querySelector('input[type=email]');
    const em = input ? input.value.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Reset error styling
    form.classList.remove('form-error');

    if(!em || !emailRegex.test(em)){
      showToast('❌ Invalid email! Please enter a valid email address.', 'error');
      form.classList.add('form-error');
      setTimeout(() => form.classList.remove('form-error'), 400);
      return;
    }

    // Submit directly to Substack using a programmatic POST form
    const tempForm = document.createElement('form');
    tempForm.action = `https://${window.SUBSTACK_SUBDOMAIN || 'wealthcreatortelugu'}.substack.com/email`;
    tempForm.method = 'post';
    tempForm.target = '_blank'; // Opens in a new tab so they stay on our site

    const emailInput = document.createElement('input');
    emailInput.type = 'hidden';
    emailInput.name = 'email';
    emailInput.value = em;
    tempForm.appendChild(emailInput);

    const urlInput = document.createElement('input');
    urlInput.type = 'hidden';
    urlInput.name = 'first_url';
    urlInput.value = window.location.href;
    tempForm.appendChild(urlInput);

    document.body.appendChild(tempForm);
    tempForm.submit();
    document.body.removeChild(tempForm);

    // Save to Google Sheets database
    if (window.GOOGLE_SHEETS_URL) {
      fetch(window.GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'newsletter',
          email: em,
          source: 'Homepage Newsletter'
        })
      }).catch(err => console.error('Error saving to Google Sheets:', err));
    }

    showToast('✅ Substack opened! Confirm subscription in the new tab.');
    form.reset();
  });
}

/* ── SHARE BUTTONS ───────────────────────────────────────────────── */
function initShareButtons(){
  document.querySelectorAll('[data-share]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const type = btn.dataset.share;
      const url  = encodeURIComponent(window.location.href);
      const txt  = encodeURIComponent('Check out Wealth Creator — Best Telugu Finance Channel!');
      const links={
        twitter:`https://twitter.com/intent/tweet?url=${url}&text=${txt}`,
        facebook:`https://www.facebook.com/sharer/sharer.php?u=${url}`,
        whatsapp:`https://api.whatsapp.com/send?text=${txt}%20${url}`,
      };
      if(links[type]) window.open(links[type],'_blank','width=600,height=400');
      if(type==='copy'){
        navigator.clipboard?.writeText(window.location.href)
          .then(()=>showToast('🔗 Link copied to clipboard!'));
      }
    });
  });
}

/* ── TOAST ───────────────────────────────────────────────────────── */
function showToast(msg, type = 'success'){
  const t = document.createElement('div');
  const bg = type === 'error'
    ? 'linear-gradient(135deg, #ff4b5c, #ff2a3b)'
    : 'linear-gradient(135deg,#FFD700,#FFA500)';
  const color = type === 'error' ? '#fff' : '#000';
  const shadow = type === 'error'
    ? '0 8px 32px rgba(255,75,92,.35)'
    : '0 8px 32px rgba(255,215,0,.35)';
  t.style.cssText=`
    position:fixed;bottom:40px;left:50%;
    transform:translateX(-50%) translateY(80px);
    background:${bg};
    color:${color};padding:14px 28px;border-radius:50px;
    font-size:.86rem;font-weight:700;z-index:9999;
    transition:transform .35s cubic-bezier(.34,1.56,.64,1);
    box-shadow:${shadow};
    max-width:90vw;text-align:center;
    font-family:'Poppins',sans-serif;
  `;
  t.textContent=msg;
  document.body.appendChild(t);
  requestAnimationFrame(()=>{ t.style.transform='translateX(-50%) translateY(0)'; });
  setTimeout(()=>{
    t.style.transform='translateX(-50%) translateY(80px)';
    setTimeout(()=>t.remove(), 400);
  }, 4000);
}

/* ── SMOOTH ANCHOR SCROLL & HOME REDIRECT OVERRIDE ───────────────── */
function initSmoothScroll() {
  const path = window.location.pathname;
  const isHomepage = path.endsWith('index.html') || path.endsWith('/') || path === '';

  document.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;

    if (href.startsWith('#')) {
      a.addEventListener('click', e => {
        const id = href.slice(1);
        const el = document.getElementById(id || 'hero');
        if (el) {
          e.preventDefault();
          const offset = document.getElementById('navbar')?.offsetHeight || 80;
          window.scrollTo({ top: el.offsetTop - offset - 10, behavior: 'smooth' });
          
          // Force active state immediately on click
          if (isHomepage) {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            a.classList.add('active');
          }
        }
      });
    } else if ((href === 'index.html' || href === 'index.html#') && isHomepage) {
      a.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Force active state immediately on click
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const homeLinks = document.querySelectorAll('.nav-link[href="index.html"], .nav-link[href="index.html#"]');
        homeLinks.forEach(hl => hl.classList.add('active'));
      });
    }
  });
}

/* ── SCROLL SPY ACTIVE NAVBAR HIGHLIGHTS ─────────────────────────── */
function initScrollSpy() {
  const allNavLinks = document.querySelectorAll('.nav-link');
  const path = window.location.pathname;
  const isHomepage = path.endsWith('index.html') || path.endsWith('/') || path === '';

  if (!isHomepage) {
    allNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && path.includes(href)) {
        link.classList.add('active');
      }
    });
    return;
  }

  const sections = [];
  allNavLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    let targetEl = null;
    if (href.startsWith('#')) {
      targetEl = document.getElementById(href.slice(1));
    } else if (href.includes('#')) {
      const hash = href.split('#')[1];
      targetEl = document.getElementById(hash);
    }
    
    if (!targetEl && (href === 'index.html' || href === 'index.html#')) {
      targetEl = document.getElementById('hero');
    }
    if (!targetEl && href === 'articles.html') {
      targetEl = document.getElementById('articles');
    }
    if (!targetEl && href === 'about.html') {
      targetEl = document.getElementById('about');
    }

    if (targetEl) {
      sections.push({ link, section: targetEl, href });
    }
  });

  function updateActiveLink() {
    let currentActiveHref = null;
    const scrollPos = window.scrollY + (document.getElementById('navbar')?.offsetHeight || 80) + 150;

    for (let i = 0; i < sections.length; i++) {
      const { section, href } = sections[i];
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentActiveHref = href;
      }
    }

    if (window.scrollY < 100) {
      currentActiveHref = 'index.html';
    }

    if (currentActiveHref) {
      allNavLinks.forEach(l => {
        const href = l.getAttribute('href');
        if (href === currentActiveHref || (currentActiveHref === 'index.html' && (href === 'index.html' || href === 'index.html#'))) {
          l.classList.add('active');
        } else {
          l.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}

/* ── VIEWER REVIEWS & TESTIMONIALS SUBMISSION ──────────────────── */
function initViewerReviews() {
  const openBtn = document.getElementById('openReviewBtn');
  const closeBtn = document.getElementById('closeReviewBtn');
  const modal = document.getElementById('reviewModal');
  const form = document.getElementById('reviewForm');
  const starContainer = document.getElementById('starRating');
  const ratingInput = document.getElementById('revRating');
  
  if (!modal) return;

  // 1. Open/Close Modal
  openBtn?.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    form?.reset();
    resetStars();
  };

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // 2. Star Rating Selection
  const stars = starContainer ? starContainer.querySelectorAll('span') : [];
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.value);
      if (ratingInput) ratingInput.value = val;
      updateStars(val);
    });
  });

  function updateStars(rating) {
    stars.forEach(s => {
      const val = parseInt(s.dataset.value);
      s.classList.toggle('active', val <= rating);
    });
  }

  function resetStars() {
    if (ratingInput) ratingInput.value = '5';
    updateStars(5);
  }

  // 3. Form Submission
  form?.addEventListener('submit', e => {
    e.preventDefault();
    
    const name = document.getElementById('revName')?.value.trim();
    const loc = document.getElementById('revLoc')?.value.trim();
    const message = document.getElementById('revMessage')?.value.trim();
    const rating = ratingInput ? ratingInput.value : '5';

    if (!name || !loc || !message) {
      showToast('❌ Please fill in all fields!', 'error');
      return;
    }

    // Save to Google Sheets database in parallel
    if (window.GOOGLE_SHEETS_URL) {
      fetch(window.GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'testimonial',
          name: name,
          location: loc,
          message: message,
          rating: rating
        })
      }).catch(err => console.error('Error saving testimonial:', err));
    }

    // Save to local storage for immediate session display
    let localReviews = [];
    try {
      localReviews = JSON.parse(localStorage.getItem('wc-user-reviews') || '[]');
    } catch {}

    const newReview = {
      name,
      location: loc,
      text: message,
      rating: parseInt(rating),
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    };

    localReviews.unshift(newReview);
    if (localReviews.length > 3) {
      localReviews = localReviews.slice(0, 3);
    }
    try {
      localStorage.setItem('wc-user-reviews', JSON.stringify(localReviews));
    } catch {}

    // Prepend new review card to grid
    renderReviewCard(newReview, true);

    showToast('✅ Thank you! Your review has been recorded.');
    closeModal();
  });

  // Load existing user reviews from localStorage
  loadUserReviews();
}

function renderReviewCard(r, prepend = false) {
  const grid = document.querySelector('.testimonials-grid');
  if (!grid) return;

  const card = document.createElement('div');
  card.className = 'testi-card reveal visible';
  
  // Use a unique style color gradient for user avatars based on name length
  const gradients = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)'
  ];
  const grad = gradients[r.name.length % gradients.length];
  const starsStr = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);

  card.innerHTML = `
    <div class="testi-quote-icon">"</div>
    <p class="testi-text">${r.text}</p>
    <div class="testi-stars" aria-label="${r.rating} stars">${starsStr}</div>
    <div class="testi-author">
      <div class="testi-avatar" style="background:${grad};">${r.avatar || 'U'}</div>
      <div class="testi-info">
        <div class="testi-name">${r.name}</div>
        <div class="testi-location">📍 ${r.location}</div>
      </div>
    </div>
  `;

  if (prepend) {
    grid.insertBefore(card, grid.firstChild);
  } else {
    grid.appendChild(card);
  }

  limitTestimonialsCount();
}

function loadUserReviews() {
  let localReviews = [];
  try {
    localReviews = JSON.parse(localStorage.getItem('wc-user-reviews') || '[]');
  } catch {}
  if (localReviews.length > 3) {
    localReviews = localReviews.slice(0, 3);
    try {
      localStorage.setItem('wc-user-reviews', JSON.stringify(localReviews));
    } catch {}
  }
  // Prepend in reverse order so the most recent is at the absolute top/first position
  localReviews.reverse().forEach(r => renderReviewCard(r, true));
}

function limitTestimonialsCount() {
  const grid = document.querySelector('.testimonials-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.testi-card');
  cards.forEach((card, index) => {
    if (index >= 3) {
      card.remove();
    }
  });
}
