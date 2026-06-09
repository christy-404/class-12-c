document.addEventListener('DOMContentLoaded', () => {
  const calendarGrid = document.getElementById('calendarGrid');
  const calendarDetails = document.getElementById('calendarDetails');
  const monthYear = document.getElementById('calendarMonthYear');
  const prevMonth = document.getElementById('prevMonth');
  const nextMonth = document.getElementById('nextMonth');

  let calendarDate = new Date();
  const eventsByDate = {};
  const today = new Date();

  function buildEventsIndex(events) {
    events.forEach((event) => {
      const dateKey = event.date;
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });
  }

  function formatMonth(date) {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function renderDetails(dateKey) {
    const events = eventsByDate[dateKey] || [];
    if (!events.length) {
      calendarDetails.innerHTML = '<div class="card-panel"><p>No events scheduled for this date.</p></div>';
      return;
    }
    calendarDetails.innerHTML = `
      <div class="card-panel">
        <h3>Events on ${new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        ${events
          .map(
            (event) => `
            <article class="announcement-card">
              <p class="muted">${event.category}</p>
              <h3>${event.title}</h3>
              <p>${event.details}</p>
            </article>
          `
          )
          .join('')}
      </div>
    `;
  }

  function renderCalendar(date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    monthYear.textContent = formatMonth(date);

    calendarGrid.innerHTML = '';
    const start = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const dayOfWeek = start.getDay();

    const headers = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    headers.forEach((label) => {
      const headerCell = document.createElement('span');
      headerCell.textContent = label;
      headerCell.className = 'calendar-header-cell';
      calendarGrid.appendChild(headerCell);
    });

    for (let i = 0; i < dayOfWeek; i += 1) {
      const empty = document.createElement('div');
      empty.className = 'calendar-empty';
      calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= lastDay; day += 1) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'calendar-day';
      button.innerHTML = `<span>${day}</span>${eventsByDate[dateKey] ? '<span class="event-dot"></span>' : ''}`;
      if (dateKey === today.toISOString().slice(0, 10)) {
        button.classList.add('today');
      }
      button.addEventListener('click', () => {
        document.querySelectorAll('.calendar-day').forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        renderDetails(dateKey);
      });
      calendarGrid.appendChild(button);
    }

    const firstEventDate = Object.keys(eventsByDate).find((key) => key.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
    if (firstEventDate) {
      renderDetails(firstEventDate);
      const firstButton = Array.from(calendarGrid.querySelectorAll('.calendar-day')).find((button) => button.textContent.includes(String(Number(firstEventDate.split('-')[2]))));
      if (firstButton) {
        firstButton.classList.add('active');
      }
    } else {
      calendarDetails.innerHTML = '<div class="card-panel"><p>No events scheduled for this month.</p></div>';
    }
  }

  prevMonth.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar(calendarDate);
  });

  nextMonth.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar(calendarDate);
  });

  fetch('data/calendar.json')
    .then((response) => response.json())
    .then((data) => {
      buildEventsIndex(data);
      renderCalendar(calendarDate);
    })
    .catch(() => {
      calendarGrid.innerHTML = '<div class="card-panel"><p>Unable to load calendar events.</p></div>';
      calendarDetails.innerHTML = '<div class="card-panel"><p>Cannot display event details.</p></div>';
    });
});
