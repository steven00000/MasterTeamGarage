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

// Carousel
const track = document.querySelector('.carousel-track');
const slides = track ? Array.from(track.children) : [];
const nextButton = document.querySelector('.carousel-btn.next');
const prevButton = document.querySelector('.carousel-btn.prev');
let currentSlide = 0;

function updateCarousel() {
  if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
}
nextButton?.addEventListener('click', () => { currentSlide = (currentSlide + 1) % slides.length; updateCarousel(); });
prevButton?.addEventListener('click', () => { currentSlide = (currentSlide - 1 + slides.length) % slides.length; updateCarousel(); });
if (slides.length) setInterval(() => { currentSlide = (currentSlide + 1) % slides.length; updateCarousel(); }, 8000);

// Halo “À propos”
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

// Carte Leaflet — Master Team Garage (Garéoult)
(() => {
  const el = document.getElementById('map-multi');
  if (!el || !window.L) return;

  // Coords approximatives du centre de Garéoult (tu peux affiner)
  const GARÉOULT = [43.336, 6.047];

  const map = L.map(el, { scrollWheelZoom: false, zoomControl: true }).setView(GARÉOULT, 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

  // Pastille rouge/or
  const icon = L.divIcon({
    className: "mtg-pin",
    html: `<span></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
  const css = document.createElement('style');
  css.textContent = `
    .mtg-pin span{
      display:inline-block; width:14px; height:14px; border-radius:50%;
      background: radial-gradient(circle at 35% 35%, #fff 0%, #E0261D 45%, #F0B000 100%);
      box-shadow: 0 0 0 3px rgba(240,176,0,.25), 0 6px 14px rgba(0,0,0,.35);
    }
    .leaflet-popup-content-wrapper{ background:#121218; color:#ECECF2; border:1px solid #21212a; }
    .leaflet-popup-tip{ background:#121218; }
    .leaflet-control-attribution{ color:#9aa0ad; }
  `;
  document.head.appendChild(css);

  const m = L.marker(GARÉOULT, { icon }).addTo(map);
  m.bindPopup(`<strong>Master Team Garage</strong><br>Imp. Romain Rolland, 83136 Garéoult<br><a target="_blank" rel="noopener" href="https://maps.google.com/?q=Imp.%20Romain%20Rolland,%2083136%20Gar%C3%A9oult">Itinéraire</a>`);
})();
