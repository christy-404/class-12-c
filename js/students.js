document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('studentTable');
  const tbody = table ? table.querySelector('tbody') : null;
  const headerCount = document.querySelector('#students .section-intro h2');
  const directoryToggle = document.getElementById('studentDirectoryToggle');
  const directoryItemsWrap = document.getElementById('studentDirectoryItems');

  function toggleDirectory(isExpanded) {
    if (!directoryToggle || !directoryItemsWrap) return;
    directoryToggle.setAttribute('aria-expanded', String(isExpanded));
    const icon = directoryToggle.querySelector('.student-list-icon');
    if (icon) icon.textContent = isExpanded ? '▲' : '▼';
    directoryItemsWrap.hidden = !isExpanded;
  }

  if (directoryToggle) {
    // default collapsed
    toggleDirectory(false);
    directoryToggle.addEventListener('click', () => {
      const expanded = directoryToggle.getAttribute('aria-expanded') === 'true';
      toggleDirectory(!expanded);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  fetch('data/students.json')
    .then((res) => res.json())
    .then((data) => {
      const students = (Array.isArray(data) ? data : []).map((item, i) => ({
        rollNumber: item.rollNumber ?? item.roll ?? '',
        name: item.name ?? '',
      })).sort((a, b) => (Number(a.rollNumber) || 0) - (Number(b.rollNumber) || 0));

      if (headerCount) headerCount.textContent = `${students.length} Students`;

      if (!tbody) return;
      tbody.innerHTML = students.map((s) => `
        <tr>
          <td class="roll">${escapeHtml(s.rollNumber)}</td>
          <td class="name">${escapeHtml(s.name)}</td>
        </tr>
      `).join('');
    })
    .catch(() => {
      if (table && table.parentElement) {
        table.parentElement.innerHTML = '<div class="card-panel"><p>Unable to load the class at this time.</p></div>';
      }
    });
});


