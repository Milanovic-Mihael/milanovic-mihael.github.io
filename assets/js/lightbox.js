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
        });
    }

    function goPrev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIndex].src;
        lightboxImg.alt = images[currentIndex].alt || "Gallery image";
    }

    function goNext() {
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex].src;
        lightboxImg.alt = images[currentIndex].alt || "Gallery image";
    }

    if (prevBtn) prevBtn.addEventListener("click", goPrev);
    if (nextBtn) nextBtn.addEventListener("click", goNext);

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = "none";
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.style.display === "flex") {
            lightbox.style.display = "none";
        }
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

    lightboxImg.addEventListener('click', () => {
        window.open(lightboxImg.src, '_blank');
    });

    (function addSwipe() {
        const supportsPointer = "PointerEvent" in window;
        let active = false;
        let startX = 0, startY = 0;
        let lastX = 0, lastY = 0;

        const SWIPE_THRESHOLD = 50;
        const V_TOLERANCE = 40;

        function pointerXY(e) {
            if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
            return { x: e.clientX, y: e.clientY };
        }

        function onDown(e) {
            if (!isMobile()) return;
            active = true;
            const p = pointerXY(e);
            startX = lastX = p.x;
            startY = lastY = p.y;
        }

        function onMove(e) {
            if (!active || !isMobile()) return;
            const p = pointerXY(e);
            const dx = p.x - startX;
            const dy = p.y - startY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
                e.preventDefault?.();
            }
            lastX = p.x;
            lastY = p.y;
        }

        function onUp(e) {
            if (!active || !isMobile()) return;
            active = false;
            const dx = lastX - startX;
            const dy = lastY - startY;
            if (Math.abs(dy) > V_TOLERANCE || Math.abs(dx) < SWIPE_THRESHOLD) return;
            if (dx < 0) goNext();
            else goPrev();
        }

        if (supportsPointer) {
            lightboxImg.addEventListener("pointerdown", onDown, { passive: true });
            lightboxImg.addEventListener("pointermove", onMove, { passive: false });
            lightboxImg.addEventListener("pointerup", onUp, { passive: true });
            lightboxImg.addEventListener("pointercancel", onUp, { passive: true });
        } else {
            lightboxImg.addEventListener("touchstart", onDown, { passive: true });
            lightboxImg.addEventListener("touchmove", onMove, { passive: false });
            lightboxImg.addEventListener("touchend", onUp, { passive: true });
            lightboxImg.addEventListener("touchcancel", onUp, { passive: true });
        }
    })();
});
