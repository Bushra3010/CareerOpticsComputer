/*
 * The photo gallery, from the ERP's Main Website -> Gallery.
 *
 * The pages are static, so the photos are fetched here, in the browser, from
 * the `gallery_items` table with the public anon key (window.CMS_CONFIG, from
 * /cms-config.js). RLS hands the anon key published photos only.
 *
 *   <div data-gallery="full">   gallery.html: category chips, every photo
 *   <div data-gallery="home"    the home page: the first few photos, and the
 *        data-limit="8" hidden> whole section stays hidden if there are none
 *
 * Everything this script adds carries data-cms-ui, so the Website Content
 * editor neither counts it when keying edits nor offers it for editing.
 */
(function () {
  "use strict";

  var SELECT = "select=id,title,category,imageUrl&isPublished=eq.true&order=sortOrder.asc,createdAt.desc";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    n.setAttribute("data-cms-ui", "");
    return n;
  }

  // Saved by the organisation's own admins, but the URL still lands in an
  // src attribute: only plain web addresses are let through.
  function safe(url) {
    return /^https?:\/\//i.test(url || "");
  }

  function fetchPhotos(limit) {
    var cfg = window.CMS_CONFIG || {};
    if (!cfg.url || !cfg.key) return Promise.reject(new Error("not configured"));
    var url = cfg.url + "/rest/v1/gallery_items?" + SELECT + (limit ? "&limit=" + limit : "");
    return fetch(url, { headers: { apikey: cfg.key, Authorization: "Bearer " + cfg.key } })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (rows) {
        return (rows || []).filter(function (p) { return safe(p.imageUrl); });
      });
  }

  /* ---------- lightbox ---------- */

  var lb, lbImg, lbCap, lbCount, list = [], at = 0, lastFocus = null;

  function buildLightbox() {
    lb = el("div", "cg-lb");
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Photo viewer");
    var close = el("button", "cg-lb-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    var prev = el("button", "cg-lb-nav cg-lb-prev", "‹");
    prev.type = "button";
    prev.setAttribute("aria-label", "Previous photo");
    var next = el("button", "cg-lb-nav cg-lb-next", "›");
    next.type = "button";
    next.setAttribute("aria-label", "Next photo");
    var fig = el("figure", "cg-lb-fig");
    lbImg = el("img");
    lbImg.alt = "";
    lbCap = el("figcaption");
    lbCount = el("span", "cg-lb-count");
    fig.appendChild(lbImg);
    fig.appendChild(lbCap);
    lb.appendChild(close);
    lb.appendChild(prev);
    lb.appendChild(fig);
    lb.appendChild(next);
    lb.appendChild(lbCount);
    document.body.appendChild(lb);

    close.addEventListener("click", hide);
    prev.addEventListener("click", function () { show(at - 1); });
    next.addEventListener("click", function () { show(at + 1); });
    // A click on the dark backdrop closes; one on the photo itself does not.
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target === fig) hide();
    });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") hide();
      else if (e.key === "ArrowLeft") show(at - 1);
      else if (e.key === "ArrowRight") show(at + 1);
    });
  }

  function show(i) {
    if (!list.length) return;
    at = (i + list.length) % list.length;
    var p = list[at];
    lbImg.src = p.imageUrl;
    lbImg.alt = p.title || p.category || "Gallery photo";
    lbCap.textContent = [p.title, p.category].filter(Boolean).join(" • ");
    lbCount.textContent = list.length > 1 ? at + 1 + " / " + list.length : "";
    lb.classList.toggle("cg-single", list.length < 2);
  }

  function open(photos, i) {
    if (!lb) buildLightbox();
    list = photos;
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add("on");
    document.documentElement.style.overflow = "hidden";
    lb.querySelector(".cg-lb-close").focus();
  }

  function hide() {
    lb.classList.remove("on");
    lbImg.removeAttribute("src");
    document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- grid ---------- */

  function tile(photos, i) {
    var p = photos[i];
    var b = el("button", "cg-item");
    b.type = "button";
    b.setAttribute("aria-label", "View " + (p.title || p.category || "photo"));
    var img = el("img");
    img.src = p.imageUrl;
    img.alt = p.title || p.category || "Gallery photo";
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("load", function () { b.classList.add("cg-loaded"); });
    img.addEventListener("error", function () { b.remove(); });
    b.appendChild(img);
    if (p.title || p.category) {
      var cap = el("span", "cg-cap");
      if (p.title) cap.appendChild(el("b", "", p.title));
      if (p.category) cap.appendChild(el("small", "", p.category));
      b.appendChild(cap);
    }
    b.addEventListener("click", function () { open(photos, i); });
    return b;
  }

  function fill(grid, photos) {
    grid.textContent = "";
    for (var i = 0; i < photos.length; i++) grid.appendChild(tile(photos, i));
  }

  function status(root, kind, title, text) {
    root.textContent = "";
    var box = el("div", "cg-status cg-" + kind);
    box.appendChild(el("b", "", title));
    if (text) box.appendChild(el("p", "", text));
    root.appendChild(box);
  }

  function full(root) {
    status(root, "loading", "Loading photos…");
    fetchPhotos(0).then(
      function (photos) {
        if (!photos.length) {
          return status(root, "empty", "Photos coming soon", "We are putting together pictures of our classrooms, lab and events. Please check back shortly.");
        }
        root.textContent = "";
        var cats = [];
        photos.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
        var grid = el("div", "cg-grid");
        if (cats.length > 1) {
          var chips = el("div", "cg-chips");
          chips.setAttribute("role", "toolbar");
          chips.setAttribute("aria-label", "Filter photos by category");
          ["All"].concat(cats).forEach(function (c, k) {
            var chip = el("button", "cg-chip", c);
            chip.type = "button";
            chip.setAttribute("aria-pressed", k === 0 ? "true" : "false");
            chip.addEventListener("click", function () {
              chips.querySelectorAll(".cg-chip").forEach(function (o) { o.setAttribute("aria-pressed", o === chip ? "true" : "false"); });
              fill(grid, k === 0 ? photos : photos.filter(function (p) { return p.category === c; }));
            });
            chips.appendChild(chip);
          });
          root.appendChild(chips);
        }
        root.appendChild(grid);
        fill(grid, photos);
      },
      function () {
        status(root, "error", "The gallery could not be loaded", "Please check your connection and refresh the page.");
      }
    );
  }

  function home(root) {
    var limit = Number(root.getAttribute("data-limit")) || 8;
    var grid = root.querySelector("[data-gallery-grid]");
    fetchPhotos(limit).then(
      function (photos) {
        if (!photos.length || !grid) return;
        fill(grid, photos);
        root.hidden = false;
      },
      function () { /* the section simply stays hidden */ }
    );
  }

  function init() {
    document.querySelectorAll("[data-gallery]").forEach(function (root) {
      if (root.getAttribute("data-gallery") === "home") home(root);
      else full(root);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
