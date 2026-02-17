document.addEventListener("DOMContentLoaded", () => {
    if (typeof GLightbox !== 'undefined') {
        const lightbox = GLightbox({
            selector: '.glightbox',
            loop: true,
            zoomable: true,
            draggable: true,
            touchNavigation: true,
            touchFollowAxis: false,
            zoomOnAttributes: true,
            doubleTapZoom: 2,
            // Ensure the lightbox doesn't close when you're trying to tap/zoom
            closeOnSlideClick: false
        });

        lightbox.on('slide_after_load', (data) => {
            const { index, slideConfig, slideIndex } = data;
            const nextIndex = (index + 1) % lightbox.elements.length;
            const nextElement = lightbox.elements[nextIndex];

            if (nextElement && nextElement.href) {
                const img = new Image();
                img.src = nextElement.href;
            }
        });
    }

    const gifs = document.querySelectorAll(".gallery-item img, .featured img");
    gifs.forEach(img => {
        if (!img.src.toLowerCase().endsWith(".gif")) return;

        const gifSrc = img.src;
        const staticImg = new Image();
        staticImg.crossOrigin = "Anonymous";
        staticImg.src = gifSrc;

        staticImg.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = staticImg.width;
            canvas.height = staticImg.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(staticImg, 0, 0);
            img.dataset.static = canvas.toDataURL("image/png");
            img.src = img.dataset.static;
            img.dataset.gif = gifSrc;
        };

        img.addEventListener("mouseenter", () => {
            if (img.dataset.gif) img.src = img.dataset.gif;
        });

        img.addEventListener("mouseleave", () => {
            if (img.dataset.static) img.src = img.dataset.static;
        });
    });
});