const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#site-nav');

const syncHeader = () => header?.classList.toggle('scrolled', header.hasAttribute('data-header-static') || window.scrollY > 24);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navigation?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13 });
  document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
} else {
  document.querySelectorAll('.reveal').forEach((node) => node.classList.add('visible'));
}

const form = document.querySelector('[data-contact-form]');
document.querySelectorAll('[data-interest]').forEach((link) => {
  link.addEventListener('click', () => {
    const interest = form?.querySelector('[name="interest"]');
    if (interest) interest.value = link.dataset.interest;
  });
});
document.querySelectorAll('[data-request]').forEach((link) => {
  link.addEventListener('click', () => {
    const request = form?.querySelector('[name="request"]');
    if (request) request.value = link.dataset.request;
  });
});
form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent(`${data.get('request')} Speel je Positie — ${data.get('interest')}`);
  const body = encodeURIComponent(`Naam: ${data.get('name')}\nE-mail: ${data.get('email')}\nTraject: ${data.get('interest')}\nAanvraag voor: ${data.get('financing')}\nType aanvraag: ${data.get('request')}\n\nVraag:\n${data.get('message')}`);
  window.location.href = `mailto:bart@speeljepositie.nl?subject=${subject}&body=${body}`;
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();

// Keep the supplied artwork intact, but let its individual tiles respond to scrolling.
const tileArt = document.querySelector('[data-tile-art]');
if (tileArt && !reduceMotion) {
  const tileShapes = [
    { points: [[154,340],[260,401],[260,520],[154,581],[48,520],[48,402]], drift: -.8 },
    { points: [[747,286],[836,335],[836,430],[747,480],[657,430],[657,335]], drift: .7 },
    { points: [[746,477],[836,530],[836,630],[746,684],[656,630],[656,530]], drift: -.6 },
    { points: [[1140,369],[1225,420],[1225,520],[1140,574],[1055,520],[1055,420]], drift: 1 },
    { points: [[1223,522],[1300,568],[1300,654],[1223,700],[1146,654],[1146,568]], drift: -.55 }
  ];
  const pieces = tileShapes.map(({ points, drift }) => {
    const piece = document.createElement('span');
    piece.className = 'tile-piece';
    piece.setAttribute('aria-hidden', 'true');
    piece.style.clipPath = `polygon(${points.map(([x, y]) => `${(x / 1672 * 100).toFixed(3)}% ${(y / 941 * 100).toFixed(3)}%`).join(',')})`;
    tileArt.append(piece);
    return { piece, drift };
  });
  tileArt.classList.add('animated');

  let frameRequested = false;
  const moveTiles = () => {
    frameRequested = false;
    const bounds = tileArt.getBoundingClientRect();
    if (bounds.bottom < -40 || bounds.top > window.innerHeight + 40) return;
    const progress = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
    const distance = (progress - .5) * 22;
    pieces.forEach(({ piece, drift }) => {
      piece.style.setProperty('--move-y', `${(distance * drift).toFixed(1)}px`);
      piece.style.setProperty('--move-x', `${(distance * drift * -.28).toFixed(1)}px`);
    });
  };
  const requestTileFrame = () => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(moveTiles);
  };
  window.addEventListener('scroll', requestTileFrame, { passive: true });
  window.addEventListener('resize', requestTileFrame);
  requestTileFrame();
}
