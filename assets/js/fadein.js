document.querySelectorAll("img").forEach(img => {
    img.addEventListener("load", () => {
        img.classList.add("loaded");
    });
});
