/* ============================================================
   TRANSOLUX ENTERPRISES — SCRIPT (no fake stats)
   ============================================================ */

// ── HEADER SCROLL ──────────────────────────────────────────
const header = document.getElementById('mainHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── MOBILE MENU ────────────────────────────────────────────
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('active');
}
document.addEventListener('click', e => {
  const nav = document.querySelector('nav');
  if (nav && !nav.contains(e.target)) {
    document.getElementById('navLinks').classList.remove('active');
  }
});
window.toggleMenu = toggleMenu;

// ── SMOOTH SCROLL ──────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
    document.getElementById('navLinks').classList.remove('active');
  });
});

// ── SCROLL REVEAL ──────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('visible'), delay);
    revealObs.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── ACTIVE NAV ON SCROLL ───────────────────────────────────
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const pos = window.scrollY + 120;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    const id = sec.id;
    if (pos >= top && pos < bottom) {
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { passive: true });

// ── 3D TILT ON CARDS ───────────────────────────────────────
document.querySelectorAll('.product-card, .why-card').forEach(card => {
  const TILT = 5;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const rx = -((e.clientY - r.top - r.height / 2) / (r.height / 2)) * TILT;
    const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * TILT;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
    card.style.transition = 'transform 0.05s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
  });
});

// ── FORM VALIDATION ────────────────────────────────────────
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', e => {
    const name    = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();
    if (!name || !email || !message) {
      e.preventDefault();
      showFlash('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.preventDefault();
      showFlash('Please enter a valid email address.', 'error');
    }
  });
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('focus', () => field.closest('.input-box').style.borderColor = 'var(--blue)');
    field.addEventListener('blur', () => { if (!field.value.trim()) field.closest('.input-box').style.borderColor = ''; });
  });
}

// ── FLASH MESSAGES ─────────────────────────────────────────
function showFlash(message, type = 'success') {
  let container = document.getElementById('flashMessages');
  if (!container) {
    container = document.createElement('div');
    container.id = 'flashMessages';
    container.className = 'flash-messages-container';
    document.body.appendChild(container);
  }
  const div = document.createElement('div');
  div.className = `flash-message ${type}`;
  div.innerHTML = `
    <div class="flash-icon">${type === 'success' ? '✅' : '❌'}</div>
    <div class="flash-content">${message}</div>
    <button class="flash-close" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(div);
  setTimeout(() => {
    if (div.parentElement) {
      div.style.transition = 'all 0.4s ease';
      div.style.opacity = '0';
      div.style.transform = 'translateX(100%)';
      setTimeout(() => div.remove(), 400);
    }
  }, 5000);
}
window.showFlashMessage = showFlash;

function checkURLFlash() {
  try {
    const p = new URLSearchParams(window.location.search);
    const success = p.get('success');
    const error = p.get('error');
    if (success) setTimeout(() => showFlash(decodeURIComponent(success), 'success'), 200);
    if (error)   setTimeout(() => showFlash(decodeURIComponent(error), 'error'), 200);
    if (success || error) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }
  } catch (e) {}
}

// ── SUBTLE HERO PARALLAX ───────────────────────────────────
window.addEventListener('scroll', () => {
  const heroLeft = document.querySelector('.hero-left');
  if (heroLeft && window.scrollY < window.innerHeight) {
    heroLeft.style.transform = `translateY(${window.scrollY * 0.12}px)`;
  }
}, { passive: true });

// ── INIT ───────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkURLFlash);
} else {
  checkURLFlash();
}