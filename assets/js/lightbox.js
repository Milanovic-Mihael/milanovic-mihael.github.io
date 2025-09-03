document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll(".gallery-item img");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".lightbox .close");
    const prevBtn = document.querySelector(".lightbox .prev");
    const nextBtn = document.querySelector(".lightbox .next");

    let currentIndex = 0;

    function showLightbox(index) {
        currentIndex = index;
        lightbox.style.display = "flex";
        lightboxImg.src = images[index].src;
    }

    images.forEach((img, index) => {
        img.addEventListener("click", (e) => {
            e.preventDefault(); // prevent opening in new tab
            showLightbox(index);
        });
    });

    closeBtn.addEventListener("click", () => lightbox.style.display = "none");

    prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIndex].src;
    });

    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex].src;
    });

    // Close on background click
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) lightbox.style.display = "none";
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") lightbox.style.display = "none";
    });
});