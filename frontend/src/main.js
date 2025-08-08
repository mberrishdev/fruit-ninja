import FruitNinjaRenderer from './renderer.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the application
  // eslint-disable-next-line no-unused-vars
  const renderer = new FruitNinjaRenderer();
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Could reduce update frequency when hidden
    // Intentionally minimal behavior for now
    console.log('Page hidden - could reduce update frequency');
  } else {
    console.log('Page visible - resume normal updates');
  }
});


