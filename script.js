/* ═══════════════════════════════════════════════════
   ARHAM — PORTFOLIO SCRIPT
   Handles: smooth scrolling · scroll animations
            active nav · hamburger menu · form validation
            scroll-to-top
   ═══════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────
   DOM REFERENCES
────────────────────────────────── */
const navbar       = document.getElementById('navbar');
const navLinks     = document.getElementById('navLinks');
const hamburger    = document.getElementById('hamburger');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const contactForm  = document.getElementById('contactForm');
const formSuccess  = document.getElementById('formSuccess');

/* All anchors that start with # */
const allNavAnchors = document.querySelectorAll('a[href^="#"]');

/* Elements to animate on scroll */
const fadeUpEls = document.querySelectorAll('.fade-up');

/* All sections used for active-nav detection */
const sections = document.querySelectorAll('section[id]');

/* ──────────────────────────────────
   1. STICKY NAVBAR — style on scroll
────────────────────────────────── */
function handleNavbarScroll() {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

/* ──────────────────────────────────
   2. SCROLL-TO-TOP BUTTON VISIBILITY
────────────────────────────────── */
function handleScrollTopBtn() {
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('show');
  } else {
    scrollTopBtn.classList.remove('show');
  }
}

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ──────────────────────────────────
   3. ACTIVE NAV LINK — IntersectionObserver
────────────────────────────────── */
const navLinkEls = document.querySelectorAll('.nav-links a');

function setActiveLink(id) {
  navLinkEls.forEach(link => {
    if (link.getAttribute('href') === `#${id}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    rootMargin: '-45% 0px -45% 0px', // trigger when section is ~halfway in view
    threshold: 0,
  }
);

sections.forEach(sec => sectionObserver.observe(sec));

/* ──────────────────────────────────
   4. SMOOTH SCROLLING (for all # links)
────────────────────────────────── */
allNavAnchors.forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;

    e.preventDefault();

    // Offset for fixed navbar height
    const navHeight = navbar.offsetHeight;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });

    // Close mobile menu if open
    closeMobileMenu();
  });
});

/* ──────────────────────────────────
   5. HAMBURGER / MOBILE MENU
────────────────────────────────── */
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  // Prevent body scroll when menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

function closeMobileMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

/* Close mobile menu on resize to desktop */
window.addEventListener('resize', () => {
  if (window.innerWidth > 640) {
    closeMobileMenu();
  }
});

/* ──────────────────────────────────
   6. SCROLL FADE-IN ANIMATION
────────────────────────────────── */
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once animated, stop observing to save resources
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  }
);

fadeUpEls.forEach(el => fadeObserver.observe(el));

/* ──────────────────────────────────
   7. FORM VALIDATION & SUBMISSION
────────────────────────────────── */
const fields = {
  name:    { el: document.getElementById('name'),    errEl: document.getElementById('nameError') },
  email:   { el: document.getElementById('email'),   errEl: document.getElementById('emailError') },
  message: { el: document.getElementById('message'), errEl: document.getElementById('messageError') },
};

/** Validate a single field, return true if valid */
function validateField(key) {
  const { el, errEl } = fields[key];
  const value = el.value.trim();
  let error = '';

  if (key === 'name') {
    if (!value) {
      error = 'Please enter your name.';
    } else if (value.length < 2) {
      error = 'Name must be at least 2 characters.';
    }
  }

  if (key === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      error = 'Please enter your email address.';
    } else if (!emailPattern.test(value)) {
      error = 'Please enter a valid email (e.g. you@example.com).';
    }
  }

  if (key === 'message') {
    if (!value) {
      error = 'Please write a message.';
    } else if (value.length < 10) {
      error = 'Message must be at least 10 characters.';
    }
  }

  // Display error state
  errEl.textContent = error;
  if (error) {
    el.classList.add('error');
  } else {
    el.classList.remove('error');
  }

  return error === '';
}

/* Live validation on blur (leaving the field) */
Object.keys(fields).forEach(key => {
  fields[key].el.addEventListener('blur', () => validateField(key));
  /* Clear error as soon as user starts correcting */
  fields[key].el.addEventListener('input', () => {
    if (fields[key].el.classList.contains('error')) {
      validateField(key);
    }
  });
});

/* Form submit handler */
contactForm.addEventListener('submit', function (e) {
  e.preventDefault();

  // Validate all fields
  const allValid = Object.keys(fields).map(validateField).every(Boolean);
  if (!allValid) return;

  // Simulate sending (no backend — portfolio is static)
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalHTML = submitBtn.innerHTML;

  submitBtn.innerHTML = '<i class="ri-loader-4-line" style="animation:spin 1s linear infinite"></i> Sending…';
  submitBtn.disabled = true;

  setTimeout(() => {
    // Reset form
    contactForm.reset();
    Object.keys(fields).forEach(key => fields[key].el.classList.remove('error'));

    // Restore button
    submitBtn.innerHTML = originalHTML;
    submitBtn.disabled = false;

    // Show success message
    formSuccess.classList.add('show');

    // Hide success message after 5 seconds
    setTimeout(() => formSuccess.classList.remove('show'), 5000);
  }, 1200);
});

/* ──────────────────────────────────
   8. COMBINED SCROLL HANDLER
────────────────────────────────── */
window.addEventListener('scroll', () => {
  handleNavbarScroll();
  handleScrollTopBtn();
}, { passive: true });

/* ──────────────────────────────────
   9. INIT — run on page load
────────────────────────────────── */
(function init() {
  handleNavbarScroll();
  handleScrollTopBtn();
})();
