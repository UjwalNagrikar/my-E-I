/* ============================================================
   TRANSOLUX ENTERPRISES — SCRIPT.JS
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
    const el    = entry.target;
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
    const top = sec.offsetTop, bottom = top + sec.offsetHeight;
    if (pos >= top && pos < bottom) {
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { passive: true });

// ── 3D TILT ON CARDS ───────────────────────────────────────
document.querySelectorAll('.product-card, .why-card').forEach(card => {
  const TILT = 5;
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const rx = -((e.clientY - r.top - r.height / 2) / (r.height / 2)) * TILT;
    const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * TILT;
    card.style.transform  = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
    card.style.transition = 'transform 0.05s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
  });
});

// ══════════════════════════════════════════════════════
// CONTACT FORM — THE CORE FIX
// ══════════════════════════════════════════════════════
//
// ROOT CAUSE (why admin showed 0 submissions):
//
//   OLD broken flow:
//     fetch('/submit', formData)
//       → Flask validates & saves, then does redirect('/?success=...')
//       → fetch() follows the 302 redirect automatically
//       → Gets the homepage (HTTP 200 OK)
//       → response.ok === true  ← always, even on error/redirect
//       → JS always showed ✅ success — even when DB write failed!
//
//   NEW fixed flow:
//     fetch('/submit', {headers: {'X-Requested-With': 'fetch'}, ...})
//       → Flask sees the header, skips redirect
//       → Returns JSON: {"success": true, "message": "..."} on save
//                    or {"success": false, "message": "..."} on failure
//       → JS reads data.success → correct ✅ or ❌ message
//
const form = document.querySelector('.contact-form');
if (form) {

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name    = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();
    const phone   = form.querySelector('#phone') ? form.querySelector('#phone').value.trim() : '';

    // Client-side validation
    if (!name || !email || !message) {
      showFlash('Please fill in all required fields.', 'error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFlash('Please enter a valid email address.', 'error'); return;
    }

    // Show loading state
    const submitBtn    = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled      = true;
    submitBtn.style.opacity = '0.8';
    submitBtn.innerHTML     = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" style="animation:spin 0.8s linear infinite">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Sending…`;

    try {
      const response = await fetch('/submit', {
        method:  'POST',
        body:    new FormData(form),
        headers: {
          // ← This header makes Flask return JSON instead of a redirect.
          //   Without it, every response looks like HTTP 200 (success)
          //   because fetch silently follows the redirect to the homepage.
          'X-Requested-With': 'fetch'
        },
        signal: AbortSignal.timeout(8000)
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Unexpected response from server. Please try again.');
      }

      if (data.success) {
        // Confirmed: record saved in database
        form.reset();
        showFlash('✅ ' + data.message, 'success');
      } else {
        // Confirmed: save failed (validation, DB error, etc.)
        showFlash('❌ ' + (data.message || 'Something went wrong. Please try again.'), 'error');
      }

    } catch (err) {
      const isNetworkError =
        err.name === 'AbortError' ||
        err.name === 'TypeError'  ||
        err.message.includes('fetch') ||
        err.message.includes('network');

      if (isNetworkError) {
        // Server not reachable (no Docker running, GitHub Pages, etc.)
        showBackendUnavailable(name, email, message, phone);
      } else {
        showFlash('❌ ' + err.message, 'error');
      }
    } finally {
      submitBtn.disabled      = false;
      submitBtn.style.opacity = '';
      submitBtn.innerHTML     = originalHTML;
    }
  });

  // Input focus ring
  form.querySelectorAll('input, textarea').forEach(field => {
    const box = field.closest('.input-box');
    if (!box) return;
    field.addEventListener('focus', () => box.style.borderColor = 'var(--blue)');
    field.addEventListener('blur',  () => { if (!field.value.trim()) box.style.borderColor = ''; });
  });
}

// Spinner keyframe
(function () {
  if (!document.getElementById('_spin_style')) {
    const s = document.createElement('style');
    s.id = '_spin_style';
    s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(s);
  }
})();

// ── BACKEND UNAVAILABLE FALLBACK ────────────────────────────
function showBackendUnavailable(name, email, message, phone) {
  const existing = document.getElementById('_backend_fallback');
  if (existing) existing.remove();

  const fallback = document.createElement('div');
  fallback.id = '_backend_fallback';
  fallback.style.cssText = `
    position:fixed;inset:0;background:rgba(13,27,42,.55);
    backdrop-filter:blur(6px);z-index:9999;
    display:flex;align-items:center;justify-content:center;padding:1.5rem`;

  const subject = encodeURIComponent('Trade Enquiry from ' + name);
  const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`);
  const mailto  = `mailto:ujjwalnagrikar@gmail.com?subject=${subject}&body=${body}`;

  fallback.innerHTML = `
    <div style="background:white;border-radius:24px;padding:2.5rem;max-width:480px;width:100%;
                box-shadow:0 24px 80px rgba(0,0,0,.2);position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(135deg,#1a6cf0,#0db87f)"></div>
      <div style="font-size:2.5rem;margin-bottom:1rem">⚠️</div>
      <h3 style="font-size:1.1rem;font-weight:800;color:#0d1b2a;margin-bottom:.5rem">Backend server unavailable</h3>
      <p style="color:#64748b;font-size:.875rem;line-height:1.7;margin-bottom:1.5rem">
        The server cannot be reached right now. Your message was <strong style="color:#dc2626">not saved</strong>.
        Please contact us directly:
      </p>
      <div style="display:flex;flex-direction:column;gap:.8rem;margin-bottom:1.5rem">
        <a href="${mailto}" style="display:flex;align-items:center;gap:.8rem;padding:.85rem 1rem;background:#f4f7ff;border:1px solid #e2ecf9;border-radius:10px;text-decoration:none;color:#0d1b2a;font-weight:600;font-size:.875rem">
          <span>✉️</span><div><div>Email us</div><div style="font-size:.75rem;color:#64748b;font-weight:400">ujjwalnagrikar@gmail.com</div></div><span style="margin-left:auto">→</span>
        </a>
        <a href="tel:+918446362075" style="display:flex;align-items:center;gap:.8rem;padding:.85rem 1rem;background:#f4f7ff;border:1px solid #e2ecf9;border-radius:10px;text-decoration:none;color:#0d1b2a;font-weight:600;font-size:.875rem">
          <span>📞</span><div><div>Call us</div><div style="font-size:.75rem;color:#64748b;font-weight:400">+91 84463 62075</div></div><span style="margin-left:auto">→</span>
        </a>
      </div>
      <button onclick="document.getElementById('_backend_fallback').remove()"
              style="width:100%;padding:.75rem;background:#0d1b2a;border:none;border-radius:10px;color:white;font-size:.875rem;font-weight:600;cursor:pointer;font-family:inherit">
        Close
      </button>
    </div>`;

  fallback.addEventListener('click', e => { if (e.target === fallback) fallback.remove(); });
  document.body.appendChild(fallback);
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
    <button class="flash-close" onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(div);
  setTimeout(() => {
    if (div.parentElement) {
      div.style.transition = 'all .4s ease';
      div.style.opacity    = '0';
      div.style.transform  = 'translateX(100%)';
      setTimeout(() => div.remove(), 400);
    }
  }, 6000);
}
window.showFlashMessage = showFlash;

// Check URL params (for plain form-submit fallback redirect)
function checkURLFlash() {
  try {
    const p  = new URLSearchParams(window.location.search);
    const s  = p.get('success');
    const er = p.get('error');
    if (s)  setTimeout(() => showFlash(decodeURIComponent(s),  'success'), 200);
    if (er) setTimeout(() => showFlash(decodeURIComponent(er), 'error'),   200);
    if (s || er) window.history.replaceState({}, '', window.location.pathname + window.location.hash);
  } catch {}
}

// ── HERO PARALLAX ──────────────────────────────────────────
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