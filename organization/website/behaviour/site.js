/*
 * A franchise centre's website (site.html), filled in the browser.
 *
 * Which centre: /c/<slug> on any host, else the host itself when it is not
 * one of the head office's (a centre's own domain, sent here by
 * middleware.ts). The centre's public details come from the database
 * function public_branch_site() with the anon key (window.CMS_CONFIG, from
 * /cms-config.js) -- only fields that function chooses to share.
 *
 * Everything from the database goes in with textContent or as a checked
 * URL, never as HTML: a centre types its own copy, and it is shown to the
 * public.
 *
 * The admission enquiry goes to the centre's Admission Leads through
 * submit_admission_application(), as the head office's forms do (apply.js);
 * if the database cannot be reached it goes on WhatsApp instead.
 */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var MAIN = CFG.mainOrigin || "https://www.careeropticscomputer.in";
  var BRAND = CFG.brand || "Career Optics Computer Academy";
  var ICON = CFG.icons || {};

  /* ---------- which centre (mirrors src/lib/branchSite.ts) ---------- */

  var HOSTS = CFG.hosts || ["careeropticscomputer.in", "career-optics-computer.vercel.app", "localhost", "127.0.0.1", "[::1]", "::1"];

  function normaliseHost(input) {
    return String(input || "")
      .trim()
      .toLowerCase()
      .replace(/^[a-z]+:\/\//, "")
      .replace(/[/?#].*$/, "")
      .replace(/(:\d+)?\.?$/, "")
      .replace(/^www\./, "");
  }

  function isHeadOfficeHost(hostname) {
    var host = normaliseHost(hostname);
    return !host || HOSTS.indexOf(host) >= 0 || /\.vercel\.app$/.test(host) || /\.localhost$/.test(host);
  }

  function resolveSite(pathname, hostname) {
    var match = /^\/c\/([^/?#]+)\/?$/.exec(pathname || "");
    if (match) {
      var slug = match[1];
      try { slug = decodeURIComponent(slug); } catch (e) { /* looked up as typed */ }
      return { slug: slug.toLowerCase() };
    }
    if (!isHeadOfficeHost(hostname)) return { host: normaliseHost(hostname) };
    return null;
  }

  // On a centre's own domain the head office's pages are on the main host;
  // on the head office's own hosts (and in dev) they are right here.
  var HQ = isHeadOfficeHost(location.hostname) ? "" : MAIN;

  /* ---------- small helpers ---------- */

  function $(id) { return document.getElementById(id); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null && text !== "") n.textContent = text;
    return n;
  }

  function icon(name) {
    var span = document.createElement("span");
    span.style.display = "contents";
    span.innerHTML = ICON[name] || ""; // our own SVG, from the page
    return span;
  }

  /** Only plain web addresses -- and, for images, an uploaded picture -- get into an href or src. */
  function safeUrl(url, image) {
    var u = String(url || "").trim();
    if (/^https?:\/\//i.test(u)) return u;
    if (image && /^data:image\/(png|jpe?g|webp|gif|svg\+xml|x-icon|vnd\.microsoft\.icon);base64,/i.test(u)) return u;
    return "";
  }

  function digits(phone) {
    var d = String(phone || "").replace(/\D/g, "");
    if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2);
    if (d.length === 11 && d.charAt(0) === "0") d = d.slice(1);
    return d;
  }

  function telHref(phone) {
    var d = digits(phone);
    return d.length === 10 ? "tel:+91" + d : d ? "tel:" + d : "";
  }

  function waNumber(phone) {
    var d = digits(phone);
    return d.length === 10 ? "91" + d : "";
  }

  function waHref(phone, text) {
    var n = waNumber(phone);
    return n ? "https://wa.me/" + n + (text ? "?text=" + encodeURIComponent(text) : "") : "";
  }

  function showPhone(phone) {
    var d = digits(phone);
    return d.length === 10 ? "+91 " + d.slice(0, 5) + " " + d.slice(5) : String(phone || "");
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

  function setLink(a, href, external) {
    if (!a) return;
    if (!href) {
      a.hidden = true;
      return;
    }
    a.hidden = false;
    a.href = href;
    if (external) { a.target = "_blank"; a.rel = "noopener"; } else { a.removeAttribute("target"); }
  }

  function setMeta(selector, attr, name, value) {
    if (!value) return;
    var m = document.head.querySelector(selector);
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute(attr, name);
      document.head.appendChild(m);
    }
    m.setAttribute("content", value);
  }

  function addressText(a) {
    if (!a) return "";
    var parts = [a.street, a.city, a.district && a.district !== a.city ? a.district : "", a.state].filter(Boolean);
    return parts.join(", ") + (a.pincode ? " – " + a.pincode : "");
  }

  /* ---------- the database ---------- */

  function rpc(fn, body) {
    var cfg = window.CMS_CONFIG || {};
    if (!cfg.url || !cfg.key) return Promise.reject(new Error("offline"));
    return fetch(cfg.url + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { apikey: cfg.key, Authorization: "Bearer " + cfg.key, "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (data) {
        if (!r.ok) {
          var message = (data && data.message) || "";
          throw new Error(/INVALID:/.test(message) ? message.replace(/^.*INVALID:\s*/, "") : "offline");
        }
        return data;
      });
    });
  }

  /* ---------- states ---------- */

  function missing(failed) {
    $("sPage").hidden = true;
    var box = $("sMissing");
    box.hidden = false;
    if (failed) {
      box.querySelector("h1").textContent = "This website could not be loaded";
      box.querySelector("p").textContent = "Please check your internet connection and try again.";
      var again = el("button", "s-btn s-btn-light", "Try again");
      again.type = "button";
      again.addEventListener("click", function () { location.reload(); });
      box.querySelector(".s-cta").insertBefore(again, box.querySelector(".s-cta").firstChild);
    }
    document.title = failed ? "Could not load | " + BRAND : "Centre website not available | " + BRAND;
    setMeta('meta[name="robots"]', "name", "robots", "noindex");
    document.body.classList.remove("s-loading");
  }

  /* ---------- filling the page ---------- */

  function fillHead(site) {
    var name = site.name || site.branchName || "Study Centre";
    var description = site.description || site.heroSubtitle ||
      name + " is an authorised study centre of " + BRAND + (site.address && site.address.city ? " in " + site.address.city : "") +
      ". Computer courses, admissions open.";
    var title = name + " | Authorised Study Centre of " + BRAND;
    document.title = title;
    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:url"]', "property", "og:url", location.href.split("#")[0]);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", name);
    var ogImage = safeUrl(site.banner) || safeUrl(site.logo);
    if (ogImage) setMeta('meta[property="og:image"]', "property", "og:image", ogImage);
    var fav = safeUrl(site.favicon, true) || safeUrl(site.logo, true);
    if (fav) {
      var link = document.head.querySelector('link[rel="icon"]') || document.head.appendChild(document.createElement("link"));
      link.rel = "icon";
      link.href = fav;
    }
  }

  function fillHeader(site, phone, wa) {
    var name = site.name || site.branchName;
    $("sName").textContent = name;
    var logo = safeUrl(site.logo, true);
    if (logo) $("sLogo").src = logo;
    $("sLogo").alt = name + " logo";
    // The centre's own mark, large, at the top of the hero; the head-office
    // default stays only in the header, so a centre without a logo is not
    // shown the academy's twice.
    if (logo && $("sHeroLogo")) {
      $("sHeroLogo").src = logo;
      $("sHeroLogo").alt = name + " logo";
      $("sHeroLogo").hidden = false;
    }
    var call = telHref(phone);
    var chat = waHref(wa, "Hello " + name + ", I would like to know about admission.");
    setLink($("sCallTop"), call);
    setLink($("sWaTop"), chat, true);
    setLink($("sCallFloat"), call);
    setLink($("sWaFloat"), chat, true);
    if (!call && !chat) $("sWaFloat").parentNode.hidden = true;
  }

  function fillHero(site, phone) {
    var name = site.name || site.branchName;
    var city = site.address && (site.address.city || site.address.district);
    $("sHeroTitle").textContent = site.heroTitle || "Welcome to " + name;
    $("sHeroSub").textContent = site.heroSubtitle || site.tagline ||
      "Computer courses with certificates from " + BRAND + (city ? ", right here in " + city : "") + ". Admissions are open.";
    var banner = safeUrl(site.banner, true);
    if (banner) {
      var bg = $("sHeroBg");
      var probe = new Image();
      probe.onload = function () {
        bg.style.backgroundImage = 'url("' + banner.replace(/"/g, "%22") + '")';
        bg.classList.add("on");
      };
      probe.src = banner;
    }
    var apply = $("sApply");
    if (site.onlineAdmission) {
      apply.href = HQ + "/computercentre/apply?centre=" + encodeURIComponent(site.id);
    } else {
      apply.href = "#admission";
    }
    var call = telHref(phone);
    if (call) $("sCallHero").href = call;
    else $("sCallHero").hidden = true;
  }

  function fillAbout(site) {
    var name = site.name || site.branchName;
    $("sAboutTitle").textContent = "About " + name;
    var city = site.address && (site.address.city || site.address.district);
    $("sAbout").textContent = site.aboutText ||
      name + " is an authorised study centre of " + BRAND + (city ? " in " + city : "") +
      ". We teach computer courses on the academy's syllabus, in a practical lab, and our students sit the academy's exams and receive its QR-verifiable certificates.";

    var list = $("sHighlights");
    (site.highlights || []).slice(0, 12).forEach(function (h) {
      var li = el("li");
      li.appendChild(icon("check"));
      li.appendChild(el("span", "", h));
      list.appendChild(li);
    });
    list.hidden = !list.children.length;

    var facts = $("sFacts");
    function fact(value, label) {
      if (!value) return;
      var box = el("div", "s-fact");
      box.appendChild(el("b", "", String(value)));
      box.appendChild(el("span", "", label));
      facts.appendChild(box);
    }
    fact(site.establishedYear ? "Since " + site.establishedYear : "", "Teaching students");
    fact((site.courses || []).length ? String(site.courses.length) : "", (site.courses || []).length === 1 ? "Course offered" : "Courses offered");
    fact(site.director, "Centre director");
    fact(city, site.address && site.address.state ? site.address.state : "Location");
    fact(site.code, "Centre code");
  }

  function fillCourses(site) {
    var grid = $("sCourses");
    var select = $("sCourseSelect");
    var courses = site.courses || [];
    if (!courses.length) {
      var none = el("div", "s-panel", "");
      none.appendChild(el("h3", "", "Ask us about our courses"));
      none.appendChild(el("p", "", "Call or WhatsApp the centre to hear which courses are starting soon."));
      grid.appendChild(none);
      return;
    }
    courses.forEach(function (c) {
      var card = el("article", "s-course");
      card.appendChild(el("h3", "", c.name));
      if (c.code) card.appendChild(el("code", "", c.code));
      var meta = el("div", "s-course-meta");
      var d = duration(c.durationValue, c.durationUnit);
      var left = el("span");
      if (d) {
        left.appendChild(icon("clock"));
        left.appendChild(document.createTextNode(d));
      }
      meta.appendChild(left);
      meta.appendChild(el("b", "", money(c.fee) || "Ask for fee"));
      card.appendChild(meta);
      var ask = el("a", "", "Enquire about this course →");
      ask.href = "#admission";
      ask.addEventListener("click", function () { select.value = c.name; });
      card.appendChild(ask);
      grid.appendChild(card);

      var opt = el("option", "", c.name);
      opt.value = c.name;
      select.appendChild(opt);
    });
  }

  /* ---------- gallery and lightbox (as behaviour/gallery.js) ---------- */

  var lb, lbImg, lbCap, lbCount, shown = [], at = 0, lastFocus = null;

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
    [close, prev, fig, next, lbCount].forEach(function (n) { lb.appendChild(n); });
    document.body.appendChild(lb);
    close.addEventListener("click", hide);
    prev.addEventListener("click", function () { show(at - 1); });
    next.addEventListener("click", function () { show(at + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target === fig) hide(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") hide();
      else if (e.key === "ArrowLeft") show(at - 1);
      else if (e.key === "ArrowRight") show(at + 1);
    });
  }

  function show(i) {
    if (!shown.length) return;
    at = (i + shown.length) % shown.length;
    var p = shown[at];
    lbImg.src = p.imageUrl;
    lbImg.alt = p.title || p.category || "Gallery photo";
    lbCap.textContent = [p.title, p.category].filter(Boolean).join(" • ");
    lbCount.textContent = shown.length > 1 ? at + 1 + " / " + shown.length : "";
    lb.classList.toggle("cg-single", shown.length < 2);
  }

  function open(photos, i) {
    if (!lb) buildLightbox();
    shown = photos;
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

  function fillGallery(site) {
    var photos = (site.gallery || []).filter(function (p) { return safeUrl(p.imageUrl); });
    if (!photos.length) {
      var link = document.querySelector("[data-gallery-link]");
      if (link) link.hidden = true;
      return;
    }
    $("gallery").hidden = false;
    if (!site.galleryIsOwn) {
      var note = $("sGalleryNote");
      note.textContent = "Photos from " + BRAND + ".";
      note.hidden = false;
    }
    var grid = el("div", "cg-grid");
    photos.forEach(function (p, i) {
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
      grid.appendChild(b);
    });
    $("sGallery").appendChild(grid);
  }

  /* ---------- contact ---------- */

  function fillContact(site, phone, wa) {
    var list = $("sContact");
    function row(iconName, label, text, href, external) {
      if (!text) return;
      var li = el("li");
      var i = el("i");
      i.appendChild(icon(iconName));
      li.appendChild(i);
      var body = el("div");
      body.appendChild(el("b", "", label));
      var value = el(href ? "a" : "span", "", text);
      if (href) {
        value.href = href;
        if (external) { value.target = "_blank"; value.rel = "noopener"; }
      }
      body.appendChild(value);
      li.appendChild(body);
      list.appendChild(li);
    }
    var addr = addressText(site.address);
    var mapLink = safeUrl(site.address && site.address.mapLink);
    row("pin", "Address", addr, mapLink, true);
    row("phone", "Phone", phone ? showPhone(phone) : "", telHref(phone));
    if (waNumber(wa)) row("whatsapp", "WhatsApp", showPhone(wa), waHref(wa), true);
    row("mail", "Email", site.email, site.email ? "mailto:" + site.email : "");

    var social = $("sSocial");
    var names = { facebook: "Facebook", instagram: "Instagram", youtube: "YouTube", twitter: "X (Twitter)", linkedin: "LinkedIn" };
    Object.keys(names).forEach(function (k) {
      var url = safeUrl(site.social && site.social[k]);
      if (!url) return;
      var a = el("a", "", names[k]);
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      social.appendChild(a);
    });
    social.hidden = !social.children.length;

    if (addr) {
      var map = $("sMap");
      var frame = document.createElement("iframe");
      frame.title = "Map to " + (site.name || site.branchName);
      frame.loading = "lazy";
      frame.referrerPolicy = "no-referrer-when-downgrade";
      frame.src = "https://www.google.com/maps?q=" + encodeURIComponent((site.name || "") + ", " + addr) + "&output=embed";
      map.appendChild(frame);
      map.hidden = false;
    }

    $("sFootName").textContent = site.name || site.branchName;
    $("sFootAddr").textContent = addr;
    $("sCopyName").textContent = site.name || site.branchName;
    $("sYear").textContent = String(new Date().getFullYear());
    $("sCentreLogin").href = HQ + "/computercentre/login?as=franchise";
    $("sStudentLogin").href = HQ + "/computercentre/login?as=student";
  }

  /* ---------- the enquiry form ---------- */

  function fillForm(site, phone, wa) {
    var form = $("sForm");
    var alertBox = $("sFormAlert");
    var submit = $("sSubmit");
    var name = site.name || site.branchName;
    var online = !!site.onlineAdmission;

    function enquiryText(data) {
      return ["Admission enquiry for " + name, "Name: " + data.name, "Mobile: " + data.phone,
        data.course ? "Course: " + data.course : "", data.message ? "Message: " + data.message : ""].filter(Boolean).join("\n");
    }

    function error(field, text) {
      var input = form.elements[field];
      var box = form.querySelector('[data-err="' + field + '"]');
      if (input) input.setAttribute("aria-invalid", text ? "true" : "false");
      if (box) box.textContent = text || "";
      return !text;
    }

    function fallback(data, why) {
      alertBox.textContent = "";
      alertBox.appendChild(el("span", "", why + " "));
      var chat = waHref(wa, enquiryText(data));
      if (chat) {
        var a = el("a", "s-btn s-btn-wa s-btn-sm", "Send on WhatsApp");
        a.href = chat;
        a.target = "_blank";
        a.rel = "noopener";
        a.style.marginTop = "8px";
        alertBox.appendChild(a);
      } else if (telHref(phone)) {
        var c = el("a", "s-btn s-btn-navy s-btn-sm", "Call " + showPhone(phone));
        c.href = telHref(phone);
        c.style.marginTop = "8px";
        alertBox.appendChild(c);
      }
      alertBox.hidden = false;
    }

    function done(data, result) {
      form.hidden = true;
      var box = $("sDone");
      box.textContent = "";
      var ok = el("div", "s-ok");
      ok.appendChild(icon("check"));
      box.appendChild(ok);
      box.appendChild(el("h3", "", "Thank you, " + data.name.split(" ")[0] + "!"));
      box.appendChild(el("p", "", "Your enquiry has reached " + name + ". The centre will call you on " + data.phone + " soon."));
      var actions = el("div", "s-form-actions");
      var full = el("a", "s-btn s-btn-primary", "Complete admission online");
      full.href = HQ + "/computercentre/apply?" + [
        "centre=" + encodeURIComponent(site.id),
        "course=" + encodeURIComponent(data.course || ""),
        "name=" + encodeURIComponent(data.name),
        "phone=" + encodeURIComponent(data.phone),
      ].join("&");
      actions.appendChild(full);
      var chat = waHref(wa, enquiryText(data));
      if (chat) {
        var a = el("a", "s-btn s-btn-wa", "Chat on WhatsApp");
        a.href = chat;
        a.target = "_blank";
        a.rel = "noopener";
        actions.appendChild(a);
      }
      box.appendChild(actions);
      box.hidden = false;
      if (result && result.duplicate) box.querySelector("p").textContent += " (We already had your enquiry from a moment ago.)";
    }

    if (!online) {
      submit.textContent = waNumber(wa) ? "Send on WhatsApp" : "Send enquiry";
      var p = $("sEnquiry").querySelector("p");
      p.textContent = "Leave your details and send them to the centre on WhatsApp; it will call you back.";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      alertBox.hidden = true;
      var data = {
        name: String(form.elements.name.value || "").replace(/\s+/g, " ").trim(),
        phone: digits(form.elements.phone.value),
        course: form.elements.course.value,
        message: String(form.elements.message.value || "").trim(),
      };
      var valid = error("name", data.name.length < 2 ? "Please enter your name." : "");
      valid = error("phone", /^[6-9]\d{9}$/.test(data.phone) ? "" : "Please enter a valid 10-digit mobile number.") && valid;
      if (!valid) {
        var bad = form.querySelector('[aria-invalid="true"]');
        if (bad) bad.focus();
        return;
      }
      if (!online) {
        var chat = waHref(wa, enquiryText(data));
        if (chat) window.open(chat, "_blank", "noopener");
        else fallback(data, "Please call the centre with your enquiry.");
        return;
      }
      submit.disabled = true;
      submit.textContent = "Sending…";
      rpc("submit_admission_application", {
        p_branch_id: site.id,
        p_student_name: data.name,
        p_phone: data.phone,
        p_course: data.course || null,
        p_message: data.message || null,
        p_page: "centre-site/" + (site.slug || location.hostname),
      })
        .then(function (result) { done(data, result); })
        .catch(function (err) {
          if (err && err.message && err.message !== "offline") fallback(data, err.message);
          else fallback(data, "We could not send your enquiry just now.");
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = "Send enquiry";
        });
    });
  }

  /* ---------- start ---------- */

  function render(site) {
    var phone = site.phone || "";
    var wa = site.whatsapp || phone;
    fillHead(site);
    fillHeader(site, phone, wa);
    fillHero(site, phone);
    fillAbout(site);
    fillCourses(site);
    fillGallery(site);
    fillContact(site, phone, wa);
    fillForm(site, phone, wa);
    document.body.classList.remove("s-loading");
    // The page was empty when the browser looked for #courses etc.
    if (location.hash.length > 1) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }

  function start() {
    var target = resolveSite(location.pathname, location.hostname);
    // site.html opened directly on the head office's host names no centre.
    if (!target) {
      var q = new URLSearchParams(location.search).get("c");
      target = q ? { slug: q.toLowerCase() } : null;
    }
    if (!target) return missing(false);
    rpc("public_branch_site", { p_slug: target.slug || null, p_host: target.host || null }).then(
      function (site) {
        if (!site || !site.id) return missing(false);
        render(site);
      },
      function () { missing(true); }
    );
  }

  // For the ERP's tests; nothing on the page uses it.
  window.__site = { resolveSite: resolveSite, isHeadOfficeHost: isHeadOfficeHost };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
