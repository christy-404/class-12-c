document.addEventListener('DOMContentLoaded', () => {
  const announcementGrid = document.getElementById('announcementGrid');

  function renderAnnouncements(items) {
    if (!items.length) {
      announcementGrid.innerHTML = '<div class="card-panel"><p>No announcements available.</p></div>';
      return;
    }
    announcementGrid.innerHTML = items
      .map(
        (item) => `
        <article class="announcement-card fade-in">
          <p class="muted">${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </article>
      `
      )
      .join('');
  }

  fetch('data/announcements.json')
    .then((response) => response.json())
    .then((data) => {
      const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      renderAnnouncements(sorted);
    })
    .catch(() => {
      announcementGrid.innerHTML = '<div class="card-panel"><p>Unable to load announcements.</p></div>';
    });
});
