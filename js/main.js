(function () {
  "use strict";

  var navbar = document.getElementById("navbar");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  var contactForm = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");
  var year = document.getElementById("year");

  var EMAIL = "rgaston.florentin@gmail.com";

  if (year) year.textContent = String(new Date().getFullYear());

  function onScroll() {
    if (window.scrollY > 10) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  function toggleMenu(open) {
    var willOpen = open !== undefined ? open : !navLinks.classList.contains("open");
    navLinks.classList.toggle("open", willOpen);
    navToggle.classList.toggle("open", willOpen);
    navToggle.setAttribute("aria-expanded", String(willOpen));
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      toggleMenu();
    });
  }

  if (navLinks) {
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggleMenu(false);
      });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Animaciones al scrollear ----------
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll("[data-reveal]");

  function revealSetup() {
    revealEls.forEach(function (el) {
      el.classList.add("reveal");

      var group = el.closest(".cards, .contact-grid, .hero-grid");
      if (group) {
        var idx = Array.prototype.indexOf.call(group.children, el);
        if (idx > 0) el.style.transitionDelay = idx * 110 + "ms";
      }

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      observer.observe(el);
    });
  }

  if (!reduceMotion && revealEls.length && "IntersectionObserver" in window) {
    revealSetup();
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  function setStatus(msg, ok) {
    formStatus.textContent = msg;
    formStatus.className = "form-status " + (ok ? "ok" : "bad");
  }

  function setError(input, hasError) {
    input.classList.toggle("error", hasError);
  }

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var nombre = contactForm.querySelector("#nombre");
      var email = contactForm.querySelector("#email");
      var mensaje = contactForm.querySelector("#mensaje");

      var valid = true;
      [nombre, email, mensaje].forEach(function (input) {
        var bad = !input.value.trim();
        if (input === email && !bad) {
          bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        }
        setError(input, bad);
        if (bad) valid = false;
      });

      if (!valid) {
        setStatus("Completá todos los campos correctamente.", false);
        return;
      }

      var asunto = encodeURIComponent("Contacto desde la web - " + nombre.value.trim());
      var cuerpo = encodeURIComponent(
        "Nombre: " + nombre.value.trim() + "\n" +
        "Email: " + email.value.trim() + "\n\n" +
        mensaje.value.trim()
      );
      window.location.href = "mailto:" + EMAIL + "?subject=" + asunto + "&body=" + cuerpo;

      setStatus("Se abrió tu cliente de correo para enviar el mensaje. ¡Gracias!", true);
      contactForm.reset();
    });

    contactForm.querySelectorAll("input, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        setError(input, false);
      });
    });
  }
})();
