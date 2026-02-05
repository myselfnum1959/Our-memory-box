// ===========================
// MEMORY UPLOAD FEATURE
// ===========================

const initializeMemoryUpload = () => {
  const fileInput = document.getElementById('imageUpload');
  const fileNameDisplay = document.getElementById('fileName');
  const captionInput = document.getElementById('captionInput');
  const dateInput = document.getElementById('dateInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const memoryGallery = document.querySelector('.memory-gallery');

  let selectedFile = null;

  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;

  // Handle file selection
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedFile = file;
      fileNameDisplay.textContent = file.name;
      checkFormValid();
    }
  });

  // Check if form is valid
  const checkFormValid = () => {
    if (selectedFile && captionInput.value.trim() && dateInput.value) {
      uploadBtn.disabled = false;
    } else {
      uploadBtn.disabled = true;
    }
  };

  // Listen for input changes
  captionInput.addEventListener('input', checkFormValid);
  dateInput.addEventListener('change', checkFormValid);

  // Handle upload button click
  uploadBtn.addEventListener('click', () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      const caption = captionInput.value.trim();
      const date = new Date(dateInput.value);
      
      // Format date nicely
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Create new memory card
      const memoryItem = document.createElement('div');
      memoryItem.className = 'memory-item';
      memoryItem.innerHTML = `
        <div class="memory-card">
          <img src="${imageUrl}" alt="${caption}">
          <div class="memory-info">
            <p class="memory-caption">${caption}</p>
            <p class="memory-date">${formattedDate}</p>
          </div>
        </div>
      `;

      // Add animation
      memoryItem.style.opacity = '0';
      memoryItem.style.transform = 'translateY(30px)';
      
      // Insert at the beginning of the gallery
      memoryGallery.insertBefore(memoryItem, memoryGallery.firstChild);

      // Trigger animation
      setTimeout(() => {
        memoryItem.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        memoryItem.style.opacity = '1';
        memoryItem.style.transform = 'translateY(0)';
      }, 10);

      // Save to localStorage
      saveMemoryToStorage(imageUrl, caption, formattedDate);

      // Reset form
      resetUploadForm();

      // Scroll to the new memory
      setTimeout(() => {
        memoryItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    };

    reader.readAsDataURL(selectedFile);
  });

  // Reset form
  const resetUploadForm = () => {
    fileInput.value = '';
    captionInput.value = '';
    dateInput.value = today;
    fileNameDisplay.textContent = 'Choose a photo';
    selectedFile = null;
    uploadBtn.disabled = true;
  };

  // Save memory to localStorage
  const saveMemoryToStorage = (imageUrl, caption, date) => {
    let memories = JSON.parse(localStorage.getItem('uploadedMemories') || '[]');
    memories.unshift({ imageUrl, caption, date, timestamp: Date.now() });
    localStorage.setItem('uploadedMemories', JSON.stringify(memories));
  };

  // Load saved memories on page load
  const loadSavedMemories = () => {
    const memories = JSON.parse(localStorage.getItem('uploadedMemories') || '[]');
    
    memories.forEach((memory, index) => {
      const memoryItem = document.createElement('div');
      memoryItem.className = 'memory-item';
      memoryItem.innerHTML = `
        <div class="memory-card">
          <img src="${memory.imageUrl}" alt="${memory.caption}">
          <div class="memory-info">
            <p class="memory-caption">${memory.caption}</p>
            <p class="memory-date">${memory.date}</p>
          </div>
        </div>
      `;
      
      // Stagger animation
      memoryItem.style.animationDelay = `${index * 0.05}s`;
      
      memoryGallery.insertBefore(memoryItem, memoryGallery.firstChild);
    });
  };

  // Load saved memories on initialization
  loadSavedMemories();
};

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
  initializeMemoryUpload();
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