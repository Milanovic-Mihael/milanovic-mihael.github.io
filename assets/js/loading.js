document.addEventListener('DOMContentLoaded', function () {
  try {
    // Lazy load images using IntersectionObserver
    const lazyImages = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            obs.unobserve(img);
          }
        });
      }, { rootMargin: "200px" }); // preload a bit before entering viewport

      lazyImages.forEach(img => observer.observe(img));
    } else {
      // fallback: load all images immediately
      lazyImages.forEach(img => img.src = img.dataset.src);
    }
  } catch (error) {
    console.error('Error lazy loading images:', error);
  }
});