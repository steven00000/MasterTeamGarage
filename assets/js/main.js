// Menu mobile
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('menu');
if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      menu?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Slider très simple (témoignages)
const slider = document.querySelector('[data-slider]');
if (slider) {
  let i = 0;
  setInterval(() => {
    i = (i + 1) % 3; // 3 slides
    slider.dataset.index = String(i);
  }, 3500);
}

// Form demo
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
if (form && statusEl) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = 'Envoi…';
    const data = Object.fromEntries(new FormData(form).entries());
    console.log('Form data', data);
    await new Promise(r => setTimeout(r, 800));
    statusEl.textContent = 'Merci ! Votre message a bien été envoyé.';
    form.reset();
  });
}

// ===== Carousel Gala =====
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.carousel-btn.next');
const prevButton = document.querySelector('.carousel-btn.prev');

let currentSlide = 0;

function updateCarousel() {
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
}

nextButton.addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % slides.length;
  updateCarousel();
});

prevButton.addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  updateCarousel();
});

// Auto défilement toutes les 5s
setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  updateCarousel();
}, 5000);

// Micro-parallaxe sur les pills (optionnel)
const cloud = document.querySelector('.pills-cloud');
if (cloud) {
  let raf = null;
  cloud.addEventListener('mousemove', (e) => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const rect = cloud.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1..1
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      cloud.style.transform = `perspective(800px) rotateX(${y * -1.5}deg) rotateY(${x * 1.5}deg)`;
    });
  });
  cloud.addEventListener('mouseleave', () => {
    cloud.style.transform = 'none';
  });
}

// ===== Halo "Notre histoire" — mouvement super smooth (lerp + rAF) =====
(function () {
  const section = document.querySelector('.history-section');
  if (!section) return;
  const light = section.querySelector('.cursor-light');
  if (!light) return;

  // Couleurs qui se fondent en douceur (sur le CSS via transition)
  const colors = [
    'rgba(255,138,0,0.30)',   // orange
    'rgba(255,45,149,0.30)',  // fuchsia
    'rgba(138,43,226,0.30)'   // violet
  ];

  // Position "cible" (souris) et position "courante" (halo)
  const target = { x: section.clientWidth / 2, y: section.clientHeight / 2 };
  const state  = { x: target.x, y: target.y };

  // Facteur d’interpolation : plus petit = plus smooth (0.08–0.18 recommandé)
  const ease = 0.08;

  // Animation continue
  function tick() {
    // Lerp vers la cible
    state.x += (target.x - state.x) * ease;
    state.y += (target.y - state.y) * ease;

    // Translate GPU-friendly
    light.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Convertit l'écran -> coordonnées relatives à la section
  function toLocal(clientX, clientY) {
    const r = section.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }

  // Suivi pointeur
  section.addEventListener('mousemove', (e) => {
    const p = toLocal(e.clientX, e.clientY);
    target.x = p.x; target.y = p.y;
  });

  // Entrée sur la section (après scroll) : recalcule sans saut
  section.addEventListener('mouseenter', (e) => {
    const p = toLocal(e.clientX, e.clientY);
    // on place la cible, l’interpolation fera le reste
    target.x = p.x; target.y = p.y;
  });

  // Touch
  section.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (!t) return;
    const p = toLocal(t.clientX, t.clientY);
    target.x = p.x; target.y = p.y;
  }, { passive: true });

  // Resize : on recale la cible actuelle dans le nouveau repère
  window.addEventListener('resize', () => {
    const rect = section.getBoundingClientRect();
    // on garde la même proportion dans la section
    const px = state.x / Math.max(rect.width, 1);
    const py = state.y / Math.max(rect.height, 1);
    target.x = rect.width * px;
    target.y = rect.height * py;
  });
})();
