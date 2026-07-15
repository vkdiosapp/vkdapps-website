(() => {
  "use strict";
  const form = document.getElementById("contactForm");
  if (!form) return;

  const successMsg = document.getElementById("formSuccess");
  const errorMsg = document.getElementById("formError");
  const errorText = document.getElementById("formErrorText");
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn ? submitBtn.textContent : "Send Message";

  const focusPanel = (el) => {
    el.hidden = false;
    el.setAttribute("tabindex", "-1");
    el.focus();
  };

  const showError = (text) => {
    if (!errorMsg) return;
    if (errorText) errorText.textContent = text;
    focusPanel(errorMsg);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (errorMsg) errorMsg.hidden = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        form.hidden = true;
        if (errorMsg) errorMsg.hidden = true;
        if (successMsg) focusPanel(successMsg);
        return;
      }

      if (data.code === "not_configured") {
        showError(
          "Our contact form isn't connected yet — we're sorry. Please email business@vkdapps.com directly and we'll reply within 1–2 business days."
        );
      } else {
        showError(
          (data.error || "Something went wrong.") +
            " Please try again, or email business@vkdapps.com directly."
        );
      }
    } catch {
      showError(
        "We couldn't reach our server. Please check your connection and try again, or email business@vkdapps.com directly."
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
      }
    }
  });
})();
