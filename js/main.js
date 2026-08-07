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
      var submitBtn = contactForm.querySelector("button[type='submit']");

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

      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Envío rechazado por Formspree");
          setStatus("¡Mensaje enviado! Te respondemos a la brevedad.", true);
          contactForm.reset();
        })
        .catch(function () {
          var asunto = encodeURIComponent("Contacto desde la web - " + nombre.value.trim());
          var cuerpo = encodeURIComponent(
            "Nombre: " + nombre.value.trim() + "\n" +
            "Email: " + email.value.trim() + "\n\n" +
            mensaje.value.trim()
          );
          window.location.href = "mailto:" + EMAIL + "?subject=" + asunto + "&body=" + cuerpo;
          setStatus("El envío online falló. Se abrió tu correo para mandarlo directo.", true);
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Enviar mensaje";
        });
    });

    contactForm.querySelectorAll("input, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        setError(input, false);
      });
    });
  }

  // ---------- Barra de progreso de scroll ----------
  var progress = document.getElementById("scrollProgress");
  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }
  if (progress) {
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // ---------- Texto con desenfoque (blur-text) ----------
  function splitBlurWords(el) {
    var index = 0;
    var frag = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        var words = node.textContent.trim().split(/\s+/);
        words.forEach(function (w) {
          if (!w) return;
          var s = document.createElement("span");
          s.className = "wt";
          s.textContent = w;
          if (index > 0) s.style.marginLeft = "0.26em";
          s.style.transitionDelay = index * 70 + "ms";
          index++;
          frag.appendChild(s);
        });
      } else if (node.nodeType === 1) {
        var wrap = document.createElement("span");
        wrap.className = "wt inline";
        wrap.appendChild(node.cloneNode(true));
        if (index > 0) wrap.style.marginLeft = "0.26em";
        wrap.style.transitionDelay = index * 70 + "ms";
        index++;
        frag.appendChild(wrap);
      }
    });
    el.textContent = "";
    el.appendChild(frag);
  }

  var blurEls = document.querySelectorAll(".blur-text");
  blurEls.forEach(function (el) {
    splitBlurWords(el);
    if (reduceMotion) {
      el.classList.add("inview");
      return;
    }
    var show = function () { el.classList.add("inview"); };
    if (el.closest(".hero")) {
      setTimeout(show, 250);
    } else {
      var bio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              show();
              bio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      bio.observe(el);
    }
  });

  // ---------- Spotlight que sigue al mouse en las tarjetas ----------
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  // ---------- Tilt sutil en las tarjetas de portafolio ----------
  if (!reduceMotion) {
    document.querySelectorAll(".card-project").forEach(function (c) {
      c.addEventListener("mousemove", function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        c.style.setProperty("--ry", (px * 8).toFixed(2) + "deg");
        c.style.setProperty("--rx", (-py * 8).toFixed(2) + "deg");
      });
      c.addEventListener("mouseleave", function () {
        c.style.setProperty("--rx", "0deg");
        c.style.setProperty("--ry", "0deg");
      });
    });
  }

  // ---------- Contadores animados ----------
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll("[data-count]").forEach(function (el) {
    if (!("IntersectionObserver" in window)) {
      el.textContent = el.getAttribute("data-count") || "0";
      return;
    }
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(el);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    cio.observe(el);
  });

  // ---------- Link activo del nav según la sección visible ----------
  var spySections = document.querySelectorAll("main section[id]");
  var spyLinks = document.querySelectorAll(".nav-link");
  if (spySections.length && spyLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          spyLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    spySections.forEach(function (s) { spy.observe(s); });
  }
})();
