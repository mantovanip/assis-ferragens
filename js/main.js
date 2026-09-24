document.addEventListener("DOMContentLoaded", () => {
    const revealItems = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    revealItems.forEach(item => revealObserver.observe(item));

    const parallaxItems = document.querySelectorAll("[data-parallax]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion && parallaxItems.length) {
        const updateParallax = () => {
            const viewport = window.innerHeight;
            parallaxItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                if (rect.bottom > 0 && rect.top < viewport) {
                    const factor = Number(item.dataset.parallax || 0.1);
                    const offset = (rect.top - viewport / 2) * factor;
                    const media = item.querySelector(".parallax-media");
                    if (media) media.style.transform = `scale(1.06) translate3d(0,${offset}px,0)`;
                }
            });
        };
        window.addEventListener("scroll", updateParallax, { passive: true });
        updateParallax();
    }
    const b = document.querySelector(".menu-btn"), m = document.querySelector(".mobile-nav"); if (b && m) { b.addEventListener("click", () => { const open = m.classList.toggle("open"); b.setAttribute("aria-expanded", String(open)); b.textContent = open ? "×" : "☰" }); m.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { m.classList.remove("open"); b.setAttribute("aria-expanded", "false"); b.textContent = "☰" })) } document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const t = document.querySelector(a.getAttribute("href")); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth" }) } })); const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
    const banner = document.getElementById("cookie-banner"), modal = document.getElementById("cookie-modal"), analytics = document.getElementById("cookie-analytics"), ads = document.getElementById("cookie-ads"), KEY = "assis_cookie_preferences";
    const openModal = () => { if (modal) modal.hidden = false }, closeModal = () => { if (modal) modal.hidden = true };
    const save = (a = false, p = false) => { localStorage.setItem(KEY, JSON.stringify({ analytics: a, ads: p, updatedAt: new Date().toISOString() })); if (banner) banner.hidden = true; closeModal() };
    try { const saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved) { if (analytics) analytics.checked = !!saved.analytics; if (ads) ads.checked = !!saved.ads; if (banner) banner.hidden = true } else if (banner) banner.hidden = false } catch (e) { if (banner) banner.hidden = false }
    document.querySelectorAll("[data-cookie-settings]").forEach(x => x.addEventListener("click", openModal));
    document.querySelectorAll("[data-cookie-close]").forEach(x => x.addEventListener("click", closeModal));
    document.querySelectorAll("[data-cookie-accept]").forEach(x => x.addEventListener("click", () => save(true, true)));
    document.querySelectorAll("[data-cookie-save]").forEach(x => x.addEventListener("click", () => save(!!analytics?.checked, !!ads?.checked)));
});