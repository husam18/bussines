(function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const siteHeader = document.querySelector(".site-header");
  const languageSelect = document.querySelector(".language-select");
  const navigation = navLinks ? navLinks.closest("nav") : null;

  if (menuToggle && navLinks && siteHeader && navigation) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("is-open");
      navigation.classList.remove("is-open");
    };

    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(open));
      navLinks.classList.toggle("is-open", open);
      navigation.classList.toggle("is-open", open);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    if (languageSelect) languageSelect.addEventListener("change", closeMenu);

    document.addEventListener("click", (event) => {
      if (!siteHeader.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
        closeMenu();
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 850) closeMenu();
    });
  }
})();
