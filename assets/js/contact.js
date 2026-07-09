(() => {
  "use strict";
  const form = document.getElementById("contactForm");
  const successMsg = document.getElementById("formSuccess");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.style.display = "none";
    successMsg.hidden = false;
    successMsg.setAttribute("tabindex", "-1");
    successMsg.focus();
  });
})();
