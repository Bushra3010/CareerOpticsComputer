/*
 * Admission and franchise applications from the website, into the ERP.
 *
 * Loaded on every page by cms.js. Any form on a page that asks for a mobile
 * number is an application: on submit this takes it over, asks an admission
 * applicant which centre they want, and sends it to the database through
 * the public functions in supabase/schema/website-applications.sql --
 * admissions land in that centre's Admission Leads, franchise applications
 * (on franchise.html) in the head office's Branch Lead Management.
 *
 * The forms were written page by page with different field names, so the
 * fields are recognised by what they say (name, id, placeholder, label).
 * If the database cannot be reached, the application is sent on WhatsApp
 * instead, so nobody's enquiry is lost.
 */
(function () {
  "use strict";

  if (window.__apply) return; // once per page, however often it is included
  var centres = null;
  var config = function () { return window.CMS_CONFIG || {}; };
  var isFranchisePage = function () { return /franchise/i.test(location.pathname); };

  /* ---------- reading a form ---------- */

  function labelOf(el) {
    var parts = [el.name, el.id, el.getAttribute("placeholder"), el.getAttribute("aria-label")];
    if (el.id) {
      var forLabel = document.querySelector('label[for="' + el.id.replace(/"/g, "") + '"]');
      if (forLabel) parts.push(forLabel.textContent);
    }
    var wrap = el.closest("label");
    if (wrap) parts.push(wrap.textContent);
    // A label written just above the box, in the same wrapper.
    var prev = el.previousElementSibling;
    if (prev && /^(LABEL|SPAN|P|DIV)$/.test(prev.tagName) && prev.textContent.length < 60) parts.push(prev.textContent);
    return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  }

  /** What the visitor sees the box called: its label, else its placeholder, else its name. */
  function shownLabel(el) {
    var label = el.id && document.querySelector('label[for="' + el.id.replace(/"/g, "") + '"]');
    var text = (label && label.textContent) || el.getAttribute("placeholder") || el.getAttribute("aria-label") ||
      (el.name || el.id || "").replace(/[_-]+/g, " ");
    return text.replace(/\s+/g, " ").replace(/^(enter|select|choose)\s+(your\s+)?/i, "").trim();
  }

  function fieldsOf(form) {
    return Array.prototype.filter.call(form.elements, function (el) {
      if (!/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return false;
      var type = (el.type || "").toLowerCase();
      if (/^(hidden|submit|button|reset|file|password|image)$/.test(type)) return false;
      if ((type === "checkbox" || type === "radio") && !el.checked) return false;
      return true;
    });
  }

  function isPhone(el) {
    return (el.type || "").toLowerCase() === "tel" || /mobile|phone|contact|whats ?app/i.test(labelOf(el));
  }

  /** The application in a form, by what each box is for; anything else goes in the message. */
  function collect(form) {
    var out = { extras: [] };
    var rules = [
      ["phone", function (el, l) { return isPhone(el); }],
      ["email", function (el, l) { return (el.type || "").toLowerCase() === "email" || /e-?mail/i.test(l); }],
      ["parent", function (el, l) { return /father|parent|guardian/i.test(l); }],
      ["institute", function (el, l) { return /institute|centre name|center name|organi[sz]ation|school name/i.test(l); }],
      ["course", function (el, l) { return /course|program|programme|interested in/i.test(l); }],
      ["qualification", function (el, l) { return /qualif|education|degree|passed|class/i.test(l); }],
      ["pincode", function (el, l) { return /pin ?code|pin\b|zip/i.test(l); }],
      ["district", function (el, l) { return /district/i.test(l); }],
      ["block", function (el, l) { return /block/i.test(l); }],
      ["state", function (el, l) { return /\bstate\b/i.test(l); }],
      ["city", function (el, l) { return /city|town|village|location/i.test(l); }],
      ["address", function (el, l) { return /address/i.test(l); }],
      ["computers", function (el, l) { return /pcs|computers?\b|systems?\b/i.test(l); }],
      ["staff", function (el, l) { return /staff|teacher|faculty/i.test(l); }],
      ["investment", function (el, l) { return /invest|budget/i.test(l); }],
      ["model", function (el, l) { return /model|plan\b|package|franchise type/i.test(l); }],
      ["name", function (el, l) { return /name/i.test(l); }],
      ["message", function (el, l) { return el.tagName === "TEXTAREA" || /message|query|remark|comment|note/i.test(l); }],
    ];
    fieldsOf(form).forEach(function (el) {
      var value = String(el.value || "").trim();
      if (!value) return;
      // A ticked consent box ("I agree") says nothing worth sending.
      if ((el.type || "").toLowerCase() === "checkbox" && /^(on|true|yes|1)$/i.test(value)) return;
      var label = labelOf(el);
      for (var i = 0; i < rules.length; i++) {
        var key = rules[i][0];
        if (!out[key] && rules[i][1](el, label)) {
          out[key] = value;
          return;
        }
      }
      // A box that says nothing about itself: the first is the applicant's name.
      if (!out.name && el.tagName === "INPUT" && (el.type || "text") === "text" && !label) {
        out.name = value;
        return;
      }
      var shown = shownLabel(el) || "Detail";
      out.extras.push(shown.charAt(0).toUpperCase() + shown.slice(1, 40) + ": " + value);
    });
    return out;
  }

  /** The course a course page is about: its main heading, else its title. */
  function pageCourse() {
    var h1 = document.querySelector("h1");
    var text = (h1 && h1.textContent) || document.title || "";
    return text.split(/[|–—]/)[0].replace(/\s+/g, " ").trim().slice(0, 120);
  }

  function eligible(form) {
    if (!form || form.tagName !== "FORM") return false;
    if (form.closest("[data-no-apply], #whatsappWidget, [data-cms-ui]")) return false;
    return fieldsOf(form).some(isPhone);
  }

  /* ---------- the database ---------- */

  function rpc(fn, body) {
    var cfg = config();
    if (!cfg.url || !cfg.key) return Promise.reject(new Error("offline"));
    return fetch(cfg.url + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { apikey: cfg.key, Authorization: "Bearer " + cfg.key, "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (data) {
        if (!r.ok) {
          var message = (data && data.message) || "";
          var err = new Error(/INVALID:/.test(message) ? message.replace(/^.*INVALID:\s*/, "") : "offline");
          throw err;
        }
        return data;
      });
    });
  }

  function loadCentres() {
    if (!centres) {
      // Null when the list cannot be had (offline, or the database not set
      // up yet): the application then goes on WhatsApp.
      centres = rpc("public_centres").catch(function () {
        centres = null;
        return null;
      });
    }
    return centres;
  }

  function whatsappNumber() {
    return (window.siteWhatsapp && window.siteWhatsapp()) || "";
  }

  function whatsappText(kind, data, centreName) {
    var lines = [kind === "franchise" ? "Franchise application" : "Admission application"];
    if (centreName) lines.push("Centre: " + centreName);
    ["name", "phone", "email", "course", "qualification", "institute", "city", "district", "state", "message"].forEach(function (k) {
      if (data[k]) lines.push(k.charAt(0).toUpperCase() + k.slice(1) + ": " + data[k]);
    });
    return lines.join("\n");
  }

  /* ---------- the dialog ---------- */

  var css =
    "#apply-dialog{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Poppins,Arial,sans-serif}" +
    "#apply-dialog .box{background:#fff;color:#0f172a;border-radius:18px;max-width:440px;width:100%;max-height:92vh;overflow:auto;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.3)}" +
    "#apply-dialog h3{margin:0 0 4px;font-size:19px;font-weight:700}" +
    "#apply-dialog p{margin:0 0 12px;font-size:13.5px;line-height:1.5;color:#475569}" +
    "#apply-dialog label{display:block;font-size:12.5px;font-weight:600;margin:12px 0 6px;color:#334155}" +
    "#apply-dialog input,#apply-dialog select{width:100%;box-sizing:border-box;height:44px;border:1.5px solid #cbd5e1;border-radius:12px;padding:0 12px;font-size:14px;background:#fff;color:#0f172a}" +
    "#apply-dialog .row{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}" +
    "#apply-dialog button{flex:1;min-width:120px;height:44px;border:0;border-radius:12px;font-weight:600;font-size:14px;cursor:pointer}" +
    "#apply-dialog .go{background:#2563eb;color:#fff}#apply-dialog .go[disabled]{opacity:.6;cursor:wait}" +
    "#apply-dialog .ghost{background:#f1f5f9;color:#0f172a}#apply-dialog .wa{background:#25D366;color:#fff}" +
    "#apply-dialog .err{color:#dc2626;font-size:13px;margin-top:10px;min-height:1em}" +
    "#apply-dialog .ok{font-size:40px;text-align:center;margin-bottom:6px}";

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text != null) node.textContent = text;
    return node;
  }

  function close() {
    var d = document.getElementById("apply-dialog");
    if (d) d.remove();
  }

  function dialog() {
    close();
    if (!document.getElementById("apply-dialog-css")) {
      var style = el("style", { id: "apply-dialog-css", "data-cms-ui": "" });
      style.textContent = css;
      document.head.appendChild(style);
    }
    var shade = el("div", { id: "apply-dialog", "data-cms-ui": "", role: "dialog", "aria-modal": "true" });
    var box = el("div", { class: "box" });
    shade.appendChild(box);
    shade.addEventListener("click", function (e) { if (e.target === shade) close(); });
    document.body.appendChild(shade);
    return box;
  }

  function done(box, kind, data, centreName, form, centreId) {
    box.textContent = "";
    box.appendChild(el("div", { class: "ok" }, "✅"));
    box.appendChild(el("h3", { style: "text-align:center" }, "Thank you" + (data.name ? ", " + data.name.split(" ")[0] : "") + "!"));
    box.appendChild(el("p", { style: "text-align:center" }, kind === "franchise"
      ? "Your franchise application has reached our head office. Our team will call you on " + data.phone + " soon."
      : "Your admission application has been sent to " + centreName + ". The centre will call you on " + data.phone + " soon."));
    // The full admission -- documents and fee screenshot -- is made on the
    // ERP's online form, which the centre then approves.
    if (kind === "admission") {
      var query = ["centre=" + encodeURIComponent(centreId || ""), "course=" + encodeURIComponent(data.course || ""),
        "name=" + encodeURIComponent(data.name || ""), "phone=" + encodeURIComponent(data.phone || "")].join("&");
      box.appendChild(el("p", { style: "text-align:center;margin-top:4px" }, "To confirm your seat, complete the admission form with your documents."));
      var full = el("a", { class: "go", href: "/computercentre/apply?" + query,
        style: "display:flex;align-items:center;justify-content:center;text-decoration:none;height:44px;border-radius:12px;font-weight:600;margin-top:8px" }, "Apply online with documents");
      box.appendChild(full);
    }
    var row = el("div", { class: "row" });
    var number = whatsappNumber();
    if (number) {
      var wa = el("button", { type: "button", class: "wa" }, "Chat on WhatsApp");
      wa.addEventListener("click", function () {
        window.open("https://wa.me/" + number + "?text=" + encodeURIComponent(whatsappText(kind, data, centreName)), "_blank");
      });
      row.appendChild(wa);
    }
    var ok = el("button", { type: "button", class: "go" }, "Done");
    ok.addEventListener("click", close);
    row.appendChild(ok);
    box.appendChild(row);
    if (form && form.reset) form.reset();
  }

  /** The database could not be reached: the application goes on WhatsApp instead. */
  function fallback(kind, data, centreName) {
    var number = whatsappNumber();
    if (number) window.open("https://wa.me/" + number + "?text=" + encodeURIComponent(whatsappText(kind, data, centreName)), "_blank");
    else alert("Sorry, we could not send your application. Please call us.");
  }

  function message(data) {
    return [data.message].concat(data.extras || []).filter(Boolean).join(" | ");
  }

  function applyAdmission(data, form) {
    var box = dialog();
    box.appendChild(el("h3", null, "Apply for admission"));
    box.appendChild(el("p", null, (data.name || "Applicant") + " · " + data.phone + ". Choose the centre you want to join; it will call you."));
    box.appendChild(el("label", { for: "apply-centre" }, "Your centre"));
    var search = el("input", { type: "search", placeholder: "Search centre, city or district…", "aria-label": "Search centre" });
    box.appendChild(search);
    var select = el("select", { id: "apply-centre", style: "margin-top:8px", size: "1" });
    select.appendChild(el("option", { value: "" }, "Loading centres…"));
    box.appendChild(select);
    box.appendChild(el("label", { for: "apply-course" }, "Course"));
    var course = el("input", { id: "apply-course", type: "text", maxlength: "120" });
    course.value = data.course || pageCourse();
    box.appendChild(course);
    var err = el("div", { class: "err", role: "alert" });
    box.appendChild(err);
    var row = el("div", { class: "row" });
    var cancel = el("button", { type: "button", class: "ghost" }, "Cancel");
    cancel.addEventListener("click", close);
    var send = el("button", { type: "button", class: "go" }, "Send application");
    row.appendChild(cancel);
    row.appendChild(send);
    box.appendChild(row);

    var list = [];
    function fill() {
      var needle = search.value.trim().toLowerCase();
      var current = select.value;
      select.textContent = "";
      select.appendChild(el("option", { value: "" }, list.length ? "Select your centre" : "No centre is taking admissions online"));
      list.forEach(function (c) {
        var where = [c.city, c.district, c.state].filter(Boolean).join(", ");
        var text = c.name + (where ? " — " + where : "");
        if (needle && text.toLowerCase().indexOf(needle) < 0) return;
        select.appendChild(el("option", { value: c.id }, text));
      });
      select.value = current;
    }
    search.addEventListener("input", fill);
    loadCentres().then(function (rows) {
      if (!rows || !rows.length) {
        close();
        fallback("admission", data, "");
        return;
      }
      list = rows;
      fill();
    });

    send.addEventListener("click", function () {
      err.textContent = "";
      var chosen = list.filter(function (c) { return c.id === select.value; })[0];
      if (!chosen) {
        err.textContent = "Please choose your centre.";
        return;
      }
      data.course = course.value.trim();
      send.disabled = true;
      send.textContent = "Sending…";
      rpc("submit_admission_application", {
        p_branch_id: chosen.id,
        p_student_name: data.name || "",
        p_phone: data.phone || "",
        p_email: data.email || null,
        p_course: data.course || null,
        p_qualification: data.qualification || null,
        p_city: data.city || data.district || null,
        p_parent_name: data.parent || null,
        p_message: message(data) || null,
        p_page: location.pathname.split("/").pop() || "home",
      })
        .then(function () { done(box, "admission", data, chosen.name, form, chosen.id); })
        .catch(function (e) {
          send.disabled = false;
          send.textContent = "Send application";
          if (e.message && e.message !== "offline") err.textContent = e.message;
          else {
            close();
            fallback("admission", data, chosen.name);
          }
        });
    });
  }

  function applyFranchise(data, form) {
    var box = dialog();
    box.appendChild(el("h3", null, "Sending your application…"));
    rpc("submit_franchise_application", {
      p_name: data.name || "",
      p_phone: data.phone || "",
      p_email: data.email || null,
      p_institute: data.institute || null,
      p_address: data.address || null,
      p_state: data.state || null,
      p_district: data.district || null,
      p_block: data.block || null,
      p_city: data.city || null,
      p_pincode: data.pincode || null,
      p_computers: data.computers || null,
      p_staff: data.staff || null,
      p_investment: data.investment || null,
      p_model: data.model || null,
      p_message: message(data) || null,
    })
      .then(function () { done(box, "franchise", data, "", form); })
      .catch(function (e) {
        if (e.message && e.message !== "offline") {
          box.textContent = "";
          box.appendChild(el("h3", null, "Please check your details"));
          box.appendChild(el("p", null, e.message));
          var back = el("button", { type: "button", class: "go" }, "OK");
          back.addEventListener("click", close);
          box.appendChild(back);
        } else {
          close();
          fallback("franchise", data, "");
        }
      });
  }

  /* ---------- taking over the forms ---------- */

  // Capturing on the document runs before the page's own handlers and its
  // inline onsubmit, which stop here: the application goes to the ERP.
  document.addEventListener(
    "submit",
    function (e) {
      var form = e.target;
      if (!eligible(form)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (form.reportValidity && !form.reportValidity()) return;
      var data = collect(form);
      if (!data.phone) return;
      if (isFranchisePage()) applyFranchise(data, form);
      else applyAdmission(data, form);
    },
    true,
  );

  // Files cannot go with an online application -- the centre collects them --
  // so a required upload must not stop the form from being sent.
  function relaxUploads() {
    Array.prototype.forEach.call(document.forms, function (form) {
      if (!eligible(form)) return;
      Array.prototype.forEach.call(form.querySelectorAll('input[type="file"][required]'), function (input) {
        input.removeAttribute("required");
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", relaxUploads);
  else relaxUploads();

  // Fetched early so the centre list is ready when the dialog opens.
  if (!isFranchisePage() && document.querySelector("form")) loadCentres();

  // For the ERP's tests; nothing on the site uses these.
  window.__apply = { collect: collect, eligible: eligible, pageCourse: pageCourse, reset: function () { centres = null; }, relax: relaxUploads };
})();
