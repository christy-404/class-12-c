document.addEventListener('DOMContentLoaded', () => {
  const countdownDays = document.getElementById('countdownDays');
  
  if (!countdownDays) return;

  function updateCountdown() {
    // CBSE Class XII Board Examinations typically start on February 15th
    const examDate = new Date(2027, 1, 15); // February 15, 2027 (month is 0-indexed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const timeDiff = examDate - today;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysRemaining > 0) {
      countdownDays.textContent = daysRemaining;
    } else if (daysRemaining === 0) {
      countdownDays.textContent = 'Today';
    } else {
      countdownDays.textContent = 'Completed';
    }
  }

  updateCountdown();
});
