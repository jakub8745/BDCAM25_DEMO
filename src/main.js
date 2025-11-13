console.log('main.js loaded');

const countdownElement = document.getElementById('countdown');
const intro = document.getElementById('intro');
const slides = document.getElementById('slides');
const targetDate = new Date("2025-04-03T09:00:00");
const urlParams = new URLSearchParams(window.location.search);
const skipCountdown = urlParams.has('preview') || urlParams.has('skipCountdown');
const timerInterval = setInterval(updateCountdown, 1000);

let currentSlide = 0;
let slideElements = [];
let slidesInitialized = false;
let descriptionNavInitialized = false;
let keyboardNavInitialized = false;

function updateCountdown() {
  if (!countdownElement) return;

  if (skipCountdown) {
    countdownElement.textContent = "Preview mode enabled – countdown skipped.";
    clearInterval(timerInterval);
    revealSlides();
    return;
  }

  console.log('Updating countdown...');
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    console.log('Target date reached. Showing content.');
    countdownElement.textContent = "Content is now available!";
    clearInterval(timerInterval);
    revealSlides();
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function revealSlides() {
  if (slidesInitialized) return;
  slidesInitialized = true;

  if (intro) {
    intro.style.display = 'none';
  }
  if (slides) {
    slides.style.display = 'block';
  }

  initSlides();
  initDescriptionButtons();
  initKeyboardNavigation();
}

// Load slides and display the first one
function initSlides() {
  slideElements = Array.from(document.querySelectorAll('.slide'));
  if (!slideElements.length) return;

  const initialIndex = getIndexFromHash(slideElements.length);
  currentSlide = initialIndex;
  showSlide(currentSlide, { push: false });
}

// Show a slide by index
function showSlide(index, options = {}) {
  if (!slideElements.length) return;
  const { push = true } = options;
  const normalizedIndex = ((index % slideElements.length) + slideElements.length) % slideElements.length;

  currentSlide = normalizedIndex;
  slideElements.forEach((slide, i) => {
    const isActive = i === currentSlide;
    slide.classList.toggle('active', isActive);
    slide.setAttribute('aria-hidden', (!isActive).toString());
  });

  const humanIndex = currentSlide + 1;
  const baseUrl = `${window.location.pathname}${window.location.search}`;
  const url = `${baseUrl}#slide${humanIndex}`;
  const stateData = { slideIndex: currentSlide };

  if (push) {
    history.pushState(stateData, `Slide ${humanIndex}`, url);
  } else {
    history.replaceState(stateData, `Slide ${humanIndex}`, url);
  }
}

function getIndexFromHash(totalSlides = slideElements.length) {
  const hash = window.location.hash;
  const match = hash.match(/#slide(\d+)/i);

  if (!match) return 0;

  const parsed = parseInt(match[1], 10);
  if (Number.isNaN(parsed)) return 0;

  const zeroBased = parsed > 0 ? parsed - 1 : 0;
  if (!totalSlides) return zeroBased;

  return Math.min(Math.max(zeroBased, 0), totalSlides - 1);
}

function changeSlide(delta) {
  if (!slideElements.length) return;
  const nextIndex = currentSlide + delta;
  showSlide(nextIndex);
}

function initDescriptionButtons() {
  if (descriptionNavInitialized) return;
  descriptionNavInitialized = true;

  document.querySelectorAll('.prev-slide').forEach(btn => {
    btn.addEventListener('click', () => {
      changeSlide(-1);
    });
  });

  document.querySelectorAll('.next-slide').forEach(btn => {
    btn.addEventListener('click', () => {
      changeSlide(1);
    });
  });
}

function initKeyboardNavigation() {
  if (keyboardNavInitialized) return;
  keyboardNavInitialized = true;

  document.addEventListener('keydown', event => {
    if (!slidesInitialized) return;
    if (event.key === 'ArrowRight') {
      changeSlide(1);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      changeSlide(-1);
      event.preventDefault();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Make all descriptions draggable
  document.querySelectorAll(".description-draggable").forEach(desc => {
    makeDraggable(desc);
  });

  updateCountdown();
});

// Enable drag-and-drop on the description box
function makeDraggable(el) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let elementSize = { width: 0, height: 0 };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const startDrag = (x, y) => {
    const rect = el.getBoundingClientRect();
    offsetX = x - rect.left;
    offsetY = y - rect.top;
    elementSize = { width: rect.width, height: rect.height };
    isDragging = true;
    el.style.zIndex = 3000;
    el.classList.add('dragging');
    document.body.style.touchAction = 'none'; // Prevent scrolling while dragging
  };

  const doDrag = (x, y) => {
    if (!isDragging) return;
    const maxLeft = Math.max(window.innerWidth - elementSize.width, 0);
    const maxTop = Math.max(window.innerHeight - elementSize.height, 0);
    const nextLeft = clamp(x - offsetX, 0, maxLeft);
    const nextTop = clamp(y - offsetY, 0, maxTop);

    el.style.left = `${nextLeft}px`;
    el.style.top = `${nextTop}px`;
    el.style.transform = 'none';
  };

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    el.classList.remove('dragging');
    document.body.style.touchAction = ''; // Re-enable scroll
  };

  // Mouse support
  el.addEventListener('mousedown', e => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  });

  document.addEventListener('mousemove', e => {
    doDrag(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', endDrag);

  // Touch support
  el.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  });

  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const touch = e.touches[0];
    doDrag(touch.clientX, touch.clientY);
    e.preventDefault(); // Prevent page scroll while dragging
  }, { passive: false });

  document.addEventListener('touchend', endDrag);
}

window.addEventListener('popstate', event => {
  if (!slideElements.length) return;
  const indexFromState = typeof event.state?.slideIndex === 'number'
    ? event.state.slideIndex
    : getIndexFromHash();
  showSlide(indexFromState, { push: false }); // don't push to history again
});

window.addEventListener('hashchange', () => {
  if (!slideElements.length) return;
  const index = getIndexFromHash();
  showSlide(index, { push: false });
});
