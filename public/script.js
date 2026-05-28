// =============================================
// She Can Foundation — Frontend JavaScript
// =============================================
// Handles: navbar, form submission, animations,
// counter, toast, local storage fallback, etc.

const API_BASE = window.location.origin === "null" || window.location.protocol === "file:" || (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && window.location.port !== "3000"
  ? "http://localhost:3000"
  : window.location.origin;

// ── Init on DOM Ready ─────────────────────
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();   // Render all <i data-lucide="..."> icons
  initNavbar();
  initMobileMenu();
  initRevealAnimations();
  initCounterAnimation();
  initContactForm();
  initCharCounter();
  initBackToTop();
  setFooterYear();
});

// ══════════════════════════════════════════
// NAVBAR: Add background on scroll
// ══════════════════════════════════════════
function initNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // Run once on load
}

// ══════════════════════════════════════════
// MOBILE MENU: Hamburger toggle
// ══════════════════════════════════════════
function initMobileMenu() {
  const hamburger  = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen);
    mobileMenu.setAttribute("aria-hidden", !isOpen);
  });

  // Close menu when a link is clicked
  document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
      mobileMenu.setAttribute("aria-hidden", "true");
    });
  });
}

// ══════════════════════════════════════════
// REVEAL ANIMATIONS: Fade-in on scroll
// Uses Intersection Observer (modern & performant)
// ══════════════════════════════════════════
function initRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger delay based on position among siblings
          const siblings = entry.target.closest(".programs-grid, .stats-grid, .volunteer-cards, .hero-content");
          if (siblings) {
            const children = [...siblings.querySelectorAll(".reveal")];
            const index = children.indexOf(entry.target);
            entry.target.style.transitionDelay = `${index * 80}ms`;
          }
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // Only animate once
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  elements.forEach((el) => observer.observe(el));
}

// ══════════════════════════════════════════
// COUNTER ANIMATION: Count up to target number
// ══════════════════════════════════════════
function initCounterAnimation() {
  const counters = document.querySelectorAll(".stat-number[data-target]");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function animateCounter(el) {
  const target   = parseInt(el.getAttribute("data-target"), 10);
  const duration = 1800; // ms
  const start    = performance.now();

  const update = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = Math.round(eased * target);

    el.textContent = current.toLocaleString("en-IN"); // Indian number format

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString("en-IN");
  };

  requestAnimationFrame(update);
}

// ══════════════════════════════════════════
// CONTACT FORM: Validation + API submit
// ══════════════════════════════════════════
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const submitBtn = document.getElementById("submitBtn");
    setButtonLoading(submitBtn, true);
    clearAllErrors();

    // Collect form data
    const data = {
      full_name: form.full_name.value.trim(),
      email:     form.email.value.trim(),
      phone:     form.phone.value.trim(),
      city:      form.city.value.trim(),
      interest:  form.interest.value,
      message:   form.message.value.trim(),
      volunteer: form.volunteer.checked,
    };

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // ✅ Success
        showToast("✅ Message sent! We'll be in touch soon. 💜", "success");
        form.reset();
        document.getElementById("charCount").textContent = "0 / 1000";
      } else {
        // Server validation errors
        const msg = result.errors ? result.errors.join(" ") : result.message || "Something went wrong.";
        showToast("⚠️ " + msg, "error");
      }
    } catch (err) {
      // Network error — use LocalStorage fallback
      console.warn("Backend unavailable, saving to localStorage:", err.message);
      saveToLocalStorage(data);
      showToast("📦 Saved locally (backend offline). We'll sync when back online.", "success");
      form.reset();
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

// ── Client-side form validation ───────────
function validateForm(form) {
  let valid = true;

  // Full name
  const name = form.full_name.value.trim();
  if (!name || name.length < 2) {
    showFieldError("full_name", "err-name", "Please enter your full name (at least 2 characters).");
    valid = false;
  }

  // Email
  const email = form.email.value.trim();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRe.test(email)) {
    showFieldError("email", "err-email", "Please enter a valid email address.");
    valid = false;
  }

  // Phone (optional, but must be valid if provided)
  const phone = form.phone.value.trim();
  if (phone) {
    const digits = phone.replace(/[\s\-\+\(\)]/g, "");
    if (!/^\d{7,15}$/.test(digits)) {
      showFieldError("phone", "err-phone", "Enter a valid phone number (7–15 digits).");
      valid = false;
    }
  }

  return valid;
}

function showFieldError(fieldId, errId, msg) {
  const field  = document.getElementById(fieldId);
  const errEl  = document.getElementById(errId);
  if (field)  field.classList.add("error");
  if (errEl)  errEl.textContent = msg;
  if (field)  field.addEventListener("input", () => {
    field.classList.remove("error");
    if (errEl) errEl.textContent = "";
  }, { once: true });
}

function clearAllErrors() {
  document.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
}

// ── Loading state for submit button ───────
function setButtonLoading(btn, isLoading) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.classList.toggle("loading", isLoading);
}

// ══════════════════════════════════════════
// TOAST NOTIFICATION
// ══════════════════════════════════════════
let toastTimer = null;

function showToast(message, type = "success") {
  const toast   = document.getElementById("toast");
  const msgEl   = document.getElementById("toastMessage");
  if (!toast || !msgEl) return;

  clearTimeout(toastTimer);
  toast.className = `toast toast-${type} show`;
  msgEl.textContent = message;

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

// ══════════════════════════════════════════
// CHAR COUNTER for message textarea
// ══════════════════════════════════════════
function initCharCounter() {
  const textarea  = document.getElementById("message");
  const counter   = document.getElementById("charCount");
  if (!textarea || !counter) return;

  textarea.addEventListener("input", () => {
    const len = textarea.value.length;
    counter.textContent = `${len} / 1000`;
    counter.style.color = len > 900 ? "var(--rose-500)" : "";
    if (len > 1000) {
      textarea.value = textarea.value.substring(0, 1000);
    }
  });
}

// ══════════════════════════════════════════
// BACK TO TOP BUTTON
// ══════════════════════════════════════════
function initBackToTop() {
  const btn = document.getElementById("backTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ══════════════════════════════════════════
// LOCALSTORAGE FALLBACK
// Saves submissions locally if backend is down
// ══════════════════════════════════════════
function saveToLocalStorage(data) {
  try {
    const existing = JSON.parse(localStorage.getItem("sc_submissions") || "[]");
    existing.push({ ...data, saved_at: new Date().toISOString(), synced: false });
    localStorage.setItem("sc_submissions", JSON.stringify(existing));
    console.log("💾 Saved to localStorage. Total pending:", existing.length);
  } catch (err) {
    console.error("localStorage save failed:", err);
  }
}

// ══════════════════════════════════════════
// FOOTER YEAR
// ══════════════════════════════════════════
function setFooterYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}
