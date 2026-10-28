/* ============================================================
   VKD Apps — Contact Form Handler with WebMCP Integration
   ============================================================ */
(() => {
  "use strict";

  const form = document.getElementById("contactForm");
  if (!form) return;

  const successMsg = document.getElementById("formSuccess");
  const errorMsg = document.getElementById("formError");
  const errorText = document.getElementById("formErrorText");
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalLabel = submitBtn ? submitBtn.textContent : "Send Inquiry";

  const showError = (message) => {
    if (!errorMsg || !errorText) return;
    errorText.textContent = message;
    errorMsg.hidden = false;
    errorMsg.focus();
  };

  const clearError = () => {
    if (errorMsg) errorMsg.hidden = true;
  };

  async function handleSubmission(formData) {
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        return { success: true };
      }

      if (data.code === "not_configured") {
        return {
          success: false,
          error: "Online submission is currently undergoing maintenance. Please email vkdiosapp@gmail.com directly."
        };
      }

      return {
        success: false,
        error: data.error || "Unable to send your inquiry right now. Please try again or email vkdiosapp@gmail.com."
      };
    } catch {
      return {
        success: false,
        error: "Network connection error. Please email vkdiosapp@gmail.com directly."
      };
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      if (e.agentInvoked && typeof e.respondWith === "function") {
        e.respondWith(Promise.resolve("Form validation failed. Please provide all required fields."));
      }
      return;
    }

    clearError();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    const formData = new FormData(form);
    const submissionPromise = handleSubmission(formData);

    if (e.agentInvoked && typeof e.respondWith === "function") {
      e.respondWith(
        submissionPromise.then((result) => {
          if (result.success) {
            return "Project consultation inquiry received successfully. VKD Apps will follow up shortly.";
          }
          return `Inquiry failed: ${result.error}`;
        })
      );
    }

    try {
      const result = await submissionPromise;
      if (result.success) {
        form.hidden = true;
        if (successMsg) {
          successMsg.hidden = false;
          successMsg.focus();
        }
      } else {
        showError(result.error);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    }
  });
})();
