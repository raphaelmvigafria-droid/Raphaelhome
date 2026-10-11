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

/* --- RENDER PUBLIC REVIEWS ON PAGE (FIREBASE VERSION) --- */
async function renderPublicReviews() {
  const container = document.getElementById('publicReviewsList');
  if (!container) return;

  if (!window.firebaseDB) {
    console.log('Firebase not ready yet...');
    return;
  }

  const { collection, getDocs, query, orderBy, limit, db } = window.firebaseDB;

  try {
    const q = query(collection(db, "feedback"), orderBy("date", "desc"), limit(6));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      container.innerHTML = '<p class="no-reviews-msg">No reviews yet. Be the first to leave one!</p>';
      return;
    }

    container.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const fb = doc.data();
      const starsHtml = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
      
      // Gumagawa ng avatar base sa pangalan ng user
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fb.username)}&background=random&color=fff&size=128`;

      const card = document.createElement('div');
      card.className = 'public-review-card';
      card.innerHTML = `
        <div class="public-review-avatar">
          <img src="${avatarUrl}" alt="${fb.username}" onerror="this.style.display='none'">
        </div>
        <div class="public-review-content">
          <div class="public-review-header">
            <span class="public-review-name">${fb.username}</span>
            <span class="public-review-stars">${starsHtml}</span>
          </div>
          <p class="public-review-msg">"${fb.message}"</p>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error fetching reviews: ', err);
    container.innerHTML = '<p class="no-reviews-msg">Could not load reviews right now.</p>';
  }
}

// MAHALAGANG FIX: Hintayin na maging ready ang Firebase bago i-render
const waitForFirebase = setInterval(() => {
  if (window.firebaseDB) {
    clearInterval(waitForFirebase);
    renderPublicReviews();
  }
}, 100);

/* --- RATING LOGIC --- */
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
})();

/* --- CONTACT FORM SUBMISSION (FIREBASE) --- */
(function(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  const btn    = document.getElementById('contactSubmit');
  const status = document.getElementById('formStatus');
  const btnLabel = btn ? btn.textContent : '';

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

    if (!window.firebaseDB) {
      setStatus('Database not loaded. Please refresh the page.', 'err');
      return;
    }

    setBusy(true);
    setStatus('Sending your feedback…');

    const { collection, addDoc, db } = window.firebaseDB;

    try {
      await addDoc(collection(db, "feedback"), {
        username: username,
        email: email,
        message: message,
        rating: parseInt(rating),
        date: new Date()
      });
      
      setStatus('Thank you, ' + username + '! Your feedback was sent.', 'ok');
      form.reset();
      document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
      document.getElementById('cRating').value = '0';
      
      // I-refresh ang public reviews pagkatapos ng 1 segundo
      setTimeout(renderPublicReviews, 1000); 
      
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus('Sorry, your feedback could not be sent right now. Please try again later.', 'err');
    } finally {
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