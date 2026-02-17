import PhotoSwipeLightbox from 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.3/dist/photoswipe-lightbox.esm.js';

document.addEventListener("DOMContentLoaded", () => {
    const lightbox = new PhotoSwipeLightbox({
        gallery: '.gallery-grid, .oc-header',
        children: 'a.glightbox',
        pswpModule: () => import('https://cdn.jsdelivr.net/npm/photoswipe@5.4.3/dist/photoswipe.esm.js'),

        initialZoomLevel: 'fit',
        secondaryZoomLevel: 2,
        maxZoomLevel: 4,
        doubleTapAction: 'zoom',
    });

    // Auto-detect image dimensions before opening
    lightbox.addFilter('itemData', (itemData) => {
        const img = new Image();
        img.src = itemData.src;
        img.onload = () => {
            itemData.width = img.width;
            itemData.height = img.height;
            lightbox.pswp.refreshSlideContent(itemData.index);
        };
        return itemData;
    });

    lightbox.init();
});