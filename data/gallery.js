document.addEventListener('DOMContentLoaded', () => {
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryTabs = document.querySelectorAll('.gallery-tab');
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let galleryData = { photos: [], videos: [] };
  let currentTab = 'photos';
  let currentItems = [];
  let currentIndex = 0;
  let touchStartX = 0;

  async function loadGallery() {
    try {
      const response = await fetch('data/gallery.json');
      galleryData = await response.json();
      renderAlbum();
    } catch {
      galleryGrid.innerHTML = '<div class="card-panel"><p>Unable to load gallery at this time.</p></div>';
    }
  }

  function renderAlbum() {
    galleryGrid.innerHTML = '';
    const photos = galleryData.photos || [];

    const album = document.createElement('article');
    album.className = 'album-card card-panel';
    album.style.cursor = 'pointer';
    album.tabIndex = 0;
    album.setAttribute('role', 'button');

    const countText = photos.length === 1 ? '1 Photo' : `${photos.length} Photos`;
    const coverPhoto = photos[0] ? `assets/gallery/Photos/${photos[0]}` : '';

    album.innerHTML = `
      <div class="album-cover">
        ${coverPhoto ? `<img src="${coverPhoto}" alt="Class Album cover" loading="lazy" />` : ''}
      </div>
      <div class="album-copy">
        <div class="album-title">Class Album</div>
        <div class="album-count">${countText}</div>
      </div>
    `;

    function openAlbum() {
      // Activate photos tab
      currentTab = 'photos';
      galleryTabs.forEach((t) => {
        t.classList.toggle('active', t.dataset.tab === 'photos');
        t.setAttribute('aria-selected', t.dataset.tab === 'photos' ? 'true' : 'false');
      });
      renderGallery();
      // Focus the first image card for accessibility
      setTimeout(() => {
        const first = galleryGrid.querySelector('.gallery-item');
        if (first) first.focus();
      }, 120);
    }

    album.addEventListener('click', openAlbum);
    album.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAlbum();
      }
    });

    galleryGrid.appendChild(album);
  }

  function renderGallery() {
    galleryGrid.innerHTML = '';
    currentItems = galleryData[currentTab] || [];
    
    if (!currentItems.length) {
      galleryGrid.innerHTML = '<div class="card-panel"><p>No ' + currentTab + ' available.</p></div>';
      return;
    }

    currentItems.forEach((item, idx) => {
      const card = document.createElement('article');
      card.className = 'gallery-item card-panel';
      card.style.cursor = 'pointer';
      
      if (currentTab === 'photos') {
        card.innerHTML = `<img src="assets/gallery/Photos/${item}" alt="Gallery photo" loading="lazy" />`;
      } else {
        card.innerHTML = `<video style="width:100%; height:100%; object-fit:cover;"><source src="assets/videos/${item}" type="video/mp4"></video>`;
      }

      
      card.addEventListener('click', () => openLightbox(idx));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      });
      card.tabIndex = 0;
      galleryGrid.appendChild(card);
    });
  }

  function openLightbox(idx) {
    currentIndex = idx;
    updateLightbox();
    lightbox.classList.add('visible');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.classList.remove('visible');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    lightboxVideo.src = '';
  }

  function updateLightbox() {
    const item = currentItems[currentIndex];
    lightboxImage.style.display = 'none';
    lightboxVideo.style.display = 'none';
    
    if (currentTab === 'photos') {
      lightboxImage.src = `assets/gallery/Photos/${item}`;
      lightboxImage.style.display = 'block';
    } else {
      lightboxVideo.innerHTML = `<source src="assets/videos/${item}" type="video/mp4">`;

      lightboxVideo.style.display = 'block';
      lightboxVideo.load();
    }
  }

  function nextItem() {
    currentIndex = (currentIndex + 1) % currentItems.length;
    updateLightbox();
  }

  function prevItem() {
    currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
    updateLightbox();
  }

  // Tab switching
  galleryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      galleryTabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentTab = tab.dataset.tab;
      renderGallery();
    });
  });

  // Lightbox controls
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', nextItem);
  lightboxPrev.addEventListener('click', prevItem);

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('visible')) {
      closeLightbox();
    }
    if (lightbox.classList.contains('visible')) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextItem();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevItem();
      }
    }
  });

  // Swipe support
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  lightbox.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) nextItem();
    if (touchEndX - touchStartX > 50) prevItem();
  });

  // Click outside to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  loadGallery();
});

