document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-btn");
  const categoryNav = document.querySelector(".category-nav");

  if (menuButton && categoryNav) {
    menuButton.setAttribute("aria-expanded", "false");

    menuButton.addEventListener("click", () => {
      const isOpen = categoryNav.classList.toggle("mobile-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    categoryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        categoryNav.classList.remove("mobile-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});