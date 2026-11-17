(() => {
  const photos = [...document.querySelectorAll("[data-photo]")];
  const viewer = document.getElementById("photo-viewer");

  // The image links remain usable in browsers without native modal dialogs.
  if (!photos.length || !viewer || typeof viewer.showModal !== "function") return;

  const image = document.getElementById("viewer-image");
  const credit = document.getElementById("viewer-credit");
  const count = document.getElementById("viewer-count");
  const download = document.getElementById("viewer-download");
  const status = document.getElementById("viewer-status");
  const closeButton = viewer.querySelector("[data-viewer-close]");
  const previousButton = viewer.querySelector("[data-viewer-prev]");
  const nextButton = viewer.querySelector("[data-viewer-next]");

  if (!image || !credit || !count || !download || !closeButton) return;

  let currentIndex = 0;
  let opener = null;
  let savedScroll = { x: 0, y: 0 };
  let requestId = 0;
  let adjacentImages = [];

  const announce = (message) => {
    if (status) status.textContent = message;
  };

  const renderPhoto = (index) => {
    currentIndex = (index + photos.length) % photos.length;
    const photo = photos[currentIndex];
    const thumbnail = photo.querySelector("img");
    const description = thumbnail?.alt || "NessFest photograph";
    const url = photo.href;
    const thisRequest = ++requestId;

    credit.textContent = photo.dataset.credit || "";
    count.textContent = `${currentIndex + 1} / ${photos.length}`;
    download.href = url;
    download.setAttribute("download", url.split("/").pop().split("?")[0]);
    image.alt = thumbnail?.alt || description;
    viewer.classList.add("is-loading");
    image.setAttribute("aria-busy", "true");
    announce(`Loading photo ${currentIndex + 1} of ${photos.length}.`);

    const finishLoading = (failed = false) => {
      if (thisRequest !== requestId) return;
      viewer.classList.remove("is-loading");
      image.removeAttribute("aria-busy");
      announce(failed
        ? "This photo could not be loaded. You can try opening the image link below."
        : `Photo ${currentIndex + 1} of ${photos.length}. ${description}`);
    };

    image.onload = () => finishLoading();
    image.onerror = () => finishLoading(true);
    image.src = url;

    // Cached images may already be complete before a load listener can run.
    if (image.complete) finishLoading(image.naturalWidth === 0);

    adjacentImages = [-1, 1].map((offset) => {
      const preload = new Image();
      preload.src = photos[(currentIndex + offset + photos.length) % photos.length].href;
      return preload;
    });
  };

  photos.forEach((photo, index) => {
    photo.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      opener = photo;
      savedScroll = { x: window.scrollX, y: window.scrollY };
      renderPhoto(index);

      try {
        viewer.showModal();
      } catch {
        // Preserve ordinary link navigation if the dialog cannot be opened.
        return;
      }

      event.preventDefault();
      document.body.classList.add("viewer-open");
      closeButton.focus({ preventScroll: true });
    });
  });

  closeButton.addEventListener("click", () => viewer.close());
  previousButton?.addEventListener("click", () => renderPhoto(currentIndex - 1));
  nextButton?.addEventListener("click", () => renderPhoto(currentIndex + 1));

  viewer.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      renderPhoto(currentIndex + (event.key === "ArrowLeft" ? -1 : 1));
    }
  });

  let pressedBackdrop = false;
  viewer.addEventListener("pointerdown", (event) => {
    pressedBackdrop = event.target === viewer;
  });
  viewer.addEventListener("click", (event) => {
    if (pressedBackdrop && event.target === viewer) viewer.close();
    pressedBackdrop = false;
  });

  // Escape uses the dialog's native cancel behavior and reaches this same cleanup.
  viewer.addEventListener("close", () => {
    document.body.classList.remove("viewer-open");
    viewer.classList.remove("is-loading");
    image.removeAttribute("aria-busy");
    ++requestId;
    image.onload = null;
    image.onerror = null;
    adjacentImages = [];
    announce("");
    window.scrollTo({ left: savedScroll.x, top: savedScroll.y, behavior: "instant" });
    opener?.focus({ preventScroll: true });
  });
})();
