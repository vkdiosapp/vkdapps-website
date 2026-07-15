/* ============================================================
   VKD Apps — Core interactions
   Every feature is isolated in try/catch so one failure can
   never cascade and hide unrelated content (e.g. reveal-on-scroll).
   ============================================================ */
(() => {
  "use strict";

  const safe = (name, fn) => {
    try { fn(); } catch (err) { console.error(`[main.js] ${name} failed:`, err); }
  };

  /* ---------- Reveal on scroll (with hard fallback) ---------- */
  safe("reveal", () => {
    document.querySelectorAll("[data-stagger]").forEach((group) => {
      [...group.children].forEach((child, i) => {
        child.classList.add("stagger-child");
        child.dataset.delay = i * 80;
      });
    });

    const revealEls = document.querySelectorAll("[data-reveal], .stagger-child");
    const revealNow = (el) => el.classList.add("in-view");

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay || 0;
            setTimeout(() => revealNow(entry.target), delay);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach(revealNow);
    }

    // Safety net: whatever happens with the observer, never leave
    // content permanently invisible on a production page.
    setTimeout(() => revealEls.forEach(revealNow), 2500);
  });

  /* ---------- Nav: scroll hide/show + glass bg ---------- */
  safe("nav-scroll", () => {
    const nav = document.querySelector(".site-nav");
    const progressBar = document.querySelector(".scroll-progress");
    const backToTop = document.querySelector(".back-to-top");
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
      if (progressBar) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = h > 0 ? `${(y / h) * 100}%` : "0%";
      }
      if (backToTop) backToTop.classList.toggle("visible", y > 600);
      lastY = y;
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });

    document.querySelector(".back-to-top")?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  });

  /* ---------- Mobile menu ---------- */
  safe("mobile-menu", () => {
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
  });

  /* ---------- Animated counters ---------- */
  safe("counters", () => {
    const counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;
    const runCounter = (el) => {
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
    };
    if ("IntersectionObserver" in window) {
      const countIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          countIO.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach((el) => countIO.observe(el));
      setTimeout(() => counters.forEach((el) => { if (el.textContent === "0") runCounter(el); }), 2500);
    } else {
      counters.forEach(runCounter);
    }
  });

  /* ---------- FAQ Accordion ---------- */
  safe("accordion", () => {
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
  });

  /* ---------- Hero: devices parallax with the cursor ---------- */
  safe("hero-parallax", () => {
    const stage = document.querySelector(".hero-stage");
    const heroSection = document.querySelector(".hero");
    if (!stage || !heroSection) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = null;
    let targetX = 0, targetY = 0;
    let curX = 0, curY = 0;

    const tick = () => {
      // Damped follow: eases toward the cursor and back to centre on exit.
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      stage.style.setProperty("--rx", `${curX.toFixed(2)}deg`);
      stage.style.setProperty("--ry", `${curY.toFixed(2)}deg`);
      if (Math.abs(targetX - curX) > 0.01 || Math.abs(targetY - curY) > 0.01) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };

    heroSection.addEventListener("mousemove", (e) => {
      const r = heroSection.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width - 0.5) * 20;
      targetY = -((e.clientY - r.top) / r.height - 0.5) * 12;
      start();
    });
    heroSection.addEventListener("mouseleave", () => { targetX = 0; targetY = 0; start(); });
  });

  /* ---------- Set active nav link ---------- */
  safe("active-nav", () => {
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        a.setAttribute("aria-current", "page");
      }
    });
  });

  /* ---------- Current year in footer ---------- */
  safe("footer-year", () => {
    document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
  });
})();
