(() => {
  const header = document.querySelector("[data-header]");
  const menuButton = document.querySelector("[data-menu-button]");
  const menuLabel = menuButton?.querySelector(".menu-label");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const navLinks = [...document.querySelectorAll(".desktop-nav a, .mobile-nav a")];
  const desktopLinks = [...document.querySelectorAll(".desktop-nav a")];

  const setHeaderState = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  const closeMenu = () => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", "false");
    if (menuLabel) menuLabel.textContent = "Menu";
    mobileNav.hidden = true;
    document.body.classList.remove("menu-open");
  };

  const openMenu = () => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute("aria-expanded", "true");
    if (menuLabel) menuLabel.textContent = "Close";
    mobileNav.hidden = false;
    document.body.classList.add("menu-open");
    mobileNav.querySelector("a")?.focus({ preventScroll: true });
  };

  menuButton?.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    if (expanded) closeMenu();
    else openMenu();
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
      closeMenu();
      menuButton?.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) closeMenu();
  });

  window.addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();

  const alignHashTarget = () => {
    if (!window.location.hash || window.location.hash === "#top") return;

    let target;
    try {
      target = document.querySelector(window.location.hash);
    } catch {
      return;
    }

    target?.scrollIntoView({ block: "start", behavior: "auto" });
  };

  const scheduleHashAlignment = () => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(alignHashTarget));
  };

  window.addEventListener("load", scheduleHashAlignment, { once: true });
  window.addEventListener("pageshow", scheduleHashAlignment);
  window.addEventListener("hashchange", scheduleHashAlignment);
  document.fonts?.ready.then(scheduleHashAlignment);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealElements = document.querySelectorAll("[data-reveal]");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    document.documentElement.classList.add("reveal-ready");
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10%", threshold: 0.08 },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const sectionIds = desktopLinks
    .map((link) => link.getAttribute("href"))
    .filter((href) => href?.startsWith("#"));
  const sections = sectionIds.map((id) => document.querySelector(id)).filter(Boolean);

  if ("IntersectionObserver" in window) {
    const activeSections = new Map();
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => activeSections.set(entry.target.id, entry.intersectionRatio));

        const activeId = [...activeSections.entries()]
          .filter(([, ratio]) => ratio > 0)
          .sort((a, b) => b[1] - a[1])[0]?.[0];

        desktopLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${activeId}`;
          link.classList.toggle("is-active", isActive);
          if (isActive) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-18% 0px -58%", threshold: [0, 0.12, 0.3, 0.5] },
    );

    sections.forEach((section) => navObserver.observe(section));
  }
})();
