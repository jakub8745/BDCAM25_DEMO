const countdownElement = document.getElementById('countdown');
// Set the target date to 9:00 AM on April 2nd, 2025
const targetDate = new Date("2025-04-03T09:00:00");

function updateCountdown() {
  const now = new Date();
  const diff = targetDate - now;
  
  if (diff <= 0) {
    countdownElement.textContent = "Content is now available!";
    clearInterval(timerInterval);
    return;
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  
  countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s left`;
}

updateCountdown();
const timerInterval = setInterval(updateCountdown, 1000);
