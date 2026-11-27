/**
 * landing.js - Portal Selection Landing Page Script
 * University Student Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  // Animate portal cards entrance
  animateCards();

  // Attach event listeners to portal buttons and cards
  initPortalCards();
});

/**
 * Adds a subtle staggered entrance animation to portal cards
 */
function animateCards() {
  const cards = document.querySelectorAll('.portal-card, .card, .portal-box');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 80 * (index + 1));
  });
}

/**
 * Initializes interaction handlers for portal selection cards
 */
function initPortalCards() {
  // Select all cards and portal action buttons
  const cards = document.querySelectorAll('.portal-card, .card, .portal-box');

  cards.forEach((card) => {
    // Find button or clickable link inside card
    const actionBtn = card.querySelector('button, a.btn, .btn, .portal-btn') || card;

    // Detect portal type from data attribute, class, or heading text
    const portalType = getPortalType(card, actionBtn);

    actionBtn.addEventListener('click', (e) => {
      // If it's an anchor with a valid href to login, let it proceed or handle it
      if (portalType === 'student') {
        window.location.href = '/login';
      } else {
        e.preventDefault();
        const displayName = formatPortalName(portalType, card);
        alert(`Coming soon! ${displayName} portal is under development.`);
      }
    });
  });

  // Also support standalone portal buttons if structured outside cards
  const standaloneBtns = document.querySelectorAll('[data-portal]');
  standaloneBtns.forEach((btn) => {
    if (btn.closest('.portal-card, .card, .portal-box')) return; // Already handled
    
    btn.addEventListener('click', (e) => {
      const type = (btn.getAttribute('data-portal') || '').toLowerCase();
      if (type === 'student') {
        window.location.href = '/login';
      } else {
        e.preventDefault();
        const name = btn.textContent.trim() || type;
        alert(`Coming soon! ${name} portal is under development.`);
      }
    });
  });
}

/**
 * Determines the portal type from the card element
 * @param {HTMLElement} card 
 * @param {HTMLElement} btn 
 * @returns {string} portal type in lowercase
 */
function getPortalType(card, btn) {
  if (card.dataset.portal) return card.dataset.portal.toLowerCase();
  if (btn && btn.dataset.portal) return btn.dataset.portal.toLowerCase();

  const titleElem = card.querySelector('h2, h3, h4, .portal-title, .card-title, .title');
  const titleText = (titleElem ? titleElem.textContent : card.textContent || '').toLowerCase();

  if (titleText.includes('student')) return 'student';
  if (titleText.includes('parent')) return 'parent';
  if (titleText.includes('faculty') || titleText.includes('teacher')) return 'faculty';
  if (titleText.includes('employee') || titleText.includes('staff')) return 'employee';
  if (titleText.includes('alumni')) return 'alumni';

  return 'other';
}

/**
 * Formats the portal name nicely for display in the alert dialog
 * @param {string} portalType 
 * @param {HTMLElement} card 
 * @returns {string} Formatted name
 */
function formatPortalName(portalType, card) {
  const titleElem = card.querySelector('h2, h3, h4, .portal-title, .card-title, .title');
  if (titleElem && titleElem.textContent.trim()) {
    return titleElem.textContent.trim();
  }

  if (portalType && portalType !== 'other') {
    return portalType.charAt(0).toUpperCase() + portalType.slice(1);
  }

  return 'Selected';
}
