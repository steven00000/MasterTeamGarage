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
}, 10000);

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

// ===== Contact form (validation + envoi) =====
(function(){
  const form = document.getElementById('contact-form');
  if(!form) return;

  // OPTION: mets ici ton endpoint Formspree pour un envoi sans backend
  // Laisse vide "" pour utiliser le fallback mailto
  const FORMSPREE_URL = ""; // ex: "https://formspree.io/f/xxxxabcd"

  const status = document.getElementById('form-status');
  const sendBtn = document.getElementById('send-btn');

  const fields = {
    name: form.querySelector('[name="name"]'),
    email: form.querySelector('[name="email"]'),
    topic: form.querySelector('[name="topic"]'),
    message: form.querySelector('[name="message"]'),
    consent: form.querySelector('[name="consent"]'),
    hp: form.querySelector('[name="company"]') // honeypot
  };

  function setError(input, msg){
    const small = input.parentElement.querySelector('.error');
    if (small) small.textContent = msg || '';
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validEmail(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  function validate(){
    let ok = true;
    // honeypot
    if (fields.hp.value) return false;

    // name
    if (!fields.name.value.trim()){
      setError(fields.name, 'Veuillez indiquer votre nom.');
      ok = false;
    } else setError(fields.name, '');

    // email
    if (!validEmail(fields.email.value)){
      setError(fields.email, 'Adresse e-mail invalide.');
      ok = false;
    } else setError(fields.email, '');

    // message
    const m = fields.message.value.trim();
    if (m.length < 10){
      setError(fields.message, 'Message trop court (min. 10 caractères).');
      ok = false;
    } else setError(fields.message, '');

    // consent
    if (!fields.consent.checked){
      ok = false;
      status.textContent = 'Veuillez accepter la case de consentement.';
    }

    return ok;
  }

  async function sendFormspree(payload){
    const res = await fetch(FORMSPREE_URL, {
      method:'POST',
      headers: {'Accept':'application/json','Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('send_failed');
    const data = await res.json().catch(()=> ({}));
    return data;
  }

  function sendMailto(payload){
    const to = 'contact@association-danse.fr'; // ← remplace par votre e-mail
    const subject = encodeURIComponent(`Contact site — ${payload.topic}`);
    const body = encodeURIComponent(
      `Nom: ${payload.name}\nEmail: ${payload.email}\nSujet: ${payload.topic}\n\n${payload.message}`
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    status.textContent = '';
    if (!validate()) return;

    const payload = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      topic: fields.topic.value,
      message: fields.message.value.trim()
    };

    // anti-double envoi
    sendBtn.disabled = true; sendBtn.textContent = 'Envoi…';

    try{
      if (FORMSPREE_URL){
        await sendFormspree(payload);
        status.textContent = 'Merci ! Votre message a bien été envoyé.';
        form.reset();
      } else {
        // fallback mailto si pas d’URL configurée
        sendMailto(payload);
        status.textContent = 'Ouverture de votre logiciel de messagerie…';
      }
    } catch(err){
      console.error(err);
      status.textContent = "Désolé, l'envoi a échoué. Réessayez plus tard ou écrivez-nous directement.";
    } finally {
      sendBtn.disabled = false; sendBtn.textContent = 'Envoyer';
    }
  });

  // live validation légère
  ['input','blur','change'].forEach(evt=>{
    form.addEventListener(evt, (e)=>{
      const t = e.target;
      if (t === fields.name) {
        setError(t, t.value.trim() ? '' : 'Veuillez indiquer votre nom.');
      } else if (t === fields.email) {
        setError(t, validEmail(t.value) ? '' : 'Adresse e-mail invalide.');
      } else if (t === fields.message) {
        setError(t, t.value.trim().length >= 10 ? '' : 'Message trop court (min. 10 caractères).');
      }
    }, true);
  });
})();
