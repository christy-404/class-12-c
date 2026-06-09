document.addEventListener('DOMContentLoaded', () => {
  const todaySchedule = document.getElementById('todaySchedule');
  const weeklyTimetable = document.getElementById('weeklyTimetable');
  const weeklyTimetableMobile = document.getElementById('weeklyTimetableMobile');
  const periodSchedule = document.getElementById('periodSchedule');


  function formatWeekday(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  function buildScheduleCard(day, subjects, activeIndex) {
    if (!subjects || !subjects.length) {
      todaySchedule.innerHTML = '<div class="schedule-card"><h3>No classes scheduled today.</h3><p>Enjoy your weekend and prepare for the week ahead.</p></div>';
      return;
    }

    const list = subjects.map((item, idx) => {
      const dot = idx === activeIndex ? '<span class="current-period-dot" aria-hidden="true"></span> ' : '';
      return `<li>${dot}${item.period} – ${item.subject}</li>`;
    }).join('');
    todaySchedule.innerHTML = `
      <div class="schedule-card">
        <h3>Today • ${day}</h3>
        <ul>${list}</ul>
      </div>
    `;
  }

  function renderWeeklyTimetable(week) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = [
      'Period 1',
      'Period 2',
      'Period 3',
      'Period 4',
      'Period 5',
      'Period 6',
      'Period 7',
      'Period 8'
    ];

    const headerRow = `<tr><th>Day / Period</th>${periods.map((period) => `<th>${period}</th>`).join('')}</tr>`;
    const rows = days
      .map((day) => {
        const rowSchedule = week[day.toLowerCase()] || [];

        // Build cells with support for merging consecutive practical periods.
        // We only merge adjacent periods if the subjects are EXACTLY identical.
        const cells = [];

        for (let i = 0; i < periods.length; i++) {
          const period = periods[i];
          const entry = rowSchedule.find((item) => item.period === period);
          const subject = entry ? entry.subject : '';

          // If next period exists and has the exact same subject, merge using colspan=2.
          const nextPeriod = periods[i + 1];
          if (nextPeriod) {
            const nextEntry = rowSchedule.find((item) => item.period === nextPeriod);
            const nextSubject = nextEntry ? nextEntry.subject : '';

            const practicalAllowlist = new Set([
              'PHY/CHEM PRACT',
              'PHY/CS PRACT',
              'CHEM/CS PRACT',
              'CHEM/BIO PRACT'
            ]);

            // Merge only for the specified practical subjects.
            // Do NOT merge CCA or any theory subjects.
            if (subject && subject === nextSubject && practicalAllowlist.has(subject)) {
              cells.push(`<td colspan="2">${subject}</td>`);
              i++; // Skip next period (duplicate cell)
              continue;
            }
          }

          cells.push(`<td>${subject}</td>`);
        }

        return `<tr><th>${day}</th>${cells.join('')}</tr>`;
      })
      .join('');


    weeklyTimetable.innerHTML = headerRow + rows;
  }

  function renderWeeklyTimetableMobile(week) {
    if (!weeklyTimetableMobile) return;

    const days = [
      { key: 'monday', label: 'Monday' },
      { key: 'tuesday', label: 'Tuesday' },
      { key: 'wednesday', label: 'Wednesday' },
      { key: 'thursday', label: 'Thursday' },
      { key: 'friday', label: 'Friday' },
      { key: 'saturday', label: 'Saturday' }
    ];

    const cardHtml = days
      .map((d) => {
        const daySchedule = Array.isArray(week[d.key]) ? week[d.key] : [];
        const bodyId = `mobileDay_${d.key}`;

        // Build period rows from existing data order (no hardcoded periods).
        const rows = daySchedule
          .map((item) => {
            const period = item.period ?? '';
            const subject = item.subject ?? '';
            return `<li class="mobile-period-row"><span class="mobile-period">${period}</span><span class="mobile-dot">•</span><span class="mobile-subject">${subject}</span></li>`;
          })
          .join('');

        return `
          <div class="mobile-day-card" data-mobile-day-key="${d.key}">
            <button
              type="button"
              class="mobile-day-toggle"
              aria-expanded="false"
              aria-controls="${bodyId}"
              data-mobile-day-toggle="${d.key}"
            >
              <span class="mobile-day-label">${d.label}</span>
              <span class="mobile-caret" aria-hidden="true">▼</span>
            </button>

            <div class="mobile-day-body" id="${bodyId}" hidden>
              <div class="mobile-day-card-content">
                <ul class="mobile-period-list">${rows}</ul>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    weeklyTimetableMobile.innerHTML = cardHtml;

    // Accordion behavior: only one open at a time; all closed by default.
    let openKey = null;

    const toggleButtons = weeklyTimetableMobile.querySelectorAll('[data-mobile-day-toggle]');
    toggleButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-mobile-day-toggle');
        if (!key) return;

        // Standard accordion behavior:
        // tapping the already-open day closes it.
        if (openKey === key) {
          btn.setAttribute('aria-expanded', 'false');
          const caret = btn.querySelector('.mobile-caret');
          if (caret) caret.textContent = '▼';

          const body = weeklyTimetableMobile.querySelector(`#mobileDay_${key}`);
          if (body) body.hidden = true;

          openKey = null;
          return;
        }


        // Close previously open.
        if (openKey) {
          const prevBtn = weeklyTimetableMobile.querySelector(`[data-mobile-day-toggle="${openKey}"]`);
          const prevBody = weeklyTimetableMobile.querySelector(`#mobileDay_${openKey}`);
          if (prevBtn && prevBody) {
            prevBtn.setAttribute('aria-expanded', 'false');
            const prevCaret = prevBtn.querySelector('.mobile-caret');
            if (prevCaret) prevCaret.textContent = '▼';
            prevBody.hidden = true;
          }
        }

        // Open current.
        const body = weeklyTimetableMobile.querySelector(`#mobileDay_${key}`);
        btn.setAttribute('aria-expanded', 'true');
        const caret = btn.querySelector('.mobile-caret');
        if (caret) caret.textContent = '▲';
        if (body) body.hidden = false;

        openKey = key;
      });
    });
  }


  function parsePeriodTimeRange(rangeStr) {

    // Expected format from timetable.json: "8:50 AM - 9:30 AM"
    const parts = String(rangeStr).split('-').map((s) => s.trim());
    if (parts.length !== 2) return null;

    const start = parts[0];
    const end = parts[1];

    // Parse as IST (Asia/Kolkata). IST offset is fixed: +05:30.
    // We convert IST wall-clock times to comparable UTC timestamps.
    const toTimeParts = (t) => {
      // "H:MM AM/PM" or "HH:MM AM/PM"
      const m = String(t).match(/^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i);
      if (!m) return null;
      let hh = Number(m[1]);
      const mm = Number(m[2]);
      const ap = m[3].toUpperCase();
      if (ap === 'PM' && hh !== 12) hh += 12;
      if (ap === 'AM' && hh === 12) hh = 0;
      return { hh, mm };
    };

    const s = toTimeParts(start);
    const e = toTimeParts(end);
    if (!s || !e) return null;

    const now = new Date();

    // Current IST date (not time zone name-based, just fixed offset)
    const nowIstMs = now.getTime() + 5.5 * 60 * 60 * 1000;
    const nowIst = new Date(nowIstMs);

    const y = nowIst.getUTCFullYear();
    const mo = nowIst.getUTCMonth();
    const d = nowIst.getUTCDate();

    const istWallToUtcMs = (hh, minute) => {
      // Create an instant equal to the given IST wall-clock time.
      // If that wall time is interpreted as UTC, subtract 5:30 to get the real instant.
      const istWallAsUtc = Date.UTC(y, mo, d, hh, minute, 0);
      return istWallAsUtc - 5.5 * 60 * 60 * 1000;
    };

    return {
      startMs: istWallToUtcMs(s.hh, s.mm),
      endMs: istWallToUtcMs(e.hh, e.mm)
    };
  }


  function getActivePeriodIndex(periodTimes) {
    if (!Array.isArray(periodTimes) || periodTimes.length === 0) return -1;

    // Determine active period using current IST time + period start/end times only.
    const nowUtc = Date.now();
    // Convert "now" to UTC-ms and compare against IST-derived start/end in UTC.
    // (parsePeriodTimeRange() returns timestamps in UTC-ms, mapped from IST wall-clock times.)

    for (let i = 0; i < periodTimes.length; i++) {
      const t = periodTimes[i] && periodTimes[i].time;
      const parsed = parsePeriodTimeRange(t);
      if (!parsed) continue;

      const { startMs, endMs } = parsed;
      // Active interval: start inclusive, end exclusive
      if (nowUtc >= startMs && nowUtc < endMs) return i;
    }

    return -1;
  }

  function renderPeriodSchedule(periods) {
    if (!periods.length) {
      periodSchedule.innerHTML = '<li>No schedule available.</li>';
      return;
    }

    const activeIndex = getActivePeriodIndex(periods);

    periodSchedule.innerHTML = [
      ...periods.map((item, idx) => {
        const dot = idx === activeIndex ? '<span class="current-period-dot" aria-hidden="true"></span> ' : '';
        return `<li>${dot}<strong>${item.period}</strong> – ${item.time}</li>`;
      }),
      ].join('');
  }


  fetch('data/timetable.json')
    .then((response) => response.json())
    .then((data) => {
      const now = new Date();
      const weekday = formatWeekday(now);
      const dayKey = weekday.toLowerCase();
      // Allow Saturday as a valid school day.
      // Sunday remains without classes (no timetable data in data/timetable.json).
      const today = data.week[dayKey] || [];
      const activeIndex = getActivePeriodIndex(data.periodTimes);
      buildScheduleCard(weekday, today, activeIndex);
      // Desktop: weekly table. Mobile (<767px): collapsible day cards.
      if (window.matchMedia && window.matchMedia('(max-width: 767px)').matches) {
        renderWeeklyTimetableMobile(data.week);
      } else {
        renderWeeklyTimetable(data.week);
      }
      renderPeriodSchedule(data.periodTimes);

    })
    .catch(() => {
      todaySchedule.innerHTML = '<div class="schedule-card"><h3>Schedule unavailable.</h3></div>';
      weeklyTimetable.innerHTML = '<tr><td>Data could not be loaded.</td></tr>';
      periodSchedule.innerHTML = '<li>Unable to load timings.</li>';
    });
});
