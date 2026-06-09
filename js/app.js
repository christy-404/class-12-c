document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.topbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');

  const overlay = document.getElementById('mobileNavOverlay');
  const overlayClose = document.getElementById('mobileNavClose');
  const overlayLinks = document.querySelectorAll('[data-mobile-nav-link]');

  let scrollLocked = false;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  function lockBodyScroll() {
    if (scrollLocked) return;
    scrollLocked = true;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '0px';
  }

  function unlockBodyScroll() {
    if (!scrollLocked) return;
    scrollLocked = false;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  function openOverlay() {
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    menuToggle?.setAttribute('aria-expanded', 'true');
    lockBodyScroll();
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
    unlockBodyScroll();
  }

  function scrollToSectionFromHash(hash) {
    const id = hash?.replace('#', '');
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    // Close first to avoid any overlay covering the target.
    closeOverlay();

    // Let layout settle after closing.
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  // MOBILE: fullscreen overlay menu (only effective under 767px due to CSS)
  menuToggle?.addEventListener('click', () => {
    if (!overlay) return;
    const isOpen = overlay.classList.contains('open');
    if (isOpen) closeOverlay();
    else openOverlay();
  });

  overlayClose?.addEventListener('click', closeOverlay);

  overlayLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      scrollToSectionFromHash(href);
    });
  });

  // Desktop behavior: keep the old class toggling (in case desktop breakpoint shows it)
  // But mobile overlay uses CSS to hide .nav-links, so this won't visually appear.
  function toggleMobileMenu() {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(!expanded));
  }

  // Preserve existing link-close behavior for desktop nav-links.
  links.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  updateHeader();
  window.addEventListener('scroll', updateHeader);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        const navLink = id ? document.querySelector(`.nav-links a[href='#${id}']`) : null;
        if (navLink) {
          navLink.classList.toggle('active', entry.isIntersecting);
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
});

