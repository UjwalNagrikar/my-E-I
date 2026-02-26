/* ============================================================
   TRANSOLUX ENTERPRISES — SCRIPT
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

// ── CONTACT FORM — AJAX WITH BACKEND FALLBACK ──────────────
const form = document.querySelector('.contact-form');
if (form) {

  form.addEventListener('submit', async function(e) {
    e.preventDefault(); // Always intercept — we handle submission via fetch

    const name    = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const message = form.querySelector('#message').value.trim();
    const phone   = form.querySelector('#phone') ? form.querySelector('#phone').value.trim() : '';

    // ── Client-side validation ──
    if (!name || !email || !message) {
      showFlash('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFlash('Please enter a valid email address.', 'error');
      return;
    }

    // ── Show loading state on button ──
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           style="animation:spin 0.8s linear infinite">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      Sending…`;
    submitBtn.style.opacity = '0.8';

    try {
      // ── Try to POST to the Flask backend ──
      const formData = new FormData(form);
      const response = await fetch('/submit', {
        method: 'POST',
        body: formData,
        // 5-second timeout — if no backend, fail fast
        signal: AbortSignal.timeout(5000)
      });

      // Flask redirects to /?success=... or /?error=... after handling
      if (response.ok || response.redirected) {
        // Success — clear the form and show message
        form.reset();
        showFlash('✓ Thank you! Your enquiry has been received. We will contact you soon.', 'success');

        // If Flask redirected with a URL param, parse it
        if (response.redirected && response.url.includes('success=')) {
          const params = new URLSearchParams(new URL(response.url).search);
          const msg = params.get('success');
          if (msg) showFlash(decodeURIComponent(msg), 'success');
        }
      } else {
        throw new Error(`Server responded with status ${response.status}`);
      }

    } catch (err) {
      // ── Backend is unreachable (GitHub Pages / no server / network error) ──
      const isOffline =
        err.name === 'AbortError' ||          // timeout
        err.name === 'TypeError'  ||          // fetch failed / CORS / no network
        err.message.includes('fetch') ||
        err.message.includes('network') ||
        err.message.includes('Failed to fetch');

      if (isOffline) {
        // Show a friendly fallback — direct contact info
        showBackendUnavailable(name, email, message, phone);
      } else {
        showFlash('Something went wrong. Please try again or contact us directly.', 'error');
      }
    } finally {
      // Restore button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      submitBtn.style.opacity = '';
    }
  });

  // Input focus styling
  form.querySelectorAll('input, textarea').forEach(field => {
    const box = field.closest('.input-box');
    if (!box) return;
    field.addEventListener('focus',  () => box.style.borderColor = 'var(--blue)');
    field.addEventListener('blur',   () => { if (!field.value.trim()) box.style.borderColor = ''; });
  });
}

// Add spinner keyframe if not already in CSS
(function() {
  if (!document.getElementById('_spin_style')) {
    const s = document.createElement('style');
    s.id = '_spin_style';
    s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(s);
  }
})();

// ── BACKEND UNAVAILABLE — FALLBACK UI ──────────────────────
function showBackendUnavailable(name, email, message, phone) {
  // Remove any existing fallback
  const existing = document.getElementById('_backend_fallback');
  if (existing) existing.remove();

  const fallback = document.createElement('div');
  fallback.id = '_backend_fallback';
  fallback.style.cssText = `
    position: fixed; inset: 0; background: rgba(13,27,42,0.55);
    backdrop-filter: blur(6px); z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    padding: 1.5rem;
    animation: _fbFadeIn 0.35s ease;
  `;

  // Build mailto link so the user can send via their email client as a fallback
  const subject = encodeURIComponent('Trade Enquiry from ' + name);
  const body    = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`
  );
  const mailto  = `mailto:ujjwalnagrikar@gmail.com?subject=${subject}&body=${body}`;

  fallback.innerHTML = `
    <div style="
      background: white; border-radius: 24px; padding: 2.5rem;
      max-width: 480px; width: 100%; box-shadow: 0 24px 80px rgba(0,0,0,0.2);
      position: relative; overflow: hidden;
      animation: _fbSlideUp 0.4s cubic-bezier(0.16,1,0.3,1);
    ">
      <!-- Top accent bar -->
      <div style="position:absolute;top:0;left:0;right:0;height:4px;
                  background:linear-gradient(135deg,#1a6cf0,#0db87f);"></div>

      <!-- Icon -->
      <div style="
        width: 56px; height: 56px; border-radius: 16px;
        background: #fff3cd; display: flex; align-items: center;
        justify-content: center; font-size: 1.8rem; margin-bottom: 1.2rem;
      ">⚠️</div>

      <h3 style="font-size:1.15rem;font-weight:800;color:#0d1b2a;margin-bottom:0.5rem;">
        Contact form unavailable
      </h3>
      <p style="color:#64748b;font-size:0.875rem;line-height:1.7;margin-bottom:1.5rem;">
        Our backend server isn't running in this environment (GitHub Pages hosts
        static files only). Your message <strong style="color:#0d1b2a">has not been lost</strong> —
        please reach us directly:
      </p>

      <!-- Contact options -->
      <div style="
        background:#f4f7ff; border:1px solid #e2ecf9; border-radius:14px;
        padding:1.2rem; margin-bottom:1.5rem; display:flex; flex-direction:column; gap:0.8rem;
      ">
        <a href="${mailto}" style="
          display:flex; align-items:center; gap:0.8rem;
          padding:0.8rem 1rem; background:white; border:1px solid #e2ecf9;
          border-radius:10px; text-decoration:none; color:#2d3748;
          font-size:0.875rem; font-weight:600; transition:all 0.2s;
        " onmouseover="this.style.borderColor='#1a6cf0';this.style.color='#1a6cf0'"
           onmouseout="this.style.borderColor='#e2ecf9';this.style.color='#2d3748'">
          <span style="font-size:1.2rem;">✉️</span>
          <div>
            <div>Send via Email</div>
            <div style="font-size:0.75rem;font-weight:400;color:#64748b;">ujjwalnagrikar@gmail.com</div>
          </div>
          <svg style="margin-left:auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>

        <a href="tel:+918446362075" style="
          display:flex; align-items:center; gap:0.8rem;
          padding:0.8rem 1rem; background:white; border:1px solid #e2ecf9;
          border-radius:10px; text-decoration:none; color:#2d3748;
          font-size:0.875rem; font-weight:600; transition:all 0.2s;
        " onmouseover="this.style.borderColor='#0db87f';this.style.color='#0db87f'"
           onmouseout="this.style.borderColor='#e2ecf9';this.style.color='#2d3748'">
          <span style="font-size:1.2rem;">📞</span>
          <div>
            <div>Call Us</div>
            <div style="font-size:0.75rem;font-weight:400;color:#64748b;">+91 84463 62075</div>
          </div>
          <svg style="margin-left:auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
      </div>

      <!-- Filled-in message preview -->
      <details style="margin-bottom:1.5rem;">
        <summary style="
          font-size:0.78rem; color:#64748b; cursor:pointer; font-weight:600;
          list-style:none; display:flex; align-items:center; gap:0.4rem;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          View your message (copy if needed)
        </summary>
        <div style="
          margin-top:0.7rem; padding:0.9rem; background:#f8faff;
          border:1px solid #e2ecf9; border-radius:10px;
          font-size:0.8rem; color:#64748b; line-height:1.7;
          white-space:pre-wrap; word-break:break-word;
          max-height:150px; overflow-y:auto;
        ">${escapeHtmlInline(name)} &lt;${escapeHtmlInline(email)}&gt;\n${phone ? escapeHtmlInline(phone) + '\n' : ''}\n${escapeHtmlInline(message)}</div>
      </details>

      <!-- Close button -->
      <button onclick="document.getElementById('_backend_fallback').remove()" style="
        width:100%; padding:0.75rem; background:#0d1b2a; border:none;
        border-radius:10px; color:white; font-size:0.875rem; font-weight:600;
        cursor:pointer; font-family:'Inter',sans-serif; transition:background 0.2s;
      " onmouseover="this.style.background='#1e3a5f'"
         onmouseout="this.style.background='#0d1b2a'">
        Close
      </button>
    </div>
  `;

  // Inject keyframes
  if (!document.getElementById('_fb_kf')) {
    const s = document.createElement('style');
    s.id = '_fb_kf';
    s.textContent = `
      @keyframes _fbFadeIn   { from { opacity:0 } to { opacity:1 } }
      @keyframes _fbSlideUp  { from { opacity:0; transform:scale(0.92) translateY(20px) }
                                to   { opacity:1; transform:scale(1) translateY(0) } }
    `;
    document.head.appendChild(s);
  }

  // Close on backdrop click
  fallback.addEventListener('click', e => { if (e.target === fallback) fallback.remove(); });

  document.body.appendChild(fallback);
}

// Inline escape helper (used inside template literal)
function escapeHtmlInline(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
    const error   = p.get('error');
    if (success) setTimeout(() => showFlash(decodeURIComponent(success), 'success'), 200);
    if (error)   setTimeout(() => showFlash(decodeURIComponent(error),   'error'),   200);
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
