/*
 * The website's courses, read from the ERP (supabase/schema/website-courses.sql).
 *
 *  - computer-course.html: #courseGrid[data-db-courses] is refilled with
 *    every course the head office lists on the website, with a filter by
 *    category. The cards written into the page stay as they are when the
 *    database cannot be reached or has no course to show.
 *  - course.html?c=<code>: #courseDetail is filled with one course and its
 *    syllabus; its enquiry form goes to the ERP through apply.js like every
 *    other form on the site.
 *
 * Everything from the database goes in with textContent or as a checked
 * URL, never as HTML: course names and descriptions are typed in the ERP
 * and shown to the public.
 */
(function () {
  "use strict";

  function config() { return window.CMS_CONFIG || {}; }

  function rpc(fn, body) {
    var cfg = config();
    if (!cfg.url || !cfg.key) return Promise.reject(new Error("offline"));
    return fetch(cfg.url + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { apikey: cfg.key, Authorization: "Bearer " + cfg.key, "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }

  /* ---------- small helpers ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null && text !== "") n.textContent = text;
    return n;
  }

  /** An uploaded photo (https) or one of the site's own images; nothing else reaches an src. */
  function safeImage(url) {
    var u = String(url || "").trim();
    if (/^https:\/\//i.test(u)) return u;
    if (/^\/[A-Za-z0-9_./-]+$/.test(u)) return u;
    return "";
  }

  function money(n) {
    var v = Number(n);
    if (!isFinite(v) || v <= 0) return "";
    try { return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 }); } catch (e) { return "₹" + Math.round(v); }
  }

  function duration(value, unit) {
    var v = Number(value);
    if (!v) return "";
    var u = String(unit || "MONTHS").toLowerCase().replace(/s$/, "");
    return v + " " + u.charAt(0).toUpperCase() + u.slice(1) + (v === 1 ? "" : "s");
  }

  /** COMPUTER -> "Computer", SKILL_DEVELOPMENT -> "Skill development" (as the ERP shows it). */
  function categoryLabel(value) {
    var v = String(value || "");
    if (!v) return "";
    if (!/^[A-Z0-9_]+$/.test(v)) return v;
    var words = v.toLowerCase().split("_");
    return words[0].charAt(0).toUpperCase() + words[0].slice(1) + (words.length > 1 ? " " + words.slice(1).join(" ") : "");
  }

  /** Where a card leads: the course's own page when it has one, else the generic one. */
  function detailHref(c) {
    if (c.page && /^[a-z0-9_-]+\.html$/.test(c.page)) return c.page;
    return "course.html?c=" + encodeURIComponent(c.code || c.id);
  }

  /** A course with no photo gets a tile with its code, in the site's colours. */
  function placeholder(c, cls) {
    var box = el("div", cls + " flex items-center justify-center bg-gradient-to-br from-[#0b2350] to-[#1e3a8a]");
    box.appendChild(el("span", "text-white font-black text-3xl tracking-wide", String(c.code || c.name || "").slice(0, 10)));
    return box;
  }

  /* ---------- the course list ---------- */

  function card(c) {
    var wrap = el("div", "course-card course-item bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-soft flex flex-col");
    wrap.setAttribute("data-category", c.category || "");

    var imgBox = el("div", "relative h-48 overflow-hidden");
    var src = safeImage(c.image);
    if (src) {
      var img = el("img", "course-img w-full h-full object-cover");
      img.src = src;
      img.alt = c.name || "Course";
      img.loading = "lazy";
      // A photo that will not load shows the code tile, not a broken image.
      img.onerror = function () { imgBox.replaceChild(placeholder(c, "w-full h-full"), img); };
      imgBox.appendChild(img);
    } else {
      imgBox.appendChild(placeholder(c, "w-full h-full"));
    }
    if (c.category) {
      imgBox.appendChild(el("span", "absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 text-[10px] font-bold text-slate-700", categoryLabel(c.category)));
    }
    wrap.appendChild(imgBox);

    var body = el("div", "p-5 flex flex-col flex-1");
    body.appendChild(el("h3", "font-black text-lg", c.name));
    if (c.description) body.appendChild(el("p", "text-xs text-slate-500 mt-2 leading-5", c.description));

    var tags = el("div", "flex flex-wrap gap-2 mt-4");
    var d = duration(c.durationValue, c.durationUnit);
    if (d) tags.appendChild(el("span", "px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold", d));
    if (c.code) tags.appendChild(el("span", "px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-bold", c.code));
    body.appendChild(tags);

    var foot = el("div", "flex items-center justify-between mt-auto pt-4 border-t");
    var feeBox = el("div");
    var fee = money(c.fee);
    feeBox.appendChild(el("span", "text-[10px] text-slate-400", fee ? "Course Fee" : "Fee"));
    feeBox.appendChild(el("div", "font-black text-blue-600", fee || "Ask the centre"));
    foot.appendChild(feeBox);
    var a = el("a", "inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition", "Details →");
    a.href = detailHref(c);
    foot.appendChild(a);
    var spacer = el("div", "mt-5");
    body.appendChild(spacer);
    body.appendChild(foot);

    wrap.appendChild(body);
    return wrap;
  }

  function filters(bar, grid, courses) {
    var cats = [];
    courses.forEach(function (c) { if (c.category && cats.indexOf(c.category) < 0) cats.push(c.category); });
    bar.textContent = "";
    if (cats.length < 2) return;
    var buttons = [];
    function show(cat, btn) {
      buttons.forEach(function (b) {
        var on = b === btn;
        b.className = "px-4 py-2 rounded-full text-xs font-bold border transition " +
          (on ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:border-blue-400");
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      Array.prototype.forEach.call(grid.children, function (node) {
        node.style.display = !cat || node.getAttribute("data-category") === cat ? "" : "none";
      });
    }
    [""].concat(cats).forEach(function (cat) {
      var b = el("button", "", cat ? categoryLabel(cat) : "All courses");
      b.type = "button";
      b.addEventListener("click", function () { show(cat, b); });
      buttons.push(b);
      bar.appendChild(b);
    });
    show("", buttons[0]);
  }

  function initList(grid) {
    var bar = document.getElementById("courseFilters");
    rpc("public_courses")
      .then(function (rows) {
        var courses = Array.isArray(rows) ? rows.filter(function (c) { return c && c.name; }) : [];
        if (!courses.length) return; // keep the cards written into the page
        grid.textContent = "";
        courses.forEach(function (c) { grid.appendChild(card(c)); });
        if (bar) filters(bar, grid, courses);
        grid.setAttribute("data-source", "erp");
      })
      .catch(function () { /* the page's own cards stay */ });
  }

  /* ---------- one course ---------- */

  function fact(icon, label, value) {
    if (!value) return null;
    var box = el("div", "rounded-xl border border-slate-200 bg-white p-4");
    box.appendChild(el("div", "text-[11px] font-bold uppercase tracking-wider text-slate-400", label));
    box.appendChild(el("div", "mt-1 font-black text-slate-900", value));
    return box;
  }

  function initDetail(root) {
    var key = new URLSearchParams(location.search).get("c") || "";
    var state = document.getElementById("courseState");
    function fail(text) {
      if (state) {
        state.textContent = "";
        state.appendChild(el("h1", "text-2xl font-black text-slate-900", "Course not found"));
        state.appendChild(el("p", "mt-2 text-slate-500", text));
        var back = el("a", "inline-block mt-6 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold", "See all courses");
        back.href = "computer-course.html";
        state.appendChild(back);
      }
    }
    if (!key) return fail("No course was chosen.");

    rpc("public_course", { p_key: key })
      .then(function (c) {
        if (!c || !c.name) return fail("This course is not on the website any more. See the courses we run now.");
        document.title = c.name + " | Career Optics Computer Academy";
        var meta = document.querySelector('meta[name="description"]');
        if (meta && c.description) meta.setAttribute("content", c.description);

        if (state) state.hidden = true;
        root.hidden = false;

        var set = function (id, text) { var n = document.getElementById(id); if (n) n.textContent = text || ""; };
        set("cdName", c.name);
        set("cdCategory", categoryLabel(c.category));
        set("cdDescription", c.description || "Learn " + c.name + " with practical classes in our computer lab, regular tests and a certificate on completion.");
        set("cdCrumb", c.name);

        var media = document.getElementById("cdMedia");
        if (media) {
          media.textContent = "";
          var src = safeImage(c.image);
          if (src) {
            var img = el("img", "w-full h-full object-cover");
            img.src = src;
            img.alt = c.name;
            img.onerror = function () { media.replaceChild(placeholder(c, "w-full h-full"), img); };
            media.appendChild(img);
          } else {
            media.appendChild(placeholder(c, "w-full h-full"));
          }
        }

        var facts = document.getElementById("cdFacts");
        if (facts) {
          facts.textContent = "";
          [
            fact("clock", "Duration", duration(c.durationValue, c.durationUnit)),
            fact("wallet", "Course fee", money(c.fee) || "Ask the centre"),
            fact("hash", "Course code", c.code),
            fact("badge", "Certificate", c.certification || "Career Optics Computer Academy, QR-verified"),
          ].forEach(function (n) { if (n) facts.appendChild(n); });
        }

        var elig = document.getElementById("cdEligibility");
        if (elig) {
          if (c.eligibility) { elig.hidden = false; set("cdEligibilityText", c.eligibility); } else { elig.hidden = true; }
        }

        var syl = document.getElementById("cdSyllabus");
        var list = document.getElementById("cdModules");
        var modules = Array.isArray(c.modules) ? c.modules : [];
        if (syl && list) {
          list.textContent = "";
          syl.hidden = !modules.length;
          modules.forEach(function (m, i) {
            var item = el("details", "rounded-xl border border-slate-200 bg-white px-5");
            if (i === 0) item.open = true;
            var sum = el("summary", "cursor-pointer py-4 font-bold text-slate-900 flex gap-3 items-baseline");
            sum.appendChild(el("span", "text-blue-600 font-black", String(i + 1).padStart(2, "0")));
            sum.appendChild(el("span", "", m.name));
            item.appendChild(sum);
            if (m.description) item.appendChild(el("p", "text-sm text-slate-500 pb-2", m.description));
            var chapters = Array.isArray(m.chapters) ? m.chapters : [];
            if (chapters.length) {
              var ul = el("ul", "pb-4 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-slate-600 list-disc pl-5");
              chapters.forEach(function (ch) { ul.appendChild(el("li", "", ch)); });
              item.appendChild(ul);
            } else {
              item.appendChild(el("div", "pb-2"));
            }
            list.appendChild(item);
          });
        }

        var courseBox = document.getElementById("cdFormCourse");
        if (courseBox) courseBox.value = c.name;
      })
      .catch(function () { fail("The course could not be loaded. Please check your connection and try again."); });
  }

  function start() {
    var grid = document.querySelector("#courseGrid[data-db-courses]");
    if (grid) initList(grid);
    var detail = document.getElementById("courseDetail");
    if (detail) initDetail(detail);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
