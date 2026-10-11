(function(){
  const c = document.getElementById('particles');
  if (!c) return;
  const colors = ['#00e5ff','#8b5cf6','#06b6d4','#00ff9d'];
  for(let i = 0; i < 30; i++){
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (12 + Math.random() * 18) + 's';
    p.style.animationDelay = (Math.random() * 15) + 's';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.color = p.style.background;
    const s = 2 + Math.random() * 3;
    p.style.width = s + 'px';
    p.style.height = s + 'px';
    c.appendChild(p);
  }
})();

(function(){
  const nav = document.getElementById('nav');
  const backTop = document.getElementById('backTop');
  if (!nav || !backTop) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 40) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    if (y > 500) backTop.classList.add('show'); else backTop.classList.remove('show');
  }, { passive: true });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

(function(){
  const els = document.querySelectorAll('.reveal, .section-head, .tl-item, .skill-row');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('visible');
        const fill = e.target.querySelector('.skill-fill');
        if (fill){
          const pct = fill.getAttribute('data-pct');
          setTimeout(() => { fill.style.width = pct + '%'; }, 200);
        }
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => io.observe(el));
})();

(function(){
  const counters = document.querySelectorAll('.stat-num');
  if (!counters.length) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      io.unobserve(el);
      const target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;
      let current = 0;
      const step = Math.max(1, Math.floor(target / 30));
      el.textContent = '0';
      const timer = setInterval(() => {
        current += step;
        if (current >= target){ current = target; clearInterval(timer); }
        el.textContent = current;
      }, 40);
      setTimeout(() => { clearInterval(timer); el.textContent = target; }, 2500);
    });
  }, { threshold: 0.3 });
  counters.forEach(c => io.observe(c));
})();

(function(){
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const saved = localStorage.getItem('theme');
  if (saved === 'light'){ document.body.classList.add('light'); btn.textContent = '☀️'; }
  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    btn.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
})();

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (!id || id.length < 2) return;
    const t = document.querySelector(id);
    if (t){ e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); }
  });
});

/* --- RENDER PUBLIC REVIEWS ON PAGE --- */
function renderPublicReviews() {
  const container = document.getElementById('publicReviewsList');
  if (!container) return;
  
  const feedbacks = JSON.parse(localStorage.getItem('portfolioFeedbacks') || '[]');
  
  if (feedbacks.length === 0) {
    container.innerHTML = '<p class="no-reviews-msg">No reviews yet. Be the first to leave one!</p>';
    return;
  }
  
  container.innerHTML = '';
  // Show newest first, limit to 6 for clean layout
  feedbacks.slice().reverse().slice(0, 6).forEach(fb => {
    const starsHtml = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
    const card = document.createElement('div');
    card.className = 'public-review-card';
    card.innerHTML = `
      <div class="public-review-top">
        <span class="public-review-name">${fb.username}</span>
        <span class="public-review-stars">${starsHtml}</span>
      </div>
      <p class="public-review-msg">"${fb.message}"</p>
    `;
    container.appendChild(card);
  });
}

// Call it when the page first loads
document.addEventListener('DOMContentLoaded', renderPublicReviews);

/* --- RATING AND FEEDBACK SIDEBAR LOGIC --- */
(function(){
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('cRating');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = star.getAttribute('data-value');
      ratingInput.value = value;
      stars.forEach(s => {
        s.classList.toggle('active', s.getAttribute('data-value') <= value);
      });
    });
  });

  const sidebar = document.getElementById('feedbackSidebar');
  const openBtn = document.getElementById('openSidebarBtn');
  const closeBtn = document.getElementById('closeSidebarBtn');
  const switchBtn = document.getElementById('switchSideBtn');
  const fbList = document.getElementById('fbList');

  if(!sidebar || !openBtn || !closeBtn) return;

  function loadFeedback() {
    const feedbacks = JSON.parse(localStorage.getItem('portfolioFeedbacks') || '[]');
    if (feedbacks.length === 0) {
      fbList.innerHTML = '<p class="no-fb">No feedback yet. Be the first to leave one!</p>';
      return;
    }
    fbList.innerHTML = '';
    feedbacks.slice().reverse().forEach(fb => {
      const item = document.createElement('div');
      item.className = 'fb-item';
      const starsHtml = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
      item.innerHTML = `
        <div class="fb-top">
          <strong>${fb.username}</strong>
          <span class="fb-stars">${starsHtml}</span>
        </div>
        <p class="fb-msg">${fb.message}</p>
      `;
      fbList.appendChild(item);
    });
  }

  openBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
    document.body.classList.add('sidebar-open');
    if (sidebar.classList.contains('left')) {
      document.body.classList.add('sidebar-left');
    } else {
      document.body.classList.add('sidebar-right');
    }
    loadFeedback();
  });

  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
    document.body.classList.remove('sidebar-open', 'sidebar-left', 'sidebar-right');
  });

  switchBtn.addEventListener('click', () => {
    sidebar.classList.toggle('left');
    if (sidebar.classList.contains('left')) {
      openBtn.style.right = 'auto';
      openBtn.style.left = '36px';
      if (sidebar.classList.contains('open')) {
        document.body.classList.remove('sidebar-right');
        document.body.classList.add('sidebar-left');
      }
    } else {
      openBtn.style.left = 'auto';
      openBtn.style.right = '36px';
      if (sidebar.classList.contains('open')) {
        document.body.classList.remove('sidebar-left');
        document.body.classList.add('sidebar-right');
      }
    }
  });

  loadFeedback();
})();

