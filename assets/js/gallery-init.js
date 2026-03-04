import PhotoSwipeLightbox from 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.3/dist/photoswipe-lightbox.esm.js';

let lightbox = null;

const initGallery = () => {
    if (lightbox) return;
    if (!document.querySelector('.gallery-grid')) return;

    document.querySelectorAll('.gallery-grid a.glightbox').forEach(a => {
        const img = new Image();
        img.src = a.href;
    });

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
        const img = new Image();
        img.src = itemData.src;
        if (img.complete) {
            itemData.width = img.naturalWidth;
            itemData.height = img.naturalHeight;
        } else {
            itemData.width = 2000;
            itemData.height = 2000;
            img.onload = () => {
                itemData.width = img.naturalWidth;
                itemData.height = img.naturalHeight;
                if (lightbox.pswp) lightbox.pswp.refreshSlideContent(itemData.index);
            };
        }
        return itemData;
    });

    lightbox.init();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
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