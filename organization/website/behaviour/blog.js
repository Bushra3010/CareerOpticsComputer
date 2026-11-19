/*
 * The blog posts written in the ERP (Website -> Blog), read from the
 * `blog_posts` table with the public anon key (window.CMS_CONFIG, from
 * /cms-config.js). RLS hands the anon key published posts only.
 *
 *   <div data-blog="list">   blog.html: cards for the ERP's posts, before
 *                            the built-in articles already on the page
 *   <div data-blog="post">   blog-post.html?p=<slug>: one post in full
 *
 * Everything is written with textContent, never as HTML, and a picture only
 * from a plain web address. parseBody is a copy of parseBlogBody in
 * src/lib/supabase/blog.ts; change both.
 */
(function () {
  "use strict";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    n.setAttribute("data-cms-ui", "");
    return n;
  }

  function safe(url) {
    return /^https?:\/\//i.test(url || "") ? url : "";
  }

  function longDate(iso) {
    if (!iso) return "";
    return new Date(String(iso).slice(0, 10) + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function minutes(body) {
    return Math.max(1, Math.round(String(body || "").split(/\s+/).filter(Boolean).length / 200));
  }

  function parseBody(body) {
    var blocks = [], para = [];
    function flush() {
      if (para.length) blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
    String(body || "").replace(/\r\n?/g, "\n").split("\n").forEach(function (raw) {
      var line = raw.trim(), last = blocks[blocks.length - 1];
      if (!line) return flush();
      if (/^#{2,3}\s+/.test(line)) {
        flush();
        blocks.push({ type: "h2", text: line.replace(/^#{2,3}\s+/, "") });
      } else if (/^[-*•]\s+/.test(line)) {
        flush();
        var u = line.replace(/^[-*•]\s+/, "");
        if (last && last.type === "ul") last.items.push(u);
        else blocks.push({ type: "ul", items: [u] });
      } else if (/^\d+[.)]\s+/.test(line)) {
        flush();
        var o = line.replace(/^\d+[.)]\s+/, "");
        if (last && last.type === "ol") last.items.push(o);
        else blocks.push({ type: "ol", items: [o] });
      } else {
        para.push(line);
      }
    });
    flush();
    return blocks;
  }

  function fetchPosts(query) {
    var cfg = window.CMS_CONFIG || {};
    if (!cfg.url || !cfg.key) return Promise.resolve([]);
    var url = cfg.url + "/rest/v1/blog_posts?select=slug,title,excerpt,category,coverUrl,body,publishedOn&isPublished=eq.true" + query;
    return fetch(url, { headers: { apikey: cfg.key, Authorization: "Bearer " + cfg.key } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; });
  }

  function link(slug) {
    return "blog-post.html?p=" + encodeURIComponent(slug);
  }

  /* ---------- blog.html ---------- */

  function card(p) {
    var a = el("a", "bl-card");
    a.href = link(p.slug);
    var pic = el("div", "pic");
    var src = safe(p.coverUrl);
    if (src) {
      var img = el("img");
      img.src = src;
      img.alt = p.title;
      img.loading = "lazy";
      pic.appendChild(img);
    }
    a.appendChild(pic);
    var bd = el("div", "bd");
    if (p.category) bd.appendChild(el("span", "bl-tag", p.category));
    bd.appendChild(el("h2", "", p.title));
    bd.appendChild(el("p", "", p.excerpt || ""));
    var meta = el("div", "bl-meta");
    meta.appendChild(el("span", "", longDate(p.publishedOn)));
    meta.appendChild(el("span", "", "· " + minutes(p.body) + " min read"));
    bd.appendChild(meta);
    bd.appendChild(el("span", "bl-more", "Read article →"));
    a.appendChild(bd);
    return a;
  }

  function fillList(box) {
    fetchPosts("&order=publishedOn.desc,createdAt.desc").then(function (posts) {
      var grid = box.parentNode.querySelector(".bl-grid");
      if (!posts.length || !grid) return;
      // The newest post of all leads the page, large.
      var old = grid.querySelector(".bl-feature");
      if (old) old.classList.remove("bl-feature");
      var first = grid.firstChild;
      posts.forEach(function (p, i) {
        var c = card(p);
        if (i === 0) c.classList.add("bl-feature");
        grid.insertBefore(c, first);
      });
    });
  }

  /* ---------- blog-post.html ---------- */

  function fillPost(box) {
    var slug = new URLSearchParams(location.search).get("p") || "";
    var missing = function () {
      box.textContent = "";
      var m = el("div", "bl-article");
      var inner = el("div", "inner");
      inner.appendChild(el("h1", "", "Post not found"));
      var p = el("p", "", "This article may have been moved. ");
      var a = el("a", "", "See all articles →");
      a.href = "blog.html";
      p.appendChild(a);
      inner.appendChild(p);
      m.appendChild(inner);
      box.appendChild(m);
    };
    if (!/^[a-z0-9-]+$/.test(slug)) return missing();
    fetchPosts("&slug=eq." + slug + "&limit=1").then(function (rows) {
      var p = rows && rows[0];
      if (!p) return missing();
      document.title = p.title + " | Career Optics Computer Academy";
      var desc = document.querySelector('meta[name="description"]');
      if (desc && p.excerpt) desc.setAttribute("content", p.excerpt);

      var crumb = document.getElementById("blCrumbCat");
      if (crumb) crumb.textContent = p.category || "Article";

      box.textContent = "";
      var art = el("article", "bl-article");
      var src = safe(p.coverUrl);
      if (src) {
        var cover = el("div", "cover");
        var img = el("img");
        img.src = src;
        img.alt = p.title;
        cover.appendChild(img);
        art.appendChild(cover);
      }
      var inner = el("div", "inner");
      if (p.category) inner.appendChild(el("span", "bl-tag", p.category));
      inner.appendChild(el("h1", "", p.title));
      var meta = el("div", "bl-meta");
      meta.appendChild(el("span", "", longDate(p.publishedOn)));
      meta.appendChild(el("span", "", "· " + minutes(p.body) + " min read"));
      meta.appendChild(el("span", "", "· By the Career Optics Team"));
      inner.appendChild(meta);
      var body = el("div", "bl-body");
      parseBody(p.body).forEach(function (b) {
        if (b.type === "p" || b.type === "h2") return body.appendChild(el(b.type, "", b.text));
        var list = el(b.type);
        b.items.forEach(function (t) { list.appendChild(el("li", "", t)); });
        body.appendChild(list);
      });
      inner.appendChild(body);
      art.appendChild(inner);
      box.appendChild(art);
    });
  }

  function start() {
    var list = document.querySelector('[data-blog="list"]');
    if (list) fillList(list);
    var post = document.querySelector('[data-blog="post"]');
    if (post) fillPost(post);
  }

  // For the ERP's tests; nothing on the page uses it.
  window.__blog = { parseBody: parseBody };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
