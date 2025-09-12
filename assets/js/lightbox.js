document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll(".gallery-item img");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".lightbox .close");
    const prevBtn = document.querySelector(".lightbox .prev");
    const nextBtn = document.querySelector(".lightbox .next");

    if (!lightbox || !lightboxImg) {
        console.warn("Lightbox elements not found");
        return;
    }

    const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

    let currentIndex = 0;

    function showLightbox(index) {
        currentIndex = index;
        lightbox.style.display = "flex";
        lightboxImg.src = images[index].src;
        lightboxImg.alt = images[index].alt || "Gallery image";
        zoomReset();
    }

    images.forEach((thumb, index) => {
        thumb.addEventListener("click", (e) => {
            e.preventDefault();
            showLightbox(index);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            lightbox.style.display = "none";
            zoomReset();
        });
    }

    // ---- unify navigation paths
    function goPrev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIndex].src;
        lightboxImg.alt = images[currentIndex].alt || "Gallery image";
        zoomReset();
    }
    function goNext() {
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex].src;
        lightboxImg.alt = images[currentIndex].alt || "Gallery image";
        zoomReset();
    }

    if (prevBtn) prevBtn.addEventListener("click", goPrev);
    if (nextBtn) nextBtn.addEventListener("click", goNext);

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

    // Keyboard nav
    document.addEventListener("keydown", (e) => {
        if (lightbox.style.display === "flex") {
            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault();
                    goPrev();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    goNext();
                    break;
            }
        }
    });

    // --- Click-to-zoom + Hover-to-pan ---
    const img = lightboxImg;
    const box = lightbox;

    let scale = 1;
    let tx = 0, ty = 0;
    let zoomed = false;

    function apply() {
        clamp();
        img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }

    function clamp() {
        const vw = box.clientWidth;
        const vh = box.clientHeight;
        if (img.naturalWidth === 0) return;

        const baseW = img.offsetWidth;
        const baseH = img.offsetHeight;

        const scaledW = baseW * scale;
        const scaledH = baseH * scale;

        const maxX = Math.max(0, (scaledW - vw) / 2);
        const maxY = Math.max(0, (scaledH - vh) / 2);

        tx = Math.min(maxX, Math.max(-maxX, tx));
        ty = Math.min(maxY, Math.max(-maxY, ty));

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

        const br = box.getBoundingClientRect();
        const cx = e.clientX - br.left;
        const cy = e.clientY - br.top;
        tx = (box.clientWidth / 2) - cx;
        ty = (box.clientHeight / 2) - cy;
        apply();
    }

    const imageObserver = new MutationObserver(() => {
        zoomReset();
    });
    imageObserver.observe(img, { attributes: true, attributeFilter: ['src'] });

    img.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!zoomed) {
            zoomInAt(e);
        } else {
            zoomReset();
        }
    });

    box.addEventListener('mousemove', (e) => {
        if (!zoomed) return;
        const br = box.getBoundingClientRect();
        const cx = e.clientX - br.left;
        const cy = e.clientY - br.top;
        tx = (box.clientWidth / 2) - cx;
        ty = (box.clientHeight / 2) - cy;
        apply();
    });

    window.addEventListener('resize', () => {
        if (zoomed) apply();
    });

    // --- Mobile-only swipe nav (does not run when zoomed) ---
    (function addSwipe() {
        const supportsPointer = "PointerEvent" in window;

        let active = false;
        let startX = 0, startY = 0;
        let lastX = 0, lastY = 0;

        const SWIPE_THRESHOLD = 50;   // min horizontal movement
        const V_TOLERANCE = 40;       // max vertical drift

        function pointerXY(e) {
            if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
            return { x: e.clientX, y: e.clientY };
        }

        function onDown(e) {
            if (!isMobile() || zoomed) return;
            active = true;
            const p = pointerXY(e);
            startX = lastX = p.x;
            startY = lastY = p.y;
        }

        function onMove(e) {
            if (!active || !isMobile() || zoomed) return;
            const p = pointerXY(e);
            const dx = p.x - startX;
            const dy = p.y - startY;

            // when horizontal intent, prevent page scroll
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
                e.preventDefault?.();
            }

            lastX = p.x;
            lastY = p.y;
        }

        function onUp(e) {
            if (!active || !isMobile() || zoomed) return;
            active = false;
            const dx = lastX - startX;
            const dy = lastY - startY;

            if (Math.abs(dy) > V_TOLERANCE || Math.abs(dx) < SWIPE_THRESHOLD) return;

            if (dx < 0) {
                // left → next
                goNext();
            } else {
                // right → prev
                goPrev();
            }
        }

        if (supportsPointer) {
            // use the image as the swipe surface
            img.addEventListener("pointerdown", onDown, { passive: true });
            img.addEventListener("pointermove", onMove, { passive: false });
            img.addEventListener("pointerup", onUp, { passive: true });
            img.addEventListener("pointercancel", onUp, { passive: true });
        } else {
            img.addEventListener("touchstart", onDown, { passive: true });
            img.addEventListener("touchmove", onMove, { passive: false });
            img.addEventListener("touchend", onUp, { passive: true });
            img.addEventListener("touchcancel", onUp, { passive: true });
        }
    })();

    // Initial setup
    zoomReset();
});
