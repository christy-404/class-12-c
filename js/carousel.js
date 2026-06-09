document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.hero-carousel');
  const isMobile = window.innerWidth < 768;
  const slides = [];
  let currentIndex = 0;
  let intervalId = null;
  let touchStartX = 0;

  const imageSources = isMobile
    ? [
        // Portrait mobile assets (fallback to existing desktop images if portrait files are not present)
        'assets/hero/heroportraitimg1.jpg',
        'assets/hero/heroportraitimg2.jpg',
        'assets/hero/heroportraitimg3.jpg',
        'assets/hero/heroportraitimg4.jpg',
      ]
    : [
        'assets/hero/imghero1.jpg',
        'assets/hero/imghero2.jpg',
        'assets/hero/imghero3.JPG',
        'assets/hero/imghero4.JPG',
        'assets/hero/imghero5.JPG',
      ];

  // TEMP DIAGNOSTIC (remove later if you want)
  console.log('[Hero Carousel] Viewport Width:', window.innerWidth);
  console.log('[Hero Carousel] isMobile(<768):', isMobile);
  console.log('[Hero Carousel] Using Images (initial):', imageSources);

  // If portrait images are missing (common in early prototypes), automatically fall back.
  if (isMobile) {
    const fallback = [
      'assets/hero/imghero1.jpg',
      'assets/hero/imghero2.jpg',
      'assets/hero/imghero3.JPG',
      'assets/hero/imghero4.JPG',
    ];

    imageSources.forEach((src, idx) => {
      const img = new Image();
      img.onload = () => {
        console.log('[Hero Carousel] Portrait loaded OK:', src);
      };
      img.onerror = () => {
        console.warn('[Hero Carousel] Portrait failed (404/missing?):', src, '-> fallback:', fallback[idx]);
        imageSources[idx] = fallback[idx];
      };
      img.src = src;
    });
  }

  for (let i = 0; i < imageSources.length; i += 1) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.style.backgroundImage = `url('${imageSources[i]}')`;
    carousel.appendChild(slide);
    slides.push(slide);
  }

  function showSlide(index) {
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === index);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  }

  function startAutoplay() {
    intervalId = setInterval(nextSlide, 6000);
  }

  function stopAutoplay() {
    clearInterval(intervalId);
  }

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  });
  carousel.addEventListener('touchend', (event) => {
    const touchEndX = event.changedTouches[0].screenX;
    if (touchEndX - touchStartX > 50) {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    }
    if (touchStartX - touchEndX > 50) {
      nextSlide();
    }
  });

  showSlide(currentIndex);
  startAutoplay();
});
