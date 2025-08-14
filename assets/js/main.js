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
