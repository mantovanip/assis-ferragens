document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const revealItems = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
        revealItems.forEach(item => revealObserver.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add("is-visible"));
    }

    const parallaxItems = document.querySelectorAll("[data-parallax]");
    if (!prefersReducedMotion && parallaxItems.length) {
        let ticking = false;

        const updateParallax = () => {
            const viewport = window.innerHeight;
            parallaxItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                const media = item.querySelector(".parallax-media");
                if (!media || rect.bottom <= 0 || rect.top >= viewport) return;

                const factor = Number(item.dataset.parallax || 0.1);
                const offset = (rect.top - viewport / 2) * factor;
                media.style.transform = `scale(1.06) translate3d(0,${offset}px,0)`;
            });
            ticking = false;
        };

        const requestParallax = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(updateParallax);
        };

        window.addEventListener("scroll", requestParallax, { passive: true });
        window.addEventListener("resize", requestParallax, { passive: true });
        requestParallax();
    }

    const menuButton = document.querySelector(".menu-btn");
    const mobileMenu = document.querySelector(".mobile-nav");

    const closeMenu = () => {
        if (!menuButton || !mobileMenu) return;
        mobileMenu.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Abrir menu");
        menuButton.textContent = "☰";
    };

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", () => {
            const open = mobileMenu.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", String(open));
            menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
            menuButton.textContent = open ? "×" : "☰";
        });

        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeMenu();
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });
        });
    });

    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    const banner = document.getElementById("cookie-banner");
    const modal = document.getElementById("cookie-modal");
    const analytics = document.getElementById("cookie-analytics");
    const ads = document.getElementById("cookie-ads");
    const KEY = "assis_cookie_preferences";
    let lastFocusedElement = null;

    const openModal = () => {
        if (!modal) return;
        lastFocusedElement = document.activeElement;
        modal.hidden = false;
        const firstControl = modal.querySelector("input, button");
        if (firstControl) firstControl.focus();
    };

    const closeModal = () => {
        if (!modal) return;
        modal.hidden = true;
        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        }
    };

    const savePreferences = (analyticsAllowed = false, adsAllowed = false) => {
        try {
            localStorage.setItem(KEY, JSON.stringify({
                analytics: analyticsAllowed,
                ads: adsAllowed,
                updatedAt: new Date().toISOString()
            }));
        } catch {}
        if (banner) banner.hidden = true;
        closeModal();
    };

    try {
        const saved = JSON.parse(localStorage.getItem(KEY) || "null");
        if (saved) {
            if (analytics) analytics.checked = Boolean(saved.analytics);
            if (ads) ads.checked = Boolean(saved.ads);
            if (banner) banner.hidden = true;
        } else if (banner) {
            banner.hidden = false;
        }
    } catch {
        if (banner) banner.hidden = false;
    }

    document.querySelectorAll("[data-cookie-settings]").forEach(button => {
        button.addEventListener("click", openModal);
    });

    document.querySelectorAll("[data-cookie-close]").forEach(button => {
        button.addEventListener("click", closeModal);
    });

    document.querySelectorAll("[data-cookie-accept]").forEach(button => {
        button.addEventListener("click", () => savePreferences(true, true));
    });

    document.querySelectorAll("[data-cookie-save]").forEach(button => {
        button.addEventListener("click", () => {
            savePreferences(Boolean(analytics?.checked), Boolean(ads?.checked));
        });
    });

    if (modal) {
        modal.addEventListener("click", event => {
            if (event.target === modal) closeModal();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && !modal.hidden) closeModal();
        });
    }
});