/*
 * Website content from the ERP ("Website Content", /computercentre/website/content).
 *
 * The pages are static HTML. This script reads the edits saved in the
 * `website_content` table and lays them over the page:
 *
 *   settings     phone, WhatsApp, email, announcement bar — every page
 *   layout       edits inside the shared header and footer — every page
 *   page:<name>  edits to this page only
 *
 * An edit is keyed by where its element sits: "<scope>:<i>.<j>…", the child
 * index at each level below the scope root (body, or an element marked
 * data-cms-scope). Elements this script adds carry data-cms-ui and are skipped
 * when counting, so they never shift a key.
 *
 * Opened inside the ERP's editor (?cms-edit=1, in a frame) the page becomes
 * editable instead, and talks to the editor with postMessage.
 */
(function () {
  "use strict";

  var cfg = window.CMS_CONFIG || {};
  var page = (location.pathname.split("/").pop() || "index.html").replace(/\.(html|php)$/, "") || "index";
  var editing = new URLSearchParams(location.search).get("cms-edit") === "1" && window.parent !== window;
  var CACHE_KEY = "cms-content:" + page;

  /* ---------- keys ---------- */

  function kids(el) {
    return Array.prototype.filter.call(el.children, function (c) {
      return !c.hasAttribute("data-cms-ui");
    });
  }

  function keyOf(el) {
    var parts = [];
    while (el && el !== document.body) {
      var scope = el.getAttribute && el.getAttribute("data-cms-scope");
      if (scope) return scope + ":" + parts.join(".");
      var parent = el.parentElement;
      if (!parent) return null;
      parts.unshift(kids(parent).indexOf(el));
      el = parent;
    }
    return el ? "body:" + parts.join(".") : null;
  }

  function find(key) {
    var at = key.indexOf(":");
    var scope = key.slice(0, at);
    var path = key.slice(at + 1);
    var el = scope === "body" ? document.body : document.querySelector('[data-cms-scope="' + scope + '"]');
    if (!el || path === "") return el;
    var parts = path.split(".");
    for (var i = 0; i < parts.length && el; i++) el = kids(el)[Number(parts[i])];
    return el || null;
  }

  /* ---------- applying ---------- */

  // Saved HTML comes from the organisation's own admins, but it is still
  // cleaned: no scripts, no event handlers, no javascript: links.
  function clean(html) {
    var t = document.createElement("template");
    t.innerHTML = String(html);
    t.content.querySelectorAll("script,iframe,object,embed,style,link,meta").forEach(function (n) { n.remove(); });
    t.content.querySelectorAll("*").forEach(function (n) {
      Array.prototype.slice.call(n.attributes).forEach(function (a) {
        if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name);
      });
    });
    return t.innerHTML;
  }

  function safeUrl(url) {
    return /^\s*javascript:/i.test(url || "") ? "#" : url;
  }

  function applyEdit(key, edit) {
    var el = find(key);
    if (!el || !edit) return;
    if (edit.tag && el.tagName.toLowerCase() !== edit.tag) return; // the page changed under the edit
    if (edit.html != null) el.innerHTML = clean(edit.html);
    if (edit.src != null && "src" in el) { el.src = safeUrl(edit.src); el.removeAttribute("srcset"); }
    var link = edit.href != null && (el.closest("a") || null);
    if (link) link.setAttribute("href", safeUrl(edit.href));
    // Inline and !important: a Tailwind display class would beat [hidden].
    if (edit.hidden && editing) el.setAttribute("data-cms-hidden", "");
    else if (edit.hidden) el.style.setProperty("display", "none", "important");
    else if (edit.hidden === false) { el.removeAttribute("data-cms-hidden"); el.style.removeProperty("display"); }
  }

  // The WhatsApp number set in the ERP, for the pages' own scripts that open a
  // chat (enquiry forms): they ask for it when a visitor submits.
  var siteWhatsapp = "";
  window.siteWhatsapp = function () { return siteWhatsapp; };

  function digits(s) { return String(s || "").replace(/[^\d]/g, ""); }
  function withCountry(s) { var d = digits(s); return d.length === 10 ? "91" + d : d; }

  function applySettings(s) {
    if (!s) return;
    if (s.phone) {
      var tel = "+" + withCountry(s.phone);
      document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
        var old = digits(a.getAttribute("href"));
        a.setAttribute("href", "tel:" + tel);
        // Swap the number in the link's own text, leaving any icon alone.
        walkText(a, function (node) {
          var d = digits(node.nodeValue);
          if (d.length >= 10 && old.slice(-10) === d.slice(-10)) node.nodeValue = node.nodeValue.replace(/[+\d][\d\s-]{8,}\d/, s.phone);
        });
      });
    }
    if (s.whatsapp) {
      var wa = withCountry(s.whatsapp);
      siteWhatsapp = wa;
      document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
        a.setAttribute("href", a.getAttribute("href").replace(/wa\.me\/[^?"]*/, "wa.me/" + wa));
      });
      document.querySelectorAll("#whatsappWidget [data-number]").forEach(function (b) { b.setAttribute("data-number", wa); });
    }
    if (s.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
        var old = a.getAttribute("href").slice(7);
        a.setAttribute("href", "mailto:" + s.email);
        walkText(a, function (node) { if (old && node.nodeValue.indexOf(old) >= 0) node.nodeValue = node.nodeValue.split(old).join(s.email); });
      });
    }
    announce(s.announcement);
  }

  function walkText(root, fn) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) fn(n);
  }

  function announce(a) {
    var bar = document.getElementById("cms-announcement");
    var header = document.getElementById("siteHeader");
    if (!a || !a.enabled || !a.text) {
      if (bar) { bar.remove(); if (header) header.style.top = ""; document.body.style.paddingTop = ""; }
      return;
    }
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "cms-announcement";
      bar.setAttribute("data-cms-ui", "");
      bar.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:60;background:linear-gradient(90deg,#2563eb,#4f46e5);color:#fff;font:600 13px/1.4 Poppins,Arial,sans-serif;text-align:center;padding:8px 40px";
      document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.textContent = "";
    var text = document.createElement(a.link ? "a" : "span");
    text.textContent = a.text;
    if (a.link) { text.href = safeUrl(a.link); text.style.cssText = "color:#fff;text-decoration:underline"; }
    bar.appendChild(text);
    var h = bar.offsetHeight;
    if (header) header.style.top = h + "px";
    document.body.style.paddingTop = h + "px";
  }

  function applyAll(content) {
    if (!content) return;
    applySettings(content.settings);
    var edits = Object.assign({}, (content.layout || {}).edits, (content.page || {}).edits);
    Object.keys(edits).forEach(function (key) { applyEdit(key, edits[key]); });
    var title = (content.page || {}).title;
    if (title) document.title = title;
  }

  /* ---------- outline: the page as sections and fields ---------- */

  // An icon (svg) counts as inline and is not looked into.
  function hasOnlyInline(el) {
    return Array.prototype.every.call(el.children, function (c) {
      if (/^svg$/i.test(c.tagName)) return true;
      return /^(B|STRONG|I|EM|U|SPAN|BR|SMALL|SUP|SUB|MARK|A)$/i.test(c.tagName) && hasOnlyInline(c);
    });
  }

  function isText(el) {
    return el.tagName !== "IMG" && el.textContent.trim() !== "" && hasOnlyInline(el);
  }

  function hasOwnWords(el) {
    return Array.prototype.some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim() !== ""; });
  }

  function squash(s) { return String(s || "").replace(/\s+/g, " ").trim(); }

  // The words of a text element, when they sit in a single run of text that
  // can be swapped while any icon or wrapper around it stays. Text split
  // across <b>, <br> and the like is "rich" and is edited on the page.
  function textRun(el) {
    var runs = [];
    walkText(el, function (n) { if (n.nodeValue.trim()) runs.push(n); });
    return runs.length === 1 ? runs[0] : null;
  }

  var LABELS = { H1: "Main heading", H2: "Heading", H3: "Heading", H4: "Sub-heading", H5: "Sub-heading", H6: "Sub-heading",
    P: "Paragraph", A: "Link / button", BUTTON: "Button", LI: "List item", TD: "Table text", TH: "Table heading",
    LABEL: "Label", IMG: "Image" };

  function fieldOf(el) {
    var link = el.closest("a");
    var run = el.tagName === "IMG" ? null : textRun(el);
    return {
      key: keyOf(el),
      tag: el.tagName.toLowerCase(),
      kind: el.tagName === "IMG" ? "image" : "text",
      label: LABELS[el.tagName] || (link ? "Link text" : "Text"),
      text: el.tagName === "IMG" ? "" : squash(run ? run.nodeValue : el.textContent),
      rich: el.tagName !== "IMG" && !run,
      src: el.tagName === "IMG" ? el.getAttribute("src") : null,
      href: link ? link.getAttribute("href") : null,
      hidden: el.hasAttribute("data-cms-hidden"),
    };
  }

  function sectionName(el, i) {
    var scope = el.getAttribute("data-cms-scope");
    if (scope === "header") return "Header & menu";
    if (scope === "footer") return "Footer";
    var h = el.querySelector("h1,h2,h3");
    var text = h && squash(h.textContent);
    if (text) return text.length > 48 ? text.slice(0, 46) + "…" : text;
    if (el.id) return el.id.replace(/[-_]+/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    return "Section " + (i + 1);
  }

  // The page's sections in order: the shared header, each top-level
  // <section>, the shared footer. Each lists the texts and images inside it.
  function outline() {
    var roots = [];
    var header = document.querySelector('[data-cms-scope="header"]');
    if (header) roots.push(header);
    document.querySelectorAll("section").forEach(function (sec) {
      if (!sec.parentElement.closest("section,[data-cms-scope],[data-cms-ui]")) roots.push(sec);
    });
    if (roots.length === (header ? 1 : 0)) {
      kids(document.body).forEach(function (c) { if (!/^(SCRIPT|STYLE|NOSCRIPT|HEADER|FOOTER)$/.test(c.tagName)) roots.push(c); });
    }
    var footer = document.querySelector('[data-cms-scope="footer"]');
    if (footer) roots.push(footer);

    return roots.map(function (root, i) {
      var fields = [];
      (function walk(el) {
        Array.prototype.forEach.call(el.children, function (c) {
          if (c.hasAttribute("data-cms-ui") || /^(SCRIPT|STYLE|TEMPLATE|svg)$/i.test(c.tagName)) return;
          if (c.tagName === "IMG") fields.push(fieldOf(c));
          // Text split only across child elements (a title <b> over a <small>
          // note) is offered piece by piece; text with words of its own around
          // them ("Hello <b>you</b>") stays one field, edited on the page.
          else if (isText(c) && (textRun(c) || hasOwnWords(c))) fields.push(fieldOf(c));
          else walk(c);
        });
      })(root);
      return {
        key: keyOf(root),
        tag: root.tagName.toLowerCase(),
        name: sectionName(root, i),
        shared: root.hasAttribute("data-cms-scope"),
        hidden: root.hasAttribute("data-cms-hidden"),
        fields: fields,
      };
    });
  }

  /* ---------- loading ---------- */

  function load() {
    if (!cfg.url || !cfg.key) return Promise.resolve(null);
    // Quoted: ":" is reserved inside a PostgREST in.() list.
    var ids = ["settings", "layout", "page:" + page].map(function (id) { return encodeURIComponent('"' + id + '"'); }).join(",");
    return fetch(cfg.url + "/rest/v1/website_content?select=id,data&id=in.(" + ids + ")", {
      headers: { apikey: cfg.key, Authorization: "Bearer " + cfg.key },
      cache: "no-store",
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) {
        if (!rows) return null;
        var out = {};
        rows.forEach(function (row) { out[row.id.indexOf("page:") === 0 ? "page" : row.id] = row.data; });
        return out;
      })
      .catch(function () { return null; });
  }

  function run() {
    if (editing) return startEditor();
    // Last visit's content first, so a returning visitor sees no flicker;
    // then the live content, applied only if it changed.
    var cached = null;
    try { cached = localStorage.getItem(CACHE_KEY); } catch (e) { /* storage off */ }
    if (cached) { try { applyAll(JSON.parse(cached)); } catch (e) { cached = null; } }
    load().then(function (content) {
      if (!content) return;
      var json = JSON.stringify(content);
      if (json === cached) return;
      var stored = false;
      try { localStorage.setItem(CACHE_KEY, json); stored = true; } catch (e) { /* storage off */ }
      // Undo a stale overlay with a clean reload -- but only once the new
      // content is stored, or the reload would find the old one and loop.
      if (cached && stored) location.reload();
      else applyAll(content);
    });
  }

  /* ---------- editing (inside the ERP) ---------- */

  function startEditor() {
    var selected = null;
    var style = document.createElement("style");
    style.setAttribute("data-cms-ui", "");
    style.textContent =
      "[data-cms-hover]{outline:2px dashed #2563eb!important;outline-offset:2px;cursor:pointer}" +
      "[data-cms-selected]{outline:2px solid #2563eb!important;outline-offset:2px;background-color:rgba(37,99,235,.06)}" +
      "[data-cms-hidden]{opacity:.35!important;outline:2px dashed #dc2626!important}" +
      "[contenteditable=true]{cursor:text}" +
      "[data-cms-flash]{outline:3px solid #f59e0b!important;outline-offset:3px;transition:outline-color .3s}";
    document.head.appendChild(style);

    function send(msg) { window.parent.postMessage(Object.assign({ source: "cms-page", page: page }, msg), location.origin); }

    function target(el) {
      while (el && el !== document.body && (el instanceof SVGElement || el.hasAttribute("data-cms-ui"))) el = el.parentElement;
      return el && el !== document.body && el !== document.documentElement ? el : null;
    }

    function deselect() {
      if (!selected) return;
      selected.removeAttribute("data-cms-selected");
      if (selected.isContentEditable) selected.contentEditable = "false";
      selected = null;
    }

    document.addEventListener("mouseover", function (e) {
      var el = target(e.target);
      document.querySelectorAll("[data-cms-hover]").forEach(function (n) { n.removeAttribute("data-cms-hover"); });
      if (el && el !== selected) el.setAttribute("data-cms-hover", "");
    }, true);

    document.addEventListener("click", function (e) {
      var el = target(e.target);
      if (selected && el && selected.contains(el) && selected.isContentEditable) return; // placing the caret
      e.preventDefault();
      e.stopPropagation();
      deselect();
      if (!el) return send({ type: "select", key: null });
      var key = keyOf(el);
      if (!key) return;
      selected = el;
      el.removeAttribute("data-cms-hover");
      el.setAttribute("data-cms-selected", "");
      var isImage = el.tagName === "IMG";
      var textual = !isImage && el.textContent.trim() !== "" && hasOnlyInline(el);
      if (textual) { el.contentEditable = "true"; el.focus(); }
      var link = el.closest("a");
      send({
        type: "select",
        key: key,
        tag: el.tagName.toLowerCase(),
        kind: isImage ? "image" : textual ? "text" : "block",
        text: textual ? el.textContent.trim().slice(0, 140) : "",
        src: isImage ? el.getAttribute("src") : null,
        href: link ? link.getAttribute("href") : null,
        hidden: el.hasAttribute("data-cms-hidden"),
      });
    }, true);

    // Typing in a selected element reports the new HTML as it goes.
    document.addEventListener("input", function (e) {
      var el = e.target;
      if (el !== selected) return;
      send({ type: "change", key: keyOf(el), tag: el.tagName.toLowerCase(), patch: { html: el.innerHTML }, text: fieldOf(el).text });
    }, true);

    // Enter would split the heading into two; a line break is what is meant.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && selected && selected.isContentEditable) { e.preventDefault(); document.execCommand("insertLineBreak"); }
      if (e.key === "Escape") deselect();
    }, true);

    window.addEventListener("message", function (e) {
      if (e.origin !== location.origin || !e.data || e.data.source !== "cms-editor") return;
      var m = e.data;
      if (m.type === "apply") applyEdit(m.key, Object.assign({ tag: m.tag }, m.patch));
      if (m.type === "content") applyAll(m.content);
      // A field typed in the ERP's form: swap the words, keep icons and
      // wrappers, and report the resulting HTML as if typed here.
      if (m.type === "setText") {
        var el = find(m.key);
        var run = el && textRun(el);
        if (!run) return;
        var lead = run.nodeValue.match(/^\s*/)[0];
        var trail = run.nodeValue.match(/\s*$/)[0];
        run.nodeValue = lead + m.text + trail;
        send({ type: "change", key: m.key, tag: el.tagName.toLowerCase(), patch: { html: el.innerHTML }, text: m.text });
      }
      if (m.type === "focus") {
        var target = find(m.key);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.setAttribute("data-cms-flash", "");
        setTimeout(function () { target.removeAttribute("data-cms-flash"); }, 1600);
      }
    });

    load().then(function (content) {
      applyAll(content);
      send({ type: "ready", title: document.title, outline: outline() });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();

  // Admission and franchise forms send their applications to the ERP
  // (apply.js) -- not inside the editor, where the page is being edited.
  if (!editing && !document.querySelector('script[src="/apply.js"]')) {
    var applyScript = document.createElement("script");
    applyScript.src = "/apply.js";
    applyScript.defer = true;
    document.head.appendChild(applyScript);
  }

  // Exposed for the tests in the ERP; nothing on the site uses these.
  window.__cms = { keyOf: keyOf, find: find, clean: clean, applyAll: applyAll, outline: outline };
})();
