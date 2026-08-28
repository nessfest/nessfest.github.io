(() => {
  const steps = [...document.querySelectorAll("[data-lineage-step]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    steps.forEach((step) => step.classList.add("is-traced"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-traced");
        activeObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -28%", threshold: 0.12 },
  );

  steps.forEach((step) => observer.observe(step));
})();
