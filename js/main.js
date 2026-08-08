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

  // ---------- Galería del portafolio ----------
  var PORTAFOLIO = "assets/portafolio";
  var gallery = {};
  var projectCards = Array.prototype.slice.call(document.querySelectorAll(".card-project[data-folder]"));
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightboxImg");
  var lbCaption = document.getElementById("lightboxCaption");
  var lbList = [];
  var lbIndex = 0;

  function portafolioPath(slug, file) {
    return PORTAFOLIO + "/" + slug + "/" + file;
  }

  function loadManifest() {
    return fetch(PORTAFOLIO + "/manifest.json?v=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
  }

  function refreshPortfolio(imgs) {
    gallery = imgs || gallery;
    projectCards.forEach(function (card) {
      var slug = card.getAttribute("data-folder");
      var list = (gallery[slug] || []).filter(Boolean);
      var img = card.querySelector(".card-img");
      var count = card.querySelector(".card-img-count");
      if (!img) return;
      if (list.length) {
        img.src = portafolioPath(slug, list[0]);
        img.alt = "Captura del proyecto";
        count.hidden = false;
        count.textContent = list.length + (list.length === 1 ? " imagen" : " imágenes");
      } else {
        img.src = img.getAttribute("data-fallback");
        count.hidden = true;
      }
    });
  }

  function showLightboxImage() {
    var item = lbList[lbIndex];
    lbImg.src = item.src;
    lbCaption.textContent = item.title + (lbList.length > 1 ? " · " + (lbIndex + 1) + "/" + lbList.length : "");
    document.getElementById("lightboxPrev").style.visibility = lbList.length > 1 ? "visible" : "hidden";
    document.getElementById("lightboxNext").style.visibility = lbList.length > 1 ? "visible" : "hidden";
  }

  function openLightbox(card) {
    var slug = card.getAttribute("data-folder");
    var wrap = card.querySelector(".card-img-wrap");
    var img = card.querySelector(".card-img");
    var title = (wrap && wrap.getAttribute("data-title")) || "";
    var list = (gallery[slug] || []).filter(Boolean);
    if (list.length) {
      lbList = list.map(function (f) { return { src: portafolioPath(slug, f), title: title }; });
    } else {
      lbList = [{ src: img.getAttribute("data-fallback"), title: title }];
    }
    lbIndex = 0;
    showLightboxImage();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImg.src = "";
  }

  if (lightbox) {
    projectCards.forEach(function (card) {
      var wrap = card.querySelector(".card-img-wrap");
      if (wrap) wrap.addEventListener("click", function () { openLightbox(card); });
    });
    document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
    document.getElementById("lightboxPrev").addEventListener("click", function () {
      lbIndex = (lbIndex - 1 + lbList.length) % lbList.length;
      showLightboxImage();
    });
    document.getElementById("lightboxNext").addEventListener("click", function () {
      lbIndex = (lbIndex + 1) % lbList.length;
      showLightboxImage();
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") document.getElementById("lightboxPrev").click();
      if (e.key === "ArrowRight") document.getElementById("lightboxNext").click();
    });
  }

  loadManifest().then(refreshPortfolio);

  // ---------- Volver arriba ----------
  var toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  // ---------- Panel admin (solo el dueño) ----------
  var adminModal = document.getElementById("adminModal");
  if (adminModal) {
    var adminConfig = document.getElementById("adminConfig");
    var adminUpload = document.getElementById("adminUpload");
    var pwInput = document.getElementById("adminPassword");
    var tokenInput = document.getElementById("adminToken");
    var saveBtn = document.getElementById("adminSave");
    var adminStatus = document.getElementById("adminStatus");
    var uploadStatus = document.getElementById("adminUploadStatus");
    var adminProjectsEl = document.getElementById("adminProjects");
    var adminHash = localStorage.getItem("timbo_hash") || "";
    var adminToken = localStorage.getItem("timbo_token") || "";
    var adminAuthed = false;
    if (tokenInput) tokenInput.value = adminToken;

    function adminSetStatus(el, msg, ok) {
      el.textContent = msg;
      el.className = "admin-status " + (ok ? "ok" : "bad");
    }

    function sha256(text) {
      if (!window.crypto || !crypto.subtle) {
        var h = 0;
        for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
        return Promise.resolve("plain-" + (h >>> 0).toString(16));
      }
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ("0" + b.toString(16)).slice(-2);
        }).join("");
      });
    }

    function adminApi() {
      return {
        "Authorization": "token " + adminToken,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json"
      };
    }

    function adminOpen() {
      adminModal.classList.add("open");
      adminModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (adminAuthed) {
        adminConfig.hidden = true;
        adminUpload.hidden = false;
        buildProjects();
      } else {
        adminConfig.hidden = false;
        adminUpload.hidden = true;
        adminStatus.textContent = "";
        pwInput.focus();
      }
    }

    function adminClose() {
      adminModal.classList.remove("open");
      adminModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    document.getElementById("adminOpen").addEventListener("click", function (e) {
      e.preventDefault();
      adminOpen();
    });
    document.getElementById("adminClose").addEventListener("click", adminClose);
    adminModal.addEventListener("click", function (e) {
      if (e.target === adminModal) adminClose();
    });

    saveBtn.addEventListener("click", function () {
      var pw = pwInput.value;
      var tk = tokenInput.value.trim();
      if (!pw) return adminSetStatus(adminStatus, "Escribí tu contraseña.", false);
      if (!tk) return adminSetStatus(adminStatus, "Pegá tu token de GitHub.", false);
      sha256(pw).then(function (hash) {
        if (adminHash && hash !== adminHash) return adminSetStatus(adminStatus, "Contraseña incorrecta.", false);
        adminHash = hash;
        adminToken = tk;
        localStorage.setItem("timbo_hash", hash);
        localStorage.setItem("timbo_token", tk);
        adminAuthed = true;
        pwInput.value = "";
        adminConfig.hidden = true;
        adminUpload.hidden = false;
        adminSetStatus(adminStatus, "", true);
        buildProjects();
      });
    });

    function getManifest() {
      return fetch("https://api.github.com/repos/NahuRGF/timbo-digital/contents/assets/portafolio/manifest.json", { headers: adminApi() })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.content) return { obj: JSON.parse(atob(data.content.replace(/\n/g, ""))), sha: data.sha };
          return { obj: {}, sha: null };
        });
    }

    function putManifest(obj, sha) {
      return fetch("https://api.github.com/repos/NahuRGF/timbo-digital/contents/assets/portafolio/manifest.json", {
        method: "PUT",
        headers: adminApi(),
        body: JSON.stringify({
          message: "Actualizar imágenes del portafolio",
          content: btoa(JSON.stringify(obj, null, 2)),
          sha: sha || undefined
        })
      });
    }

    function folderApi(slug, filename) {
      return "https://api.github.com/repos/NahuRGF/timbo-digital/contents/assets/portafolio/" + slug + (filename ? "/" + filename : "");
    }

    function readFileBase64(file) {
      return new Promise(function (resolve, reject) {
        var fr = new FileReader();
        fr.onload = function () { resolve(fr.result.split(",")[1]); };
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
    }

    function loadFolderImgs(slug, container) {
      container.innerHTML = "";
      fetch(folderApi(slug), { headers: adminApi() })
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (list) {
          if (!Array.isArray(list)) return;
          list.forEach(function (item) {
            var fig = document.createElement("figure");
            var im = document.createElement("img");
            im.src = item.download_url;
            var del = document.createElement("button");
            del.textContent = "×";
            del.title = "Eliminar " + item.name;
            fig.appendChild(im);
            fig.appendChild(del);
            container.appendChild(fig);
            del.addEventListener("click", function () {
              if (!window.confirm("¿Eliminar " + item.name + "?")) return;
              del.disabled = true;
              fetch(folderApi(slug, item.name), {
                method: "DELETE",
                headers: adminApi(),
                body: JSON.stringify({ message: "Quitar imagen " + slug + "/" + item.name, sha: item.sha })
              })
                .then(function (r) { if (!r.ok) throw new Error("del"); return updateManifestFromRepo(); })
                .then(function () { loadFolderImgs(slug, container); refreshPortfolioFromRepo(); })
                .catch(function () { del.disabled = false; window.alert("No se pudo eliminar la imagen."); });
            });
          });
        })
        .catch(function () {});
    }

    function updateManifestFromRepo() {
      var folders = projectCards.map(function (c) { return c.getAttribute("data-folder"); });
      return Promise.all(folders.map(function (slug) {
        return fetch(folderApi(slug), { headers: adminApi() })
          .then(function (r) { return r.ok ? r.json() : []; })
          .then(function (list) {
            return { slug: slug, files: Array.isArray(list) ? list.map(function (i) { return i.name; }).sort() : [] };
          });
      }))
        .then(function (results) {
          var obj = {};
          results.forEach(function (r) { obj[r.slug] = r.files; });
          return getManifest().then(function (m) { return putManifest(obj, m.sha); });
        });
    }

    function refreshPortfolioFromRepo() {
      loadManifest().then(refreshPortfolio);
    }

    function buildProjects() {
      adminProjectsEl.innerHTML = "";
      projectCards.forEach(function (card) {
        var slug = card.getAttribute("data-folder");
        var title = (card.querySelector(".card-title") || {}).textContent || slug;
        var box = document.createElement("div");
        box.className = "admin-project";

        var h = document.createElement("h3");
        h.textContent = title;
        var f = document.createElement("p");
        f.className = "folder";
        f.textContent = "assets/portafolio/" + slug + "/";

        var row = document.createElement("div");
        row.className = "admin-row";
        var file = document.createElement("input");
        file.type = "file";
        file.multiple = true;
        file.accept = "image/*";
        var up = document.createElement("button");
        up.className = "btn btn-primary btn-sm";
        up.textContent = "Subir";
        var msg = document.createElement("p");
        msg.className = "admin-status";
        row.appendChild(file);
        row.appendChild(up);
        row.appendChild(msg);

        var imgs = document.createElement("div");
        imgs.className = "admin-imgs";

        box.appendChild(h);
        box.appendChild(f);
        box.appendChild(row);
        box.appendChild(imgs);
        adminProjectsEl.appendChild(box);

        loadFolderImgs(slug, imgs);

        up.addEventListener("click", function () {
          var files = Array.prototype.slice.call(file.files || []);
          if (!files.length) return adminSetStatus(msg, "Elegí al menos una imagen.", false);
          up.disabled = true;
          adminSetStatus(msg, "Subiendo " + files.length + " imagen(es)...", true);
          var jobs = files.map(function (fl) {
            var safe = fl.name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
            var filename = Date.now() + "-" + safe;
            return readFileBase64(fl).then(function (b64) {
              return fetch(folderApi(slug, filename), {
                method: "PUT",
                headers: adminApi(),
                body: JSON.stringify({ message: "Agregar imagen " + slug + "/" + filename, content: b64 })
              });
            });
          });
          Promise.all(jobs)
            .then(function (responses) {
              if (responses.some(function (r) { return !r.ok; })) throw new Error("Algunas imágenes no se subieron.");
              return updateManifestFromRepo();
            })
            .then(function () {
              adminSetStatus(msg, "¡Imágenes subidas!", true);
              up.disabled = false;
              file.value = "";
              loadFolderImgs(slug, imgs);
              refreshPortfolioFromRepo();
            })
            .catch(function (err) {
              adminSetStatus(msg, (err && err.message) || "Error al subir.", false);
              up.disabled = false;
            });
        });
      });
    }
  }
})();
