document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll(".gallery-item img");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".lightbox .close");
    const prevBtn = document.querySelector(".lightbox .prev");
    const nextBtn = document.querySelector(".lightbox .next");

    // Check if required elements exist
    if (!lightbox || !lightboxImg) {
        console.warn("Lightbox elements not found");
        return;
    }

    let currentIndex = 0;

    function showLightbox(index) {
        currentIndex = index;
        lightbox.style.display = "flex";
        lightboxImg.src = images[index].src;
        // Add alt text for accessibility
        lightboxImg.alt = images[index].alt || "Gallery image";
        // Reset zoom when showing new image
        zoomReset();
    }

    images.forEach((thumb, index) => {
        thumb.addEventListener("click", (e) => {
            e.preventDefault();
            showLightbox(index);
        });
    });

    // Close lightbox
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            lightbox.style.display = "none";
            zoomReset();
        });
    }

    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            lightboxImg.src = images[currentIndex].src;
            lightboxImg.alt = images[currentIndex].alt || "Gallery image";
            zoomReset();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % images.length;
            lightboxImg.src = images[currentIndex].src;
            lightboxImg.alt = images[currentIndex].alt || "Gallery image";
            zoomReset();
        });
    }

    // Close on background click
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = "none";
            zoomReset();
        }
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.style.display === "flex") {
            lightbox.style.display = "none";
            zoomReset();
        }
    });

    // Add keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (lightbox.style.display === "flex") {
            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault();
                    if (prevBtn) prevBtn.click();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    if (nextBtn) nextBtn.click();
                    break;
            }
        }
    });

    // --- Click-to-zoom + Hover-to-pan functionality ---
    const img = lightboxImg;
    const box = lightbox;

    let scale = 1;
    let tx = 0, ty = 0;
    let zoomed = false;

    function apply() {
        clamp();
        // Apply transform with proper translation
        img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }

    function clamp() {
        const vw = box.clientWidth;
        const vh = box.clientHeight;

        // Wait for image to load to get accurate dimensions
        if (img.naturalWidth === 0) return;

        const baseW = img.offsetWidth;
        const baseH = img.offsetHeight;

        const scaledW = baseW * scale;
        const scaledH = baseH * scale;

        const maxX = Math.max(0, (scaledW - vw) / 2);
        const maxY = Math.max(0, (scaledH - vh) / 2);

        tx = Math.min(maxX, Math.max(-maxX, tx));
        ty = Math.min(maxY, Math.max(-maxY, ty));

        // Center if image is smaller than viewport
        if (scaledW <= vw) tx = 0;
        if (scaledH <= vh) ty = 0;
    }

    function zoomReset() {
        scale = 1;
        tx = 0;
        ty = 0;
        zoomed = false;
        img.style.transformOrigin = 'center center';
        img.dataset.zoomed = '0';
        box.classList.remove('lightbox--zoomed');
        img.style.cursor = 'zoom-in';
        apply();
    }

    function zoomInAt(e) {
        img.style.transformOrigin = 'center center';
        scale = 2;
        zoomed = true;
        img.dataset.zoomed = '1';
        box.classList.add('lightbox--zoomed');
        img.style.cursor = 'zoom-out';

        // Center the clicked point
        const br = box.getBoundingClientRect();
        const cx = e.clientX - br.left;
        const cy = e.clientY - br.top;
        tx = (box.clientWidth / 2) - cx;
        ty = (box.clientHeight / 2) - cy;
        apply();
    }

    // Reset zoom on image change
    const imageObserver = new MutationObserver(() => {
        zoomReset();
    });
    imageObserver.observe(img, { attributes: true, attributeFilter: ['src'] });

    // Click to toggle zoom
    img.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!zoomed) {
            zoomInAt(e);
        } else {
            zoomReset();
        }
    });

    // Hover-to-pan when zoomed
    box.addEventListener('mousemove', (e) => {
        if (!zoomed) return;

        const br = box.getBoundingClientRect();
        const cx = e.clientX - br.left;
        const cy = e.clientY - br.top;

        // Calculate position to keep mouse cursor at center of view
        tx = (box.clientWidth / 2) - cx;
        ty = (box.clientHeight / 2) - cy;
        apply();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (zoomed) {
            apply();
        }
    });

    // Initial setup
    zoomReset();
});