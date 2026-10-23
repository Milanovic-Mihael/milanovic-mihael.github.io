import PhotoSwipeLightbox from 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.3/dist/photoswipe-lightbox.esm.js';

let lightbox = null;

const initGallery = () => {
    if (lightbox) return;
    if (!document.querySelector('.gallery-grid')) return;

    lightbox = new PhotoSwipeLightbox({
        gallery: '.gallery-grid',
        children: 'a.glightbox',
        pswpModule: () => import('https://cdn.jsdelivr.net/npm/photoswipe@5.4.3/dist/photoswipe.esm.js'),
        initialZoomLevel: 'fit',
        secondaryZoomLevel: 1.5,
        maxZoomLevel: 1.5,
        doubleTapAction: 'zoom',
        pinchToClose: false,
        preload: [1, 1]
    });

    lightbox.addFilter('itemData', (itemData) => {
        const anchor = itemData.element;
        if (anchor && anchor.dataset.pswpWidth && anchor.dataset.pswpHeight) {
            itemData.width = parseInt(anchor.dataset.pswpWidth, 10);
            itemData.height = parseInt(anchor.dataset.pswpHeight, 10);
        } else {
            const thumbImg = anchor ? anchor.querySelector('img') : null;
            if (thumbImg && thumbImg.naturalWidth && thumbImg.naturalHeight) {
                const ratio = thumbImg.naturalWidth / thumbImg.naturalHeight;
                itemData.width = ratio >= 1 ? 2400 : Math.round(2400 * ratio);
                itemData.height = ratio >= 1 ? Math.round(2400 / ratio) : 2400;
            } else {
                itemData.width = 2000;
                itemData.height = 2000;
            }
        }
        return itemData;
    });

    lightbox.init();
};

const initGifs = () => {
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
            try {
                img.dataset.static = canvas.toDataURL("image/png");
                img.src = img.dataset.static;
                img.dataset.gif = gifSrc;
            } catch (e) {
                img.dataset.gif = gifSrc;
            }
        };
        img.addEventListener("mouseenter", () => {
            if (img.dataset.gif) img.src = img.dataset.gif;
        });
        img.addEventListener("mouseleave", () => {
            if (img.dataset.static) img.src = img.dataset.static;
        });
    });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initGallery(); initGifs(); });
} else {
    initGallery();
    initGifs();
}
