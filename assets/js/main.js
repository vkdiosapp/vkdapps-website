/* ============================================================
   VKD Apps — Core interactions
   ============================================================ */
(() => {
  "use strict";

  /* ---------- Preloader ---------- */
  const preloader = document.querySelector(".preloader");
  const finishLoad = () => {
    if (!preloader) return;
    preloader.classList.add("done");
    document.body.classList.remove("is-loading");
    setTimeout(() => preloader.remove(), 600);
  };
  if (document.readyState === "complete") {
    setTimeout(finishLoad, 250);
  } else {
    window.addEventListener("load", () => setTimeout(finishLoad, 250));
  }

  /* ---------- Nav: scroll hide/show + glass bg ---------- */
  const nav = document.querySelector(".site-nav");
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle("is-scrolled", y > 40);
      if (y > lastY && y > navH) nav.classList.add("nav-hidden");
      else nav.classList.remove("nav-hidden");
    }
    updateProgress(y);
    updateBackToTop(y);
    lastY = y;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.querySelector(".scroll-progress");
  function updateProgress(y) {
    if (!progressBar) return;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = h > 0 ? `${(y / h) * 100}%` : "0%";
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.querySelector(".back-to-top");
  function updateBackToTop(y) {
    if (!backToTop) return;
    backToTop.classList.toggle("visible", y > 600);
  }
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Mobile menu ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  navToggle?.addEventListener("click", () => {
    const open = navToggle.classList.toggle("open");
    mobileMenu?.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  mobileMenu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    navToggle?.classList.remove("open");
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
  }));

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal], .stagger-child");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add("in-view"), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------- Stagger delays for groups ---------- */
  document.querySelectorAll("[data-stagger]").forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.classList.add("stagger-child");
      child.dataset.delay = i * 80;
    });
  });

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length && "IntersectionObserver" in window) {
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.counter);
        const suffix = el.dataset.suffix || "";
        const dur = 1400;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target % 1 === 0 ? Math.floor(target * eased) : (target * eased).toFixed(1);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => countIO.observe(el));
  }

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll(".accordion-item").forEach((item) => {
    const trigger = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-panel");
    trigger?.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      item.closest(".accordion")?.querySelectorAll(".accordion-item.open").forEach((other) => {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".accordion-panel").style.maxHeight = null;
          other.querySelector(".accordion-trigger").setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
    });
  });

  /* ---------- Hero glow follows mouse (cheap, transform/position only) ---------- */
  const heroGlow = document.querySelector(".hero-glow");
  const heroSection = document.querySelector(".hero");
  if (heroGlow && heroSection && window.matchMedia("(hover: hover)").matches) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      heroGlow.style.left = `${e.clientX - rect.left}px`;
      heroGlow.style.top = `${e.clientY - rect.top}px`;
    });
  }

  /* ---------- Card tilt ---------- */
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-3px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Set active nav link ---------- */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });

  /* ---------- Current year in footer ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
