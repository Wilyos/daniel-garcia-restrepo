/* ============================================================
   main.js — Daniel Yoséf García Restrepo
   Animations: Canvas Particles, Typewriter, Scroll Reveal,
               Navbar, Custom Cursor, Counter
   ============================================================ */

'use strict';

/* ─── Utility ──────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── Custom Cursor ─────────────────────────────────────── */
(function initCursor() {
  const dot      = qs('#cursor');
  const follower = qs('#cursor-follower');
  if (!dot || !follower) return;

  let mx = -100, my = -100;
  let fx = -100, fy = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateFollower);
  })();
})();

/* ─── Navbar ─────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = qs('#navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Hamburger */
  const hamburger   = qs('.hamburger');
  const mobileMenu  = qs('.mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  qsa('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ─── Hero Canvas Particles ──────────────────────────────── */
(function initParticles() {
  const canvas = qs('#hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  const COLORS = [
    'rgba(192,57,43,',
    'rgba(231,76,60,',
    'rgba(180,180,180,',
    'rgba(240,240,240,',
  ];

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x    = Math.random() * W;
      this.y    = initial ? Math.random() * H : H + 5;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -(Math.random() * 0.6 + 0.2);
      this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha  = Math.random() * 0.5 + 0.1;
      this.life   = 1;
      this.decay  = Math.random() * 0.003 + 0.001;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life -= this.decay;
      if (this.life <= 0 || this.y < -5) this.reset();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + (this.alpha * this.life) + ')';
      ctx.fill();
    }
  }

  /* Lines between close particles */
  function drawConnections() {
    const MAX_DIST = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(192,57,43,${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function init() {
    resize();
    const count = Math.min(120, Math.floor((W * H) / 8000));
    particles = Array.from({ length: count }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  init();
  loop();
  window.addEventListener('resize', () => { init(); }, { passive: true });
})();

/* ─── Typewriter Hero Slogan ─────────────────────────────── */
(function initTypewriter() {
  const el = qs('#typewriter-text');
  if (!el) return;

  const text  = el.dataset.text || '';
  const speed = 60;
  let i = 0;

  function type() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(type, speed);
    }
  }

  /* Start after hero animations (delay ~1.5s) */
  setTimeout(type, 1500);
})();

/* ─── Scroll Reveal (IntersectionObserver) ───────────────── */
(function initReveal() {
  const items = qsa('.reveal, .reveal-left, .reveal-right');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  items.forEach(item => observer.observe(item));
})();

/* ─── Animated Counter ───────────────────────────────────── */
(function initCounters() {
  const counters = qsa('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const end = parseInt(el.dataset.count, 10);
        const dur = 1800;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / dur, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * end) + (el.dataset.suffix || '');
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => observer.observe(c));
})();

/* ─── Parallax Hero Text ─────────────────────────────────── */
(function initParallax() {
  const heroContent = qs('.hero-content');
  if (!heroContent) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
    heroContent.style.opacity   = 1 - scrollY / (window.innerHeight * 0.7);
  }, { passive: true });
})();

/* ─── Magnetic Buttons ───────────────────────────────────── */
(function initMagneticButtons() {
  qsa('.btn-primary, .btn-secondary, .btn-submit').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0,0)';
    });
  });
})();

/* ─── Form Handling ──────────────────────────────────────── */
(function initForm() {
  const form    = qs('#contact-form');
  const success = qs('#form-success');
  if (!form) return;

  /* URL del Google Apps Script Web App */
  const webAppUrl = 'https://script.google.com/macros/s/AKfycbwnKPqu9fI9fWg3GqtHn3tAUWed9cvIoMm_lVHWyirMe5VmrSW--Ge20dnXNiBtGbxv/exec';

  /* Número de WhatsApp del abogado (sin + ni espacios) */
  const WA_NUMBER = '573168118093';

  /* Etiquetas legibles para el campo "asunto" */
  const ASUNTO_LABELS = {
    acompanamiento : 'Acompañamiento Legal',
    litigio        : 'Litigio',
    documentos     : 'Revisión de Documentos',
    riesgos        : 'Gestión de Riesgos Políticos e Institucionales',
    consulta       : 'Consulta General',
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const data     = new FormData(form);
    const nombre   = data.get('nombre')?.trim()   || '';
    const email    = data.get('email')?.trim()    || '';
    const telefono = data.get('telefono')?.trim() || '';
    const asunto   = data.get('asunto')?.trim()   || '';
    const mensaje  = data.get('mensaje')?.trim()  || '';

    /* ── Validación ──────────────────────────────────────── */
    if (!nombre || !email || !mensaje) { shakeForm(form); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { shakeForm(form); return; }

    /* ── UI: estado de carga ─────────────────────────────── */
    const submitBtn  = form.querySelector('.btn-submit');
    const submitSpan = submitBtn.querySelector('span');
    submitSpan.textContent = 'Enviando...';
    submitBtn.disabled = true;

    /* ── 1. Guardar en Google Sheets ─────────────────────── */
    const payload = { nombre, email, telefono, asunto, mensaje };

    if (webAppUrl) {
      try {
        await fetch(webAppUrl, {
          method : 'POST',
          mode   : 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body   : JSON.stringify(payload),
        });
      } catch (_) {
        /* Si falla el sheet, continuamos igual — WhatsApp es prioritario */
      }
    }

    /* ── 2. Abrir WhatsApp con mensaje prefabricado ───────── */
    const asuntoLabel = ASUNTO_LABELS[asunto] || asunto || 'Sin especificar';

    const waText = [
      `✉️ *Nuevo mensaje desde tu sitio web*`,
      ``,
      `👤 *Nombre:* ${nombre}`,
      `📧 *Email:* ${email}`,
      telefono ? `📱 *Teléfono:* ${telefono}` : null,
      `⚖️ *Asunto:* ${asuntoLabel}`,
      ``,
      `📝 *Mensaje:*`,
      mensaje,
    ]
    .filter(l => l !== null)
    .join('\n');

    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`,
      '_blank',
      'noopener,noreferrer'
    );

    /* ── 3. Mostrar mensaje de éxito en el formulario ─────── */
    form.style.opacity   = '0';
    form.style.transform = 'translateY(10px)';
    form.style.transition = 'opacity 0.4s, transform 0.4s';

    setTimeout(() => {
      form.style.display = 'none';
      if (success) {
        success.style.display    = 'block';
        success.style.animation  = 'fadeInUp 0.6s forwards';
      }
    }, 400);
  });

  function shakeForm(el) {
    el.style.animation = 'none';
    el.offsetHeight; /* reflow */
    el.style.animation = 'shake 0.4s ease';
  }
})();

/* ─── Smooth scroll for anchor links ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
