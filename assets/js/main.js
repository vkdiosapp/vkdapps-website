/* ============================================================
   VKD Apps — Minimal Script & Interactive Motion (Dual Theme)
   Zero-Dependency, High-Performance, Accessible
   ============================================================ */
(() => {
  "use strict";

  const safe = (name, fn) => {
    try {
      fn();
    } catch (err) {
      console.warn(`[VKD Apps] ${name}:`, err);
    }
  };

  /* ---------- 0. Theme Toggle (Dark & Light Format) ---------- */
  safe("theme", () => {
    const root = document.documentElement;
    const toggles = document.querySelectorAll(".theme-toggle");

    const getStoredTheme = () => {
      const stored = localStorage.getItem("vkd_theme");
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    };

    const setTheme = (theme) => {
      root.setAttribute("data-theme", theme);
      localStorage.setItem("vkd_theme", theme);
      toggles.forEach((t) => {
        t.setAttribute("aria-label", `Switch to ${theme === "light" ? "dark" : "light"} theme`);
        t.setAttribute("title", `Switch to ${theme === "light" ? "dark" : "light"} theme`);
      });
    };

    const currentTheme = getStoredTheme();
    setTheme(currentTheme);

    toggles.forEach((t) => {
      t.addEventListener("click", () => {
        const active = root.getAttribute("data-theme") === "light" ? "dark" : "light";
        setTheme(active);
      });
    });
  });

  /* ---------- 1. Reveal on Scroll ---------- */
  safe("reveal", () => {
    document.querySelectorAll("[data-stagger]").forEach((group) => {
      [...group.children].forEach((child, i) => {
        child.classList.add("stagger-child");
        child.dataset.delay = String(i * 60);
      });
    });

    const revealEls = document.querySelectorAll("[data-reveal], .stagger-child");
    const revealNow = (el) => el.classList.add("in-view");

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delay = parseInt(entry.target.dataset.delay || "0", 10);
              if (delay > 0) {
                setTimeout(() => revealNow(entry.target), delay);
              } else {
                revealNow(entry.target);
              }
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach(revealNow);
    }

    setTimeout(() => revealEls.forEach(revealNow), 1200);
  });

  /* ---------- 2. Procedural Film Grain Noise (Adaptive) ---------- */
  safe("film-noise", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 160;
    canvas.setAttribute("aria-hidden", "true");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const buf = new Uint32Array(imgData.data.buffer);
    for (let i = 0; i < buf.length; i++) {
      const val = Math.random() < 0.5 ? 0 : 255;
      const alpha = Math.floor(Math.random() * 22);
      buf[i] = (alpha << 24) | (val << 16) | (val << 8) | val;
    }
    ctx.putImageData(imgData, 0, 0);

    const overlay = document.createElement("div");
    overlay.className = "film-noise";
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.backgroundImage = `url(${canvas.toDataURL()})`;
    overlay.style.backgroundRepeat = "repeat";
    document.body.appendChild(overlay);
  });

  /* ---------- 3. Navigation Scroll Background ---------- */
  safe("nav", () => {
    const nav = document.querySelector(".site-nav");
    const onScroll = () => {
      if (nav) {
        nav.classList.toggle("is-scrolled", window.scrollY > 20);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  });

  /* ---------- 4. Mobile Navigation Drawer ---------- */
  safe("mobile-menu", () => {
    const navToggle = document.querySelector(".nav-toggle");
    const mobileMenu = document.getElementById("mobileMenu");
    if (!navToggle || !mobileMenu) return;

    const toggle = (open) => {
      navToggle.classList.toggle("open", open);
      mobileMenu.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.classList.contains("open");
      toggle(!isOpen);
    });

    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => toggle(false));
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navToggle.classList.contains("open")) {
        toggle(false);
      }
    });
  });

  /* ---------- 5. Interactive Device Sandbox (iOS vs Android) ---------- */
  safe("device-sandbox", () => {
    const pillIos = document.getElementById("pillIos");
    const pillAndroid = document.getElementById("pillAndroid");
    const screenTitle = document.getElementById("sandboxScreenTitle");
    const screenSub = document.getElementById("sandboxScreenSub");
    const specEngine = document.getElementById("sandboxSpecEngine");
    const specGraphics = document.getElementById("sandboxSpecGraphics");
    const specThreads = document.getElementById("sandboxSpecThreads");
    const touchBtn = document.getElementById("sandboxTouchBtn");
    const latencyVal = document.getElementById("sandboxLatencyVal");
    const bars = document.querySelectorAll(".chart-bar");

    if (!pillIos || !pillAndroid) return;

    const setPlatform = (platform) => {
      if (platform === "ios") {
        pillIos.classList.add("active");
        pillAndroid.classList.remove("active");
        if (screenTitle) screenTitle.textContent = " Apple Swift 6";
        if (screenSub) screenSub.textContent = "SwiftUI • ProMotion 120Hz";
        if (specEngine) specEngine.textContent = "Swift 6 Concurrency (Sendable / Actors)";
        if (specGraphics) specGraphics.textContent = "Apple Metal Pipeline (0 Stutter)";
        if (specThreads) specThreads.textContent = "Grand Central Dispatch + Cooperative Pool";
      } else {
        pillAndroid.classList.add("active");
        pillIos.classList.remove("active");
        if (screenTitle) screenTitle.textContent = "🤖 Android Kotlin 2.0";
        if (screenSub) screenSub.textContent = "Jetpack Compose • Vulkan Render";
        if (specEngine) specEngine.textContent = "Kotlin Coroutines & Flows (MVI Architecture)";
        if (specGraphics) specGraphics.textContent = "Android Vulkan API (Hardware-Accelerated)";
        if (specThreads) specThreads.textContent = "WorkManager + Battery-Aware Job Scheduler";
      }
      randomizeBars();
    };

    const randomizeBars = () => {
      bars.forEach((b) => {
        const h = Math.floor(Math.random() * 32) + 12;
        b.style.height = `${h}px`;
      });
    };

    pillIos.addEventListener("click", () => setPlatform("ios"));
    pillAndroid.addEventListener("click", () => setPlatform("android"));

    if (touchBtn) {
      touchBtn.addEventListener("click", () => {
        randomizeBars();
        if (latencyVal) {
          const lat = (Math.random() * 2 + 3.1).toFixed(1);
          latencyVal.textContent = `${lat}ms`;
        }
        touchBtn.textContent = "Recorded: 120 FPS ✓";
        setTimeout(() => {
          touchBtn.textContent = "Simulate Touch Event";
        }, 1200);
      });
    }

    bars.forEach((b) => {
      b.addEventListener("mouseenter", () => {
        b.classList.add("active");
      });
      b.addEventListener("mouseleave", () => {
        b.classList.remove("active");
      });
    });
  });

  /* ---------- 6. Interactive Local LLM Terminal Simulator ---------- */
  safe("neural-terminal", () => {
    const promptBtns = document.querySelectorAll(".terminal-prompt-btn");
    const terminalOutput = document.getElementById("terminalOutput");
    const tokensSecVal = document.getElementById("tokensSecVal");
    const ramFootprintVal = document.getElementById("ramFootprintVal");
    const cloudEgressVal = document.getElementById("cloudEgressVal");

    if (!terminalOutput || !promptBtns.length) return;

    const scenarios = {
      summary: {
        text: `>> [CoreML::NeuralEngine] Initializing quantized weights (Llama-3.2-3B-Q4_K_M)...\n>> Context loaded: 4,096 tokens | Enclave: Hardware Encrypted\n\nRESULT:\n• Summary: Patient history confirmed zero contraindications for local protocol.\n• PII Status: All identifiers preserved in volatile memory.\n• Egress Check: Zero outbound socket requests verified.`,
        speed: "44.2 t/s",
        ram: "1.42 GB",
        egress: "0.00 KB"
      },
      json: {
        text: `>> [ONNX::DirectML] Parsing unstructured contract text into strict schema...\n>> Grammar-constrained sampling active (Regex JSON Schema enforcement)\n\n{\n  "contract_type": "Master Services Agreement",\n  "effective_date": "2026-11-01",\n  "liability_cap_usd": 250000,\n  "governing_law": "Delaware",\n  "ip_assignment": "Immediate client transfer 100%"\n}`,
        speed: "51.8 t/s",
        ram: "1.38 GB",
        egress: "0.00 KB"
      },
      rag: {
        text: `>> [Local Vector DB] Query: "Show Q3 unit economics breakdown"\n>> Cosine similarity search on 18,000 local embedded chunks...\n>> Top-k chunks retrieved in 6.4ms\n\nRESPONSE:\n"In Q3, gross margin reached 84.2%, with on-device AI reducing third-party cloud API costs by $38,400 per month."`,
        speed: "46.1 t/s",
        ram: "1.55 GB",
        egress: "0.00 KB"
      }
    };

    let typingTimer = null;

    const runScenario = (key) => {
      const data = scenarios[key];
      if (!data) return;

      if (typingTimer) clearInterval(typingTimer);
      terminalOutput.textContent = "";

      if (tokensSecVal) tokensSecVal.textContent = data.speed;
      if (ramFootprintVal) ramFootprintVal.textContent = data.ram;
      if (cloudEgressVal) cloudEgressVal.textContent = data.egress;

      let i = 0;
      const str = data.text;
      typingTimer = setInterval(() => {
        if (i < str.length) {
          terminalOutput.textContent += str[i];
          i++;
        } else {
          clearInterval(typingTimer);
          const cursor = document.createElement("span");
          cursor.className = "cursor-blink";
          terminalOutput.appendChild(cursor);
        }
      }, 14);
    };

    promptBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        promptBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const key = btn.dataset.scenario || "summary";
        runScenario(key);
      });
    });

    runScenario("summary");
  });

  /* ---------- 7. Interactive Billing Pipeline Simulator (Pure Technical Telemetry) ---------- */
  safe("billing-pipeline", () => {
    const triggerBtn = document.getElementById("emitEventsBtn");
    const countEl = document.getElementById("pipelineEventCount");
    const driftEl = document.getElementById("pipelineDriftStatus");
    const nodes = document.querySelectorAll(".pipeline-node");

    if (!triggerBtn || !countEl) return;

    let totalEvents = 1489200;

    triggerBtn.addEventListener("click", () => {
      triggerBtn.disabled = true;
      triggerBtn.textContent = "Processing Event Stream...";

      // Flash nodes in sequence
      nodes.forEach((n, idx) => {
        setTimeout(() => {
          n.classList.add("active");
          setTimeout(() => n.classList.remove("active"), 500);
        }, idx * 160);
      });

      const increment = 5000;
      const targetEvents = totalEvents + increment;

      const interval = setInterval(() => {
        totalEvents += 500;
        countEl.textContent = `${totalEvents.toLocaleString()} events`;

        if (totalEvents >= targetEvents) {
          clearInterval(interval);
          totalEvents = targetEvents;
          countEl.textContent = `${totalEvents.toLocaleString()} events`;
          if (driftEl) driftEl.textContent = "0.000% (Audited ✓)";
          triggerBtn.disabled = false;
          triggerBtn.textContent = "+ Emit 5,000 Usage Events";
        }
      }, 35);
    });
  });

  /* ---------- 8. Interactive Before/After Split Comparison Slider ---------- */
  safe("split-slider", () => {
    const sliderContainer = document.querySelector(".split-compare");
    const handle = document.querySelector(".compare-handle");
    const modernPanel = document.querySelector(".compare-panel.modern");

    if (!sliderContainer || !handle || !modernPanel) return;

    let isDown = false;

    const setPosition = (clientX) => {
      const rect = sliderContainer.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(20, Math.min(x, rect.width - 20));
      const pct = (x / rect.width) * 100;
      handle.style.left = `${pct}%`;
      modernPanel.style.clipPath = `polygon(${pct}% 0, 100% 0, 100% 100%, ${pct}% 100%)`;
    };

    handle.addEventListener("mousedown", () => { isDown = true; });
    window.addEventListener("mouseup", () => { isDown = false; });
    window.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      setPosition(e.clientX);
    });

    handle.addEventListener("touchstart", () => { isDown = true; }, { passive: true });
    window.addEventListener("touchend", () => { isDown = false; });
    window.addEventListener("touchmove", (e) => {
      if (!isDown || !e.touches[0]) return;
      setPosition(e.touches[0].clientX);
    }, { passive: true });

    modernPanel.style.clipPath = `polygon(50% 0, 100% 0, 100% 100%, 50% 100%)`;
    handle.style.left = `50%`;
  });

  /* ---------- 9. Architecture Stack Chips Selector ---------- */
  safe("architecture-matrix", () => {
    const chips = document.querySelectorAll(".matrix-chip");
    const layers = document.querySelectorAll(".stack-layer");

    if (!chips.length || !layers.length) return;

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chip.classList.toggle("active");
        const targetClass = chip.dataset.layer;
        layers.forEach((layer) => {
          if (layer.dataset.layerType === targetClass) {
            layer.classList.toggle("highlight", chip.classList.contains("active"));
          }
        });
      });
    });
  });

  /* ---------- 10. Subtle 3D Card Hover Tilt ---------- */
  safe("card-tilt", () => {
    if (window.matchMedia("(hover: none)").matches) return;

    const cards = document.querySelectorAll(".tilt-card, .console-box, .device-sandbox");
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3.5;
        const rotateY = ((x - centerX) / centerX) * 3.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
      });
    });
  });

  /* ---------- 11. Dynamic Year ---------- */
  safe("year", () => {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  });

  /* ---------- 12. WebMCP Tools ---------- */
  safe("webmcp", () => {
    if (!("modelContext" in document) || typeof document.modelContext.registerTool !== "function") {
      return;
    }

    const controller = new AbortController();

    document.modelContext.registerTool({
      name: "get_vkd_capabilities",
      description: "Retrieve software engineering capabilities of VKD Apps for iOS & Android development, Local LLM apps, custom billing engines, and full application redesigns.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => ({
        company: "VKD Apps",
        email: "vkdiosapp@gmail.com",
        focus: [
          {
            pillar: "iOS & Android Mobile Applications",
            description: "Native Swift 6 and Kotlin 2.0 or Flutter. 120 FPS performance, offline-first architectures, and full App Store / Google Play submission management."
          },
          {
            pillar: "Local LLM Applications",
            description: "On-device AI using CoreML, ONNX Runtime, and quantized models (GGUF). 100% private, zero API fees, hardware-accelerated."
          },
          {
            pillar: "Custom Billing Solutions",
            description: "High-throughput metered engines, automated multi-currency invoicing pipelines, and custom subscription ledger infrastructure."
          },
          {
            pillar: "Full Application Redesign & Modernization",
            description: "Complete UI/UX overhaul, 120 FPS performance tuning, elimination of technical debt, legacy framework deprecation, and zero-downtime database migration."
          },
          {
            pillar: "Bespoke Product Engineering",
            description: "Building custom digital products engineered from ground up to client specifications."
          }
        ]
      })
    }, { signal: controller.signal });
  });
})();
