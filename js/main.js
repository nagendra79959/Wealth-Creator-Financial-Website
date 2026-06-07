/* ================================================================
   WEALTH CREATOR — Core JavaScript
   Navbar, Dark Mode, Counters, FAQ, Search, Trending Tabs, etc.
================================================================ */

// ── SUBSTACK CONFIGURATION ─────────────────────────────────────────
window.SUBSTACK_SUBDOMAIN = 'wealthcreatortelugu'; // Change this to your actual Substack subdomain

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
  const saved = localStorage.getItem('wc-theme') || 'dark';
  applyTheme(saved);

  btn?.addEventListener('click',()=>{
    const current = document.documentElement.getAttribute('data-theme');
    const next = current==='dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('wc-theme', next);
  });
}

function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if(btn) btn.textContent = theme==='dark' ? '☀️' : '🌙';
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

/* ── SMOOTH ANCHOR SCROLL ────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if(el){
      e.preventDefault();
      const offset = document.getElementById('navbar')?.offsetHeight || 80;
      window.scrollTo({top: el.offsetTop - offset - 10, behavior:'smooth'});
    }
  });
});
