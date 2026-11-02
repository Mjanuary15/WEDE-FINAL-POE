// Shared JavaScript for navigation, gallery lightbox, search and form validation.
document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation toggle.
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("main-nav");
  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
      menuButton.textContent = isOpen ? "×" : "☰";
    });
  }

  // Service search filters the service cards without reloading the page.
  const searchInput = document.getElementById("service-search");
  if (searchInput) {
    const cards = [...document.querySelectorAll(".service-result")];
    const noResults = document.getElementById("no-services");
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const matches = (card.dataset.search + " " + card.textContent).toLowerCase().includes(term);
        card.hidden = !matches;
        if (matches) visible++;
      });
      if (noResults) noResults.hidden = visible !== 0;
    });
  }

  // Accessible gallery lightbox.
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const lightboxImage = document.getElementById("lightbox-image");
    const caption = document.getElementById("lightbox-caption");
    const closeButton = lightbox.querySelector(".lightbox-close");
    let lastTrigger = null;
    const close = () => {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      if (lastTrigger) lastTrigger.focus();
    };
    document.querySelectorAll(".lightbox-trigger").forEach(trigger => {
      trigger.addEventListener("click", () => {
        lastTrigger = trigger;
        lightboxImage.src = trigger.dataset.image;
        lightboxImage.alt = trigger.querySelector("img")?.alt || "";
        caption.textContent = trigger.dataset.caption || "";
        lightbox.hidden = false;
        document.body.style.overflow = "hidden";
        closeButton.focus();
      });
    });
    closeButton.addEventListener("click", close);
    lightbox.addEventListener("click", event => { if (event.target === lightbox) close(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !lightbox.hidden) close(); });
  }

  // Read a service query string to preselect the enquiry form.
  const serviceSelect = document.getElementById("service");
  if (serviceSelect) {
    const selectedService = new URLSearchParams(window.location.search).get("service");
    if (selectedService) {
      const option = [...serviceSelect.options].find(item => item.text.toLowerCase() === selectedService.toLowerCase());
      if (option) serviceSelect.value = option.value;
    }
  }

  // Character counter for the enquiry message.
  const message = document.getElementById("message");
  const counter = document.getElementById("char-count");
  if (message && counter) {
    const updateCount = () => counter.textContent = String(message.value.length);
    message.addEventListener("input", updateCount);
    updateCount();
  }

  // Client-side form validation. This demo does not transmit or store personal data.
  const form = document.getElementById("enquiry-form");
  if (form) {
    const status = document.getElementById("enquiry-status");
    const summary = document.getElementById("submission-summary");
    const fields = {
      name: document.getElementById("name"),
      phone: document.getElementById("phone"),
      email: document.getElementById("email"),
      service: document.getElementById("service"),
      message: document.getElementById("message"),
      consent: document.getElementById("consent")
    };
    const errorNodes = {
      name: document.getElementById("name-error"),
      phone: document.getElementById("phone-error"),
      email: document.getElementById("email-error"),
      service: document.getElementById("service-error"),
      message: document.getElementById("message-error"),
      consent: document.getElementById("consent-error")
    };
    const clearErrors = () => Object.values(errorNodes).forEach(node => node.textContent = "");
    form.addEventListener("submit", event => {
      event.preventDefault();
      clearErrors();
      status.textContent = "";
      status.className = "form-status";
      summary.hidden = true;
      let valid = true;
      const setError = (key, text) => { errorNodes[key].textContent = text; valid = false; };
      if (fields.name.value.trim().length < 2) setError("name", "Please enter your name (at least 2 characters).");
      if (fields.phone.value.trim() && !/^[0-9+()\s-]{7,20}$/.test(fields.phone.value.trim())) setError("phone", "Please enter a valid phone number or leave this field blank.");
      if (!fields.email.validity.valid || !fields.email.value.trim()) setError("email", "Please enter a valid email address.");
      if (!fields.service.value) setError("service", "Please choose a category.");
      if (fields.message.value.trim().length < 10) setError("message", "Please enter a message of at least 10 characters.");
      if (!fields.consent.checked) setError("consent", "Please confirm you understand this is a demo form.");
      if (!valid) {
        status.textContent = "Please correct the highlighted fields and try again.";
        status.classList.add("failure");
        const firstInvalid = Object.keys(errorNodes).find(key => errorNodes[key].textContent);
        if (firstInvalid) fields[firstInvalid].focus();
        return;
      }
      status.textContent = "Your form passed validation. No information has been sent or saved.";
      status.classList.add("success");
      summary.innerHTML = "";
      const heading = document.createElement("h3");
      heading.textContent = "Enquiry preview";
      summary.appendChild(heading);
      [["Name", fields.name.value.trim()], ["Email", fields.email.value.trim()], ["Service", fields.service.value], ["Message", fields.message.value.trim()]].forEach(([label, value]) => {
        const paragraph = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = label + ": ";
        paragraph.append(strong, document.createTextNode(value));
        summary.appendChild(paragraph);
      });
      summary.hidden = false;
    });
  }
});