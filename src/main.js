console.log('main.js loaded');

const countdownElement = document.getElementById('countdown');
const intro = document.getElementById('intro');
const slides = document.getElementById('slides');
const targetDate = new Date("2025-04-03T09:00:00");
const timerInterval = setInterval(updateCountdown, 1000);

// These will be populated later
let currentSlide = 0;
let slideElements = [];

function updateCountdown() {
  console.log('Updating countdown...');
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    console.log('Target date reached. Showing content.');
    countdownElement.textContent = "Content is now available!";
    clearInterval(timerInterval);

    // Hide intro, show slides
    intro.style.display = 'none';
    slides.style.display = 'block';

    initSlides(); // Load and show slides
    initDescriptionButtons(); // Wire up Prev/Next inside description
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Load slides and display the first one
function initSlides() {
  slideElements = document.querySelectorAll('.slide');
  currentSlide = 0;
  const initialHash = window.location.hash;
  const initialIndex = parseInt(initialHash.replace('#slide', ''), 10);
  if (!isNaN(initialIndex)) {
    currentSlide = Math.max(0, Math.min(initialIndex, slideElements.length - 1));
  }
  showSlide(currentSlide);

}

// Show a slide by index
function showSlide(index, push = true) {
  slideElements.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });

  if (push) {
    history.pushState({ slideIndex: index }, `Slide ${index + 1}`, `#slide${index}`);
  }
}


function initDescriptionButtons() {
  document.querySelectorAll('.prev-slide').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + slideElements.length) % slideElements.length;
      showSlide(currentSlide);
    });
  });

  document.querySelectorAll('.next-slide').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % slideElements.length;
      showSlide(currentSlide);
    });
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
  let offsetX = 0, offsetY = 0;
  let isDragging = false;

  const startDrag = (x, y) => {
    const rect = el.getBoundingClientRect();
    offsetX = x - rect.left;
    offsetY = y - rect.top;
    isDragging = true;
    el.style.zIndex = 3000;
    document.body.style.touchAction = 'none'; // Prevent scrolling while dragging
  };

  const doDrag = (x, y) => {
    if (!isDragging) return;
    el.style.left = `${x - offsetX}px`;
    el.style.top = `${y - offsetY}px`;
    el.style.transform = 'none';
  };

  const endDrag = () => {
    isDragging = false;
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



window.addEventListener('popstate', (event) => {
  const index = event.state?.slideIndex ?? 0;
  currentSlide = index;
  showSlide(currentSlide, false); // don't push to history again
});
