// main.js
// Handles: mobile menu, reveal on scroll, progress bar, counters, and lightbox

document.addEventListener('DOMContentLoaded', function () {
  // Mobile menu toggle with aria
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
      const expanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', String(!expanded));
      if (mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden','true');
      } else {
        mobileMenu.classList.add('open');
        mobileMenu.setAttribute('aria-hidden','false');
      }
    });
  }

  // Smooth scrolling for internal links (including mobile)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      if (this.getAttribute('href') === '#') return;
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden','true');
        if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded','false');
      }
      target.scrollIntoView({ behavior: 'smooth', block:'start' });
    });
  });

  /***** IntersectionObserver reveal for sections *****/
  const revealElements = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        entry.target.classList.remove('reveal'); // optional
        revealObserver.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  /***** Scroll progress bar *****/
  const progressBar = document.getElementById('progress');
  function updateProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / Math.max(docHeight, 1)) * 100;
    if (progressBar) progressBar.style.width = scrolled + '%';
  }
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  /***** Counters using CountUp.js triggered by IntersectionObserver *****/
  // If CountUp isn't ready yet, we'll wait for load
  function initCounters() {
    if (!window.CountUp) return;
    const counters = [
      { id: 'stat-1', end: parseFloat(document.getElementById('stat-1').dataset.target) || 0 },
      { id: 'stat-2', end: parseFloat(document.getElementById('stat-2').dataset.target) || 0 }
    ];
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const id = el.id;
          const target = counters.find(c => c.id === id);
          if (target && !el.dataset.animated) {
            const options = { duration: 2.2, separator: ',' };
            if (id !== 'stat-3') {
              const countUp = new CountUp.CountUp(id, target.end, options);
              if (!countUp.error) countUp.start();
            }
            el.dataset.animated = 'true';
          }
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.25 });

    document.querySelectorAll('.stat-number').forEach(s => {
      if (s.id) countObserver.observe(s);
    });
  }

  if (window.CountUp) {
    initCounters();
  } else {
    window.addEventListener('load', initCounters);
  }

  /***** Lightbox (basic but functional) *****/
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxText = document.getElementById('lightbox-text');
  const closeBtn = document.getElementById('close-btn');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');

  const galleryButtons = Array.from(document.querySelectorAll('.gallery-item button'));
  let currentIndex = -1;

  function openLightbox(index) {
    if (index < 0 || index >= galleryButtons.length) return;
    const btn = galleryButtons[index];
    const src = btn.dataset.full;
    const caption = btn.dataset.caption || '';
    lightboxImage.src = src;
    lightboxImage.alt = caption;
    lightboxText.textContent = caption;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    currentIndex = index;
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    lightboxImage.src = '';
    currentIndex = -1;
  }

  function showNext() { openLightbox((currentIndex + 1) % galleryButtons.length); }
  function showPrev() { openLightbox((currentIndex - 1 + galleryButtons.length) % galleryButtons.length); }

  galleryButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => openLightbox(i));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  // keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox && lightbox.classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    }
  });

  // close when clicking outside content
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
});
