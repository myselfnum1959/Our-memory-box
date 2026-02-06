// ===========================
// SPOTIFY DESCRIPTION TOOLTIP
// ===========================

const initializeSpotifyTooltips = () => {
  const spotifyCards = document.querySelectorAll('.spotify-card');
  const descriptionBox = document.querySelector('.song-description');
  
  if (!descriptionBox) return;

  let currentCard = null;

  // Function to show description
  const showDescription = (card, description) => {
    descriptionBox.textContent = description;
    descriptionBox.classList.add('show');
    currentCard = card;
  };

  // Function to hide description
  const hideDescription = () => {
    descriptionBox.classList.remove('show');
    currentCard = null;
  };

  // Function to update tooltip position
  const updatePosition = (e) => {
    const x = e.clientX || e.touches?.[0]?.clientX;
    const y = e.clientY || e.touches?.[0]?.clientY;
    
    if (x && y) {
      const offset = 20;
      const boxWidth = descriptionBox.offsetWidth;
      const boxHeight = descriptionBox.offsetHeight;
      
      // Prevent tooltip from going off-screen
      let left = x + offset;
      let top = y + offset;
      
      if (left + boxWidth > window.innerWidth) {
        left = x - boxWidth - offset;
      }
      
      if (top + boxHeight > window.innerHeight) {
        top = y - boxHeight - offset;
      }
      
      descriptionBox.style.left = `${left}px`;
      descriptionBox.style.top = `${top}px`;
    }
  };

  // Add event listeners to each Spotify card
  spotifyCards.forEach(card => {
    const iframe = card.querySelector('iframe');
    if (!iframe) return;

    const description = iframe.getAttribute('data-description');
    if (!description) return;

    // Desktop: Mouse events
    card.addEventListener('mouseenter', () => {
      showDescription(card, description);
    });

    card.addEventListener('mouseleave', () => {
      hideDescription();
    });

    card.addEventListener('mousemove', updatePosition);

    // Mobile: Touch events
    card.addEventListener('touchstart', (e) => {
      if (currentCard === card) {
        hideDescription();
      } else {
        showDescription(card, description);
        updatePosition(e);
      }
    });
  });

  // Hide tooltip when clicking/touching elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.spotify-card')) {
      hideDescription();
    }
  });

  // Update position on scroll
  window.addEventListener('scroll', () => {
    if (currentCard) {
      hideDescription();
    }
  });
};

// ===========================
// TIME COUNTER
// ===========================

const initializeCounter = () => {
  const anniversaryDate = new Date('2024-10-18T00:00:00');
  
  const updateCounter = () => {
    const currentDate = new Date();
    const diffInMs = currentDate - anniversaryDate;
    
    // Calculate time components
    const msPerSecond = 1000;
    const msPerMinute = msPerSecond * 60;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30.44; // Average month length
    const msPerYear = msPerDay * 365.25; // Account for leap years
    
    const years = Math.floor(diffInMs / msPerYear);
    const months = Math.floor((diffInMs % msPerYear) / msPerMonth);
    const days = Math.floor((diffInMs % msPerMonth) / msPerDay);
    const hours = Math.floor((diffInMs % msPerDay) / msPerHour);
    const minutes = Math.floor((diffInMs % msPerHour) / msPerMinute);
    const seconds = Math.floor((diffInMs % msPerMinute) / msPerSecond);
    
    // Update DOM elements
    const updateElement = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value.toString().padStart(2, '0');
    };
    
    updateElement('years', years);
    updateElement('months', months);
    updateElement('days', days);
    updateElement('hours', hours);
    updateElement('minutes', minutes);
    updateElement('seconds', seconds);
    
    // Calculate total monthsaries and anniversaries
    const totalMonths = Math.floor(diffInMs / msPerMonth);
    const totalYears = years;
    
    const counterDetails = document.getElementById('counterDetails');
    if (counterDetails) {
      const anniversaryText = totalYears === 1 ? 'anniversary' : 'anniversaries';
      const monthsaryText = totalMonths === 1 ? 'monthsary' : 'monthsaries';
      counterDetails.textContent = `That's ${totalYears} ${anniversaryText} and ${totalMonths} ${monthsaryText}!`;
    }
  };
  
  // Update immediately and then every second
  updateCounter();
  setInterval(updateCounter, 1000);
};

// ===========================
// SCROLL ANIMATIONS
// ===========================

const initializeScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all memory items
  const memoryItems = document.querySelectorAll('.memory-item');
  memoryItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(item);
  });
};

// ===========================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===========================

const initializeSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
};

// ===========================
// INITIALIZE ALL FEATURES
// ===========================

const init = () => {
  initializeSpotifyTooltips();
  initializeCounter();
  initializeScrollAnimations();
  initializeSmoothScroll();
};

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}