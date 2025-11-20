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
let navButtonsInitialized = false;
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

  const arrowContainer = document.getElementById('slide-arrows');
  if (arrowContainer) {
    arrowContainer.classList.add('active');
  }

  initSlides();
  initNavigationButtons();
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

function initNavigationButtons() {
  if (navButtonsInitialized) return;
  const prevButton = document.getElementById('slide-prev');
  const nextButton = document.getElementById('slide-next');

  if (!prevButton || !nextButton) return;
  navButtonsInitialized = true;

  prevButton.addEventListener('click', () => {
    changeSlide(-1);
  });

  nextButton.addEventListener('click', () => {
    changeSlide(1);
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
  updateCountdown();
});

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
