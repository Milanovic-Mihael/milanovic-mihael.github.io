import PhotoSwipeLightbox from 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.3/dist/photoswipe-lightbox.esm.js';

const initGallery = () => {
    const lightbox = new PhotoSwipeLightbox({
        gallery: '.gallery-grid, .oc-header',
        children: 'a.glightbox',
        pswpModule: () => import('https://cdn.jsdelivr.net/npm/photoswipe@5.4.3/dist/photoswipe.esm.js'),
        initialZoomLevel: 'fit',
        secondaryZoomLevel: 1.5,
        maxZoomLevel: 1.5,
        doubleTapAction: 'zoom',
        pinchToClose: false,
        preload: [1, 1] // preload only previous/next images
    });

    lightbox.init();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}