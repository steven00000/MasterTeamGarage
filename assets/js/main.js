// ===== Helpers menu (centralisés)
const toggle = document.querySelector('.nav__toggle');
const menu   = document.getElementById('menu');

function isMenuOpen(){ return !!menu && menu.classList.contains('open'); }
function firstMenuFocusable(){ return menu?.querySelector('a,button'); }

function openMenu(){
  if (!menu) return;
  menu.classList.add('open');
  toggle?.setAttribute('aria-expanded','true');
  document.body.classList.add('menu-open'); // bloque le scroll de fond
  setTimeout(() => firstMenuFocusable()?.focus(), 0);
}
function closeMenu(){
  if (!menu) return;
  menu.classList.remove('open');
  toggle?.setAttribute('aria-expanded','false');
  document.body.classList.remove('menu-open'); // RESTAURE le scroll
}
function toggleMenu(){ isMenuOpen() ? closeMenu() : openMenu(); }

// Bouton hamburger
toggle?.addEventListener('click', toggleMenu);

// Fermer si clic à l’extérieur
document.addEventListener('click', (e) => {
  if (!menu || !isMenuOpen()) return;
  const clickInMenu   = menu.contains(e.target);
  const clickInToggle = toggle?.contains(e.target);
  if (!clickInMenu && !clickInToggle) closeMenu();
});

// Fermer via ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMenuOpen()) {
    closeMenu();
    toggle?.focus();
  }
});

// ===== Smooth scroll + fermeture menu mobile
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMenu(); // IMPORTANT : enlève .menu-open du body
    }
  });
});

// ===== Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Carousel (avec slide active pour Ken Burns)
const track = document.querySelector('.carousel-track');
const slides = track ? Array.from(track.children) : [];
const nextButton = document.querySelector('.carousel-btn.next');
const prevButton = document.querySelector('.carousel-btn.prev');
let currentSlide = 0;

function setActiveSlide(){
  slides.forEach((s,i) => s.classList.toggle('is-active', i === currentSlide));
}
function updateCarousel() {
  if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
  setActiveSlide();
}
nextButton?.addEventListener('click', () => { currentSlide = (currentSlide + 1) % slides.length; updateCarousel(); });
prevButton?.addEventListener('click', () => { currentSlide = (currentSlide - 1 + slides.length) % slides.length; updateCarousel(); });
if (slides.length){
  setActiveSlide();
  setInterval(() => { currentSlide = (currentSlide + 1) % slides.length; updateCarousel(); }, 8000);
}

// ===== Halo “À propos” (follow cursor)
(function () {
  const section = document.querySelector('.history-section');
  const light = section?.querySelector('.cursor-light');
  if (!section || !light) return;

  const target = { x: section.clientWidth / 2, y: section.clientHeight / 2 };
  const state  = { x: target.x, y: target.y };
  const ease = 0.08;

  function tick() {
    state.x += (target.x - state.x) * ease;
    state.y += (target.y - state.y) * ease;
    light.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function toLocal(clientX, clientY) {
    const r = section.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }
  section.addEventListener('mousemove', (e) => { const p = toLocal(e.clientX, e.clientY); target.x = p.x; target.y = p.y; });
  section.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (!t) return; const p = toLocal(t.clientX, t.clientY); target.x = p.x; target.y = p.y; }, { passive: true });
})();

// ===== Lien actif au scroll (IntersectionObserver)
(function(){
  const navLinks = Array.from(document.querySelectorAll('#menu a[href^="#"]'));
  if (!navLinks.length) return;

  const linkById = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
  const sections = Array.from(linkById.keys()).map(id => document.getElementById(id)).filter(Boolean);

  function setActive(id){
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
  }

  navLinks.forEach(a => a.addEventListener('click', () => {
    const id = a.getAttribute('href').slice(1);
    if (id) setActive(id);
  }));

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target?.id) setActive(visible.target.id);
  }, { root: null, threshold: [0, .25, .5, .75, 1], rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(sec => observer.observe(sec));

  const initial = location.hash ? location.hash.slice(1) : 'accueil';
  if (linkById.has(initial)) setActive(initial);
})();

// ===== Reveal au scroll + stagger auto
(function(){
  const selectors = [
    '.hero__eyebrow', '.hero__title', '.hero__subtitle', '.hero__actions',
    '.section__head > *', '.price', '.carousel',
    '.history-text > *', '.map-wrap', '.contact-actions > *'
  ];
  const els = selectors.flatMap(sel => Array.from(document.querySelectorAll(sel)));
  if (!els.length) return;

  const groups = new Map();
  els.forEach(el => {
    const group = el.closest('.section, .hero') || document.body;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(el);
  });

  groups.forEach(arr => {
    arr.forEach((el, i) => {
      el.setAttribute('data-animate', el.dataset.animate || 'up');
      el.style.setProperty('--i', i);
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

  els.forEach(el => io.observe(el));
})();

// ===== Parallaxe de l’aurora (ultra light)
(function(){
  const root = document.documentElement;
  let ticking = false, y = 0;
  function onScroll(){
    y = window.scrollY || 0;
    if (!ticking){
      requestAnimationFrame(() => {
        root.style.setProperty('--scroll', String(y));
        ticking = false;
      });
      ticking = true;
    }
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
})();

// ===== Tilt 3D subtil sur les cartes (.price)
(function(){
  const cards = Array.from(document.querySelectorAll('.price'));
  if (!cards.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const max = 8; // degrés
  cards.forEach(card => {
    let raf = 0;
    function onMove(e){
      const r = card.getBoundingClientRect();
      const cx = ( (e.clientX ?? e.touches?.[0]?.clientX) - r.left ) / r.width;
      const cy = ( (e.clientY ?? e.touches?.[0]?.clientY) - r.top ) / r.height;
      const rx = (cy - .5) * max;      // rotateX
      const ry = (cx - .5) * -max;     // rotateY
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      });
    }
    function reset(){ card.style.transform = '' }
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', reset);
    card.addEventListener('touchmove', onMove, { passive:true });
    card.addEventListener('touchend', reset);
  });
})();

// ===== Effet magnétique léger pour .btn et .cta-fab
(function(){
  const magnets = Array.from(document.querySelectorAll('.btn, .cta-fab'));
  if (!magnets.length || window.matchMedia('(pointer:coarse)').matches) return;

  const strength = 18; // px
  magnets.forEach(btn => {
    let raf = 0;
    function move(e){
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width/2);
      const y = e.clientY - (r.top + r.height/2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        btn.style.transform = `translate(${(x/r.width)*strength}px, ${(y/r.height)*strength}px)`;
      });
    }
    function reset(){ btn.style.transform = '' }
    btn.addEventListener('mousemove', move);
    btn.addEventListener('mouseleave', reset);
  });
})();
