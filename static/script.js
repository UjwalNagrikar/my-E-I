/* ============================================================
   TRANSOLUX ENTERPRISES — SCRIPT.JS  v8
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
  if (nav && !nav.contains(e.target))
    document.getElementById('navLinks').classList.remove('active');
});
window.toggleMenu = toggleMenu;

// ── SMOOTH SCROLL ──────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    document.getElementById('navLinks').classList.remove('active');
  });
});

// ── SCROLL REVEAL ──────────────────────────────────────────
const ro = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    setTimeout(() => en.target.classList.add('visible'), parseInt(en.target.dataset.delay || 0));
    ro.unobserve(en.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

// ── ACTIVE NAV ─────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const pos = window.scrollY + 120;
  sections.forEach(s => {
    if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) {
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      const a = document.querySelector(`.nav-links a[href="#${s.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { passive: true });

// ── CARD TILT ──────────────────────────────────────────────
document.querySelectorAll('.product-card, .why-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const rx = -((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * 5;
    const ry =  ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) * 5;
    card.style.transform  = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
    card.style.transition = 'transform 0.05s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
  });
});

// ══════════════════════════════════════════════════════
//  CONTACT FORM
//  Posts to /submit which ALWAYS returns JSON.
//  This is the ONLY submit listener — index.html has none.
// ══════════════════════════════════════════════════════
const form = document.querySelector('.contact-form');

if (form) {
  console.log('[Transolux] Contact form found — JS handler attached ✅');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();   // Stop native POST — we handle it via fetch
    e.stopPropagation();
    console.log('[Form] Submit intercepted by JS ✅');

    // ── 1. Build phone value BEFORE new FormData(form) ────────
    const codeEl  = document.getElementById('countryCode');
    const numEl   = document.getElementById('phoneNumber');
    const phoneEl = document.getElementById('phone');
    const groupEl = document.getElementById('phoneInputGroup');

    if (codeEl && numEl && phoneEl) {
      const num = (numEl.value || '').trim();
      if (!num) {
        if (groupEl) { groupEl.style.borderColor = '#ef4444'; groupEl.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)'; }
        numEl.focus();
        showFlash('Please enter your phone number.', 'error');
        return;
      }
      phoneEl.value = codeEl.value + ' ' + num;
      console.log('[Form] Phone set to:', phoneEl.value);
    }

    // ── 2. Validate ────────────────────────────────────────────
    const name    = (form.querySelector('#name')?.value    || '').trim();
    const email   = (form.querySelector('#email')?.value   || '').trim();
    const message = (form.querySelector('#message')?.value || '').trim();

    if (!name || !email || !message) {
      showFlash('Please fill in all required fields.', 'error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFlash('Please enter a valid email address.', 'error'); return;
    }

    // ── 3. Loading state ───────────────────────────────────────
    const btn      = form.querySelector('button[type="submit"]');
    const origHTML = btn.innerHTML;
    btn.disabled = true; btn.style.opacity = '0.75';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5"
      style="animation:_txspin .8s linear infinite;flex-shrink:0">
      <path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>&nbsp;Sending…`;

    // ── 4. POST to /submit ─────────────────────────────────────
    console.log('[Form] Posting to /submit …');
    try {
      const fd = new FormData(form);
      // Log what we're sending (for debugging)
      for (const [k, v] of fd.entries()) {
        console.log(`  [FormData] ${k} = ${k === 'message' ? v.substring(0, 40) + '…' : v}`);
      }

      const res = await fetch('/submit', {
        method: 'POST',
        body:   fd,
        signal: AbortSignal.timeout(12000)
      });

      console.log('[Form] Response status:', res.status);
      const ct = res.headers.get('content-type') || '';
      console.log('[Form] Content-Type:', ct);

      if (!ct.includes('application/json')) {
        const txt = await res.text();
        console.error('[Form] ❌ Server returned HTML, not JSON:', res.status, txt.substring(0, 200));
        throw new Error(
          res.status === 404
            ? '/submit not found — Nginx is not proxying it. Check nginx.conf has a location = /submit block.'
            : `Server returned status ${res.status} (not JSON). Restart Docker: docker-compose down && docker-compose up --build`
        );
      }

      const data = await res.json();
      console.log('[Form] Response JSON:', data);

      if (data.success) {
        console.log(`[Form] ✅ Saved as submission #${data.id}`);
        form.reset();
        if (groupEl) { groupEl.style.borderColor = ''; groupEl.style.boxShadow = ''; }
        showFlash('✅ ' + data.message, 'success');
      } else {
        console.warn('[Form] ❌ Server error:', data.message);
        showFlash('❌ ' + (data.message || 'Something went wrong. Please try again.'), 'error');
      }

    } catch (err) {
      console.error('[Form] Exception:', err.name, err.message);
      const isNetwork = err.name === 'AbortError' || err.name === 'TypeError' ||
                        err.message.toLowerCase().includes('failed to fetch') ||
                        err.message.toLowerCase().includes('network');
      if (isNetwork) {
        showBackendUnavailable(name, email, message, phoneEl?.value || '');
      } else {
        showFlash('❌ ' + err.message, 'error');
      }
    } finally {
      btn.disabled = false; btn.style.opacity = ''; btn.innerHTML = origHTML;
    }
  });

  // Focus ring
  form.querySelectorAll('input, textarea').forEach(f => {
    const box = f.closest('.input-box, .phone-wrap');
    if (!box) return;
    f.addEventListener('focus', () => box.style.borderColor = 'var(--blue, #1660e8)');
    f.addEventListener('blur',  () => { if (!(f.value || '').trim()) box.style.borderColor = ''; });
  });

  // Phone error reset
  document.getElementById('phoneNumber')?.addEventListener('input', () => {
    const g = document.getElementById('phoneInputGroup');
    if (g) { g.style.borderColor = ''; g.style.boxShadow = ''; }
  });

} else {
  console.warn('[Transolux] .contact-form not found on this page');
}

// Spinner keyframe
if (!document.getElementById('_txspin_kf')) {
  const s = document.createElement('style');
  s.id = '_txspin_kf';
  s.textContent = '@keyframes _txspin { to { transform:rotate(360deg); } }';
  document.head.appendChild(s);
}

// ── FALLBACK MODAL ─────────────────────────────────────────
function showBackendUnavailable(name, email, message, phone) {
  document.getElementById('_tx_fb')?.remove();
  const el = document.createElement('div');
  el.id = '_tx_fb';
  el.style.cssText = 'position:fixed;inset:0;background:rgba(13,27,42,.6);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1.5rem';
  const sub = encodeURIComponent('Trade Enquiry from ' + name);
  const bod = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone||'—'}\n\nMessage:\n${message}`);
  el.innerHTML = `
    <div style="background:#fff;border-radius:22px;padding:2.2rem;max-width:440px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,.22);position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(135deg,#1660e8,#059669)"></div>
      <div style="font-size:2.2rem;margin-bottom:.9rem">⚠️</div>
      <h3 style="font-family:sans-serif;font-size:1.05rem;font-weight:800;color:#07152b;margin-bottom:.4rem">Server unreachable</h3>
      <p style="font-family:sans-serif;color:#64748b;font-size:.85rem;line-height:1.7;margin-bottom:1.3rem">
        Your message was <strong style="color:#dc2626">not saved</strong>. Contact us directly:
      </p>
      <div style="display:flex;flex-direction:column;gap:.7rem;margin-bottom:1.3rem">
        <a href="mailto:ujjwalnagrikar@gmail.com?subject=${sub}&body=${bod}" style="display:flex;align-items:center;gap:.75rem;padding:.8rem 1rem;background:#f4f7ff;border:1px solid #e1eaf8;border-radius:10px;text-decoration:none;color:#07152b;font-weight:600;font-size:.85rem;font-family:sans-serif">
          <span>✉️</span><div><div>Email us</div><div style="font-size:.72rem;color:#64748b;font-weight:400">ujjwalnagrikar@gmail.com</div></div><span style="margin-left:auto">→</span>
        </a>
        <a href="tel:+918446362075" style="display:flex;align-items:center;gap:.75rem;padding:.8rem 1rem;background:#f4f7ff;border:1px solid #e1eaf8;border-radius:10px;text-decoration:none;color:#07152b;font-weight:600;font-size:.85rem;font-family:sans-serif">
          <span>📞</span><div><div>Call us</div><div style="font-size:.72rem;color:#64748b;font-weight:400">+91 84463 62075</div></div><span style="margin-left:auto">→</span>
        </a>
      </div>
      <button onclick="document.getElementById('_tx_fb').remove()" style="width:100%;padding:.7rem;background:#07152b;border:none;border-radius:10px;color:#fff;font-size:.85rem;font-weight:600;cursor:pointer;font-family:sans-serif">Close</button>
    </div>`;
  el.addEventListener('click', ev => { if (ev.target === el) el.remove(); });
  document.body.appendChild(el);
}

// ── FLASH MESSAGES ─────────────────────────────────────────
function showFlash(msg, type = 'success') {
  let c = document.getElementById('flashMessages');
  if (!c) {
    c = document.createElement('div');
    c.id = 'flashMessages'; c.className = 'flash-messages-container';
    document.body.appendChild(c);
  }
  const d = document.createElement('div');
  d.className = `flash-message ${type}`;
  d.innerHTML = `
    <div class="flash-icon">${type === 'success' ? '✅' : '❌'}</div>
    <div class="flash-content">${msg}</div>
    <button class="flash-close" onclick="this.parentElement.remove()">×</button>`;
  c.appendChild(d);
  setTimeout(() => {
    if (!d.parentElement) return;
    d.style.transition = 'all .4s ease';
    d.style.opacity = '0'; d.style.transform = 'translateX(100%)';
    setTimeout(() => d.remove(), 400);
  }, 6000);
}
window.showFlashMessage = showFlash;

// URL param flash (plain-POST fallback)
function checkURLFlash() {
  try {
    const p = new URLSearchParams(window.location.search);
    const s = p.get('success'), er = p.get('error');
    if (s)  setTimeout(() => showFlash(decodeURIComponent(s),  'success'), 200);
    if (er) setTimeout(() => showFlash(decodeURIComponent(er), 'error'),   200);
    if (s || er) history.replaceState({}, '', location.pathname + location.hash);
  } catch {}
}

// ── HERO PARALLAX ──────────────────────────────────────────
window.addEventListener('scroll', () => {
  const h = document.querySelector('.hero-left');
  if (h && window.scrollY < window.innerHeight)
    h.style.transform = `translateY(${window.scrollY * 0.1}px)`;
}, { passive: true });

// ── INIT ───────────────────────────────────────────────────
document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', checkURLFlash)
  : checkURLFlash();