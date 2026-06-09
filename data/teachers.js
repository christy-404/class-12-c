document.addEventListener('DOMContentLoaded', () => {
  const teacherGrid = document.getElementById('teacherGrid');
  const directoryToggle = document.getElementById('teacherDirectoryToggle');
  const directoryItemsWrap = document.getElementById('teacherDirectoryItems');

  let openTeacherId = null;

  function toggleDirectory(isExpanded) {
    if (!directoryToggle || !directoryItemsWrap) return;
    directoryToggle.setAttribute('aria-expanded', String(isExpanded));
    const icon = directoryToggle.querySelector('.student-list-icon');
    if (icon) icon.textContent = isExpanded ? '▲' : '▼';
    directoryItemsWrap.hidden = !isExpanded;
  }

  function setOpenTeacher(teacherId) {
    const prev = openTeacherId;
    openTeacherId = teacherId;

    if (prev && prev !== teacherId) {
      const prevBtn = document.querySelector(`[data-teacher-row="${prev}"] > button`);
      const prevPanel = document.querySelector(`[data-teacher-row="${prev}"] .teacher-directory-panel`);
      if (prevBtn) {
        prevBtn.setAttribute('aria-expanded', 'false');
        const icon = prevBtn.querySelector('.teacher-row-icon');
        if (icon) icon.textContent = '▼';
      }
      if (prevPanel) prevPanel.hidden = true;
    }

    const currentBtn = document.querySelector(`[data-teacher-row="${teacherId}"] > button`);
    const currentPanel = document.querySelector(`[data-teacher-row="${teacherId}"] .teacher-directory-panel`);
    if (!currentBtn || !currentPanel) return;

    const isExpanded = currentBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      currentBtn.setAttribute('aria-expanded', 'false');
      const icon = currentBtn.querySelector('.teacher-row-icon');
      if (icon) icon.textContent = '▼';
      currentPanel.hidden = true;
      openTeacherId = null;
    } else {
      currentBtn.setAttribute('aria-expanded', 'true');
      const icon = currentBtn.querySelector('.teacher-row-icon');
      if (icon) icon.textContent = '▲';
      currentPanel.hidden = false;
    }
  }

  function createTeacherDirectoryRow(teacher, index) {
    const rowId = teacher.id ?? teacher.name ?? index;

    const row = document.createElement('div');
    row.className = 'teacher-directory-row student-card card-panel';
    row.setAttribute('data-teacher-row', String(rowId));

    row.innerHTML = `
      <button type="button" class="teacher-directory-row-toggle" aria-expanded="false">
        <span class="teacher-row-icon" aria-hidden="true">▼</span>
        <span class="student-row-title">${teacher.name}</span>
      </button>
      <div class="teacher-directory-panel" hidden>
        <h3 class="student-directory-name">${teacher.name}</h3>
        <p><span class="label">Subject:</span> ${teacher.subject}</p>
        <p><span class="label">Qualification:</span> ${teacher.hobby}</p>
        <p class="quote">${teacher.quote}</p>
      </div>
    `;

    const btn = row.querySelector('button');
    btn.addEventListener('click', () => setOpenTeacher(String(rowId)));

    return row;
  }

  function renderTeacherDirectory(teachers) {
    teacherGrid.innerHTML = '';
    if (!teachers.length) {
      teacherGrid.innerHTML = '<div class="card-panel"><p>Teacher directory is empty.</p></div>';
      return;
    }

    teachers.forEach((teacher, i) => {
      teacherGrid.appendChild(createTeacherDirectoryRow(teacher, i));
    });
  }

  if (directoryToggle) {
    toggleDirectory(false);
    directoryToggle.addEventListener('click', () => {
      const expanded = directoryToggle.getAttribute('aria-expanded') === 'true';
      toggleDirectory(!expanded);
    });
  }

  fetch('data/teachers.json')
    .then((response) => response.json())
    .then((data) => {
      renderTeacherDirectory(data);
    })
    .catch(() => {
      teacherGrid.innerHTML = '<div class="card-panel"><p>Unable to load teacher directory.</p></div>';
    });
});

