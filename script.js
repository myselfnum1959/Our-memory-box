// Select all iframe elements inside the .spotify-scroll container
const iframes = document.querySelectorAll('.spotify-scroll iframe');

// Function to create and display the description box
const createDescriptionBox = () => {
  const descriptionBox = document.createElement('div');
  descriptionBox.classList.add('song-description');
  document.body.appendChild(descriptionBox);  // Append to body for visibility on top
  return descriptionBox;
};

// Create the description box once (since we only need one that moves with the cursor)
const descriptionBox = createDescriptionBox();

// Function to show the description box and update its position
const showDescription = (iframe) => {
  const description = iframe.getAttribute('data-description');
  descriptionBox.textContent = description; // Set description text

  // Show the description box
  descriptionBox.style.display = 'block';
  descriptionBox.classList.add('show');  // Add show class to fade it in
};

// Function to hide the description box
const hideDescription = () => {
  descriptionBox.style.display = 'none';  // Hide the description box
  descriptionBox.classList.remove('show'); // Fade out the description box
};

// Function to update the position of the description box
const moveDescription = (e) => {
  const mouseX = e.pageX;
  const mouseY = e.pageY;

  // Update position relative to the cursor with a slight offset
  descriptionBox.style.left = `${mouseX + 15}px`; // 15px offset to the right of the cursor
  descriptionBox.style.top = `${mouseY + 15}px`;  // 15px offset below the cursor
};

// Loop through each iframe and add event listeners
iframes.forEach(iframe => {
  // Hover effect for desktop (shows description)
  iframe.addEventListener('mouseover', () => {
    showDescription(iframe);
  });

  // Mouse out event for hiding the description box
  iframe.addEventListener('mouseout', () => {
    hideDescription();
  });

  // Mouse move event to follow the cursor
  iframe.addEventListener('mousemove', (e) => {
    moveDescription(e);
  });

  // Click event for mobile to toggle description visibility
  iframe.addEventListener('click', (e) => {
    // Toggle visibility when clicked
    if (descriptionBox.style.display === 'none') {
      showDescription(iframe);
    } else {
      hideDescription();
    }
    // Prevent event from bubbling to avoid accidental hiding
    e.stopPropagation();
  });
});

// Ensure description box always follows the cursor globally
document.addEventListener('mousemove', (e) => {
  // Only update position when the description box is visible
  if (descriptionBox.style.display === 'block') {
    moveDescription(e);
  }
});