/* --- CONTACT FORM SUBMISSION --- */
(function(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  const FEEDBACK_ENDPOINT   = 'https://api.web3forms.com/submit';
  const FEEDBACK_ACCESS_KEY = 'e28ddd98-a11d-4068-a9b6-f77c1c586d50'; // Your Key Added Here
  const FALLBACK_EMAIL      = 'raphaelmvigafria@gmail.com';

  const btn    = document.getElementById('contactSubmit');
  const status = document.getElementById('formStatus');
  const btnLabel = btn ? btn.textContent : '';
  const configured = /^[0-9a-f-]{20,}$/i.test(FEEDBACK_ACCESS_KEY);

  function setStatus(msg, kind){
    if (!status) return;
    status.textContent = msg;
    status.className = 'form-status' + (kind ? ' ' + kind : '');
  }
  function setBusy(busy){
    if (!btn) return;
    btn.disabled = busy;
    btn.textContent = busy ? 'Sending…' : btnLabel;
  }
  function openMailApp(username, email, message, rating){
    const subject = encodeURIComponent('Portfolio feedback from ' + username);
    const body = encodeURIComponent('From: ' + username + ' (' + email + ')\nRating: ' + rating + '/5\n\n' + message);
    const a = document.createElement('a');
    a.href = 'mailto:' + FALLBACK_EMAIL + '?subject=' + subject + '&body=' + body;
    document.body.appendChild(a); a.click(); a.remove();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn && btn.disabled) return;

    const username = document.getElementById('cUsername').value.trim();
    const email    = document.getElementById('cEmail').value.trim();
    const message  = document.getElementById('cMsg').value.trim();
    const rating   = document.getElementById('cRating').value;
    const bot      = document.getElementById('cBot');

    if (username.length < 2 || message.length < 5){
      setStatus('Please enter a username and a bit more feedback.', 'err');
      return;
    }
    if (rating === '0') {
      setStatus('Please select a star rating.', 'err');
      return;
    }
    if (bot && bot.checked){ form.reset(); return; }

    // Save to localStorage for the sidebar and public display
    const feedbacks = JSON.parse(localStorage.getItem('portfolioFeedbacks') || '[]');
    feedbacks.push({ username, email, message, rating: parseInt(rating), date: new Date().toISOString() });
    localStorage.setItem('portfolioFeedbacks', JSON.stringify(feedbacks));
    
    // Instantly update the reviews section at the bottom
    renderPublicReviews(); 

    if (!configured){
      console.warn('Contact form: FEEDBACK_ACCESS_KEY is not set, falling back to email app.');
      setStatus('Opening your email app to send this message…', 'ok');
      openMailApp(username, email, message, rating);
      form.reset();
      document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
      document.getElementById('cRating').value = '0';
      return;
    }

    setBusy(true);
    setStatus('Sending your feedback…');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: FEEDBACK_ACCESS_KEY,
          subject: 'Portfolio feedback from ' + username,
          from_name: username,
          username: username,
          email: email,
          message: message,
          rating: rating,
          botcheck: ''
        }),
        signal: ctrl.signal
      });
      let data = {};
      try { data = await res.json(); } catch (_) {}
      if (res.ok && data.success){
        setStatus('Thank you, ' + username + '! Your feedback was sent.', 'ok');
        form.reset();
        document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
        document.getElementById('cRating').value = '0';
      } else {
        throw new Error((data && data.message) || ('HTTP ' + res.status));
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus('Sorry, your feedback could not be sent right now. Please try again later.', 'err');
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  });
})();

(function(){
  const blobs = document.querySelectorAll('.blob');
  if (!blobs.length) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 800) return;
    blobs.forEach((b, i) => {
      const speed = (i + 1) * 0.15;
      b.style.transform = `translateY(${y * speed}px)`;
    });
  }, { passive: true });
})();

window.openGallery = function(){
  const g = document.getElementById('smGallery');
  if (!g) return;
  g.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeGallery = function(){
  const g = document.getElementById('smGallery');
  if (!g) return;
  g.classList.remove('open');
  document.body.style.overflow = '';
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.closeGallery();
});

document.addEventListener('click', (e) => {
  const g = document.getElementById('smGallery');
  if (g && e.target === g) window.closeGallery();
});

(function(){
  const toggle=document.getElementById('menuToggle'); const links=document.querySelector('.nav-links');
  if(!toggle||!links) return;
  toggle.addEventListener('click',()=>{links.classList.toggle('open'); toggle.textContent=links.classList.contains('open')?'✕':'☰';});
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');toggle.textContent='☰';}));
})();

(function(){
  const btn = document.getElementById('printResume');
  if (!btn) return;
  btn.addEventListener('click', () => window.print());
})();