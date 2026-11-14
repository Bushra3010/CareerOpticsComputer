import type { ReactNode } from "react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import WhatsappWidget from "./WhatsappWidget";
import { BRAND } from "./brand";
import { POSTS, longDate, postBySlug, type Block } from "./blogPosts";
import js_c1268ab4 from "../behaviour/c1268ab4.js?raw";

/**
 * The blog's pages: the shared head and styles, the listing's cards, and one
 * post rendered from its blocks in blogPosts.ts.
 */

const SITE = "https://www.careeropticscomputer.in";

export const BLOG_CSS = `
*{box-sizing:border-box}
body{margin:0;font-family:Poppins,system-ui,sans-serif;color:#0f172a;background:#f4f7fc}
.bl-hero{background:linear-gradient(120deg,#0b2350,#1d4ed8);color:#fff;padding:56px 16px;text-align:center;position:relative;overflow:hidden}
.bl-hero::after{content:"";position:absolute;right:-120px;top:-120px;width:360px;height:360px;border-radius:50%;background:rgba(249,115,22,.16)}
.bl-hero h1{margin:0;font-size:clamp(28px,4vw,44px);font-weight:800;position:relative}
.bl-hero p{margin:12px auto 0;max-width:720px;color:#d6e0fa;line-height:1.7;position:relative}
.bl-crumb{margin-top:14px;font-size:14px;color:#fdba74;position:relative}.bl-crumb a{color:#fff;text-decoration:none}
.bl-wrap{max-width:1180px;margin:0 auto;padding:52px 16px}
.bl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.bl-card{display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;text-decoration:none;color:inherit;box-shadow:0 10px 26px rgba(11,35,80,.08);transition:transform .2s,box-shadow .2s}
.bl-card:hover{transform:translateY(-4px);box-shadow:0 18px 36px rgba(11,35,80,.14)}
.bl-card .pic{aspect-ratio:16/10;background:#e7ecf5;overflow:hidden}
.bl-card .pic img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s}
.bl-card:hover .pic img{transform:scale(1.04)}
.bl-card .bd{padding:18px 20px 20px;display:flex;flex-direction:column;flex:1}
.bl-tag{display:inline-block;align-self:flex-start;font:700 11px Poppins,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#f97316;background:#fff4e8;border-radius:99px;padding:5px 10px}
.bl-card h2{margin:10px 0 0;font-size:18px;line-height:1.35;font-weight:700;color:#0b2350}
.bl-card p{margin:8px 0 0;color:#5b6b88;font-size:14px;line-height:1.65;flex:1}
.bl-meta{margin-top:14px;font-size:12.5px;color:#64748b;display:flex;gap:12px;flex-wrap:wrap}
.bl-more{margin-top:12px;font-weight:700;font-size:13.5px;color:#1d4ed8}
.bl-feature{grid-column:1/-1;display:grid;grid-template-columns:1.15fr 1fr}
.bl-feature .pic{aspect-ratio:auto;min-height:300px}
.bl-feature h2{font-size:26px}
.bl-post{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:32px;align-items:start}
.bl-article{background:#fff;border-radius:16px;box-shadow:0 10px 26px rgba(11,35,80,.07);overflow:hidden}
.bl-article .cover{aspect-ratio:16/8;background:#e7ecf5}
.bl-article .cover img{width:100%;height:100%;object-fit:cover;display:block}
.bl-article .inner{padding:32px 36px 36px}
.bl-article h1{margin:12px 0 0;font-size:clamp(24px,3vw,34px);line-height:1.25;font-weight:800;color:#0b2350}
.bl-body{margin-top:22px;font-size:16px;line-height:1.85;color:#1f2937}
.bl-body p{margin:0 0 16px}
.bl-body h2{margin:30px 0 10px;font-size:22px;color:#0b2350;font-weight:800;padding-left:14px;border-left:4px solid #f97316}
.bl-body h3{margin:22px 0 8px;font-size:18px;color:#0b2350}
.bl-body ul,.bl-body ol{margin:0 0 18px;padding-left:22px}
.bl-body li{margin:6px 0}
.bl-body li::marker{color:#f97316;font-weight:700}
.bl-body table{width:100%;border-collapse:collapse;margin:6px 0 20px;font-size:14.5px}
.bl-body th{background:#14266b;color:#fff;text-align:left;padding:10px 12px;font-weight:600}
.bl-body td{padding:10px 12px;border-bottom:1px solid #e5eaf3;vertical-align:top}
.bl-body tr:nth-child(even) td{background:#f6f8fc}
.bl-scroll{overflow-x:auto}
.bl-tip{margin:6px 0 20px;background:#fff7ed;border:1px solid #fed7aa;border-left:5px solid #f97316;border-radius:12px;padding:14px 18px}
.bl-tip b{display:block;color:#9a3412;margin-bottom:4px}
.bl-tip span{color:#7c2d12;font-size:15px}
.bl-cta{margin:26px 0 4px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;background:linear-gradient(120deg,#0b2350,#1d4ed8);color:#fff;border-radius:14px;padding:18px 22px}
.bl-cta span{font-weight:600}
.bl-cta a{background:#f97316;color:#fff;text-decoration:none;font-weight:700;border-radius:10px;padding:11px 18px;white-space:nowrap}
.bl-side{position:sticky;top:110px;display:flex;flex-direction:column;gap:20px}
.bl-box{background:#fff;border-radius:16px;box-shadow:0 10px 26px rgba(11,35,80,.07);padding:20px}
.bl-box h3{margin:0 0 12px;font-size:16px;color:#0b2350}
.bl-box a.row{display:flex;gap:12px;text-decoration:none;color:inherit;padding:10px 0;border-top:1px solid #eef2f8}
.bl-box a.row:first-of-type{border-top:0}
.bl-box a.row img{width:72px;height:54px;object-fit:cover;border-radius:8px;flex:none}
.bl-box a.row b{font-size:13.5px;line-height:1.4;color:#0b2350}
.bl-box a.row small{display:block;color:#64748b;font-size:12px;margin-top:3px}
.bl-help{background:linear-gradient(150deg,#f97316,#ea580c);color:#fff}
.bl-help h3{color:#fff}
.bl-help p{margin:0 0 14px;font-size:14px;line-height:1.6;color:#fff7ed}
.bl-help a{display:block;text-align:center;text-decoration:none;font-weight:700;border-radius:10px;padding:11px;margin-top:8px}
.bl-help a.w{background:#fff;color:#c2410c}
.bl-help a.g{background:#16a34a;color:#fff}
@media (max-width:980px){.bl-grid{grid-template-columns:repeat(2,1fr)}.bl-feature{grid-template-columns:1fr}.bl-post{grid-template-columns:1fr}.bl-side{position:static}}
@media (max-width:640px){.bl-grid{grid-template-columns:1fr}.bl-article .inner{padding:22px 18px 26px}.bl-body{font-size:15.5px}}
`;

export function BlogShell({ title, description, url, image, jsonLd, children }: { title: string; description: string; url: string; image?: string; jsonLd?: object; children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="/cms-config.js"></script>
        <script src="/cms.js" defer></script>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE}/${url}`} />
        <meta property="og:type" content={jsonLd ? "article" : "website"} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE}/${url}`} />
        {image ? <meta property="og:image" content={`${SITE}${image}`} /> : null}
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={"https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"} rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        <style dangerouslySetInnerHTML={{ __html: BLOG_CSS }} />
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <WhatsappWidget />
        <script dangerouslySetInnerHTML={{ __html: js_c1268ab4 }} />
        <script dangerouslySetInnerHTML={{ __html: 'document.addEventListener("DOMContentLoaded",function(){if(window.lucide)lucide.createIcons()});' }} />
      </body>
    </html>
  );
}

function render(block: Block, k: number) {
  switch (block.type) {
    case "p":
      return <p key={k}>{block.text}</p>;
    case "h2":
      return <h2 key={k}>{block.text}</h2>;
    case "h3":
      return <h3 key={k}>{block.text}</h3>;
    case "ul":
      return <ul key={k}>{block.items.map((t) => <li key={t}>{t}</li>)}</ul>;
    case "ol":
      return <ol key={k}>{block.items.map((t) => <li key={t}>{t}</li>)}</ol>;
    case "tip":
      return (
        <div key={k} className="bl-tip">
          <b>{block.title}</b>
          <span>{block.text}</span>
        </div>
      );
    case "table":
      return (
        <div key={k} className="bl-scroll">
          <table>
            <thead><tr>{block.head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>{block.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    case "cta":
      return (
        <div key={k} className="bl-cta">
          <span>{block.text}</span>
          <a href={block.href}>{block.label} →</a>
        </div>
      );
  }
}

export default function BlogPost({ slug }: { slug: string }) {
  const post = postBySlug(slug);
  if (!post) return null;
  const others = POSTS.filter((p) => p.slug !== slug);
  const url = `blog-${post.slug}.html`;
  return (
    <BlogShell
      title={`${post.title} | ${BRAND.name}`}
      description={post.excerpt}
      url={url}
      image={post.image}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        image: `${SITE}${post.image}`,
        datePublished: post.date,
        author: { "@type": "Organization", name: BRAND.name },
        publisher: { "@type": "Organization", name: BRAND.company, logo: { "@type": "ImageObject", url: `${SITE}/logo.png` } },
        mainEntityOfPage: `${SITE}/${url}`,
      }}
    >
      <section className="bl-hero">
        <h1>Career Optics Blog</h1>
        <div className="bl-crumb">
          <a href="index.html">Home</a> / <a href="blog.html">Blog</a> / {post.category}
        </div>
      </section>

      <div className="bl-wrap bl-post">
        <article className="bl-article">
          <div className="cover"><img src={post.image} alt={post.imageAlt} /></div>
          <div className="inner">
            <span className="bl-tag">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="bl-meta">
              <span>{longDate(post.date)}</span>
              <span>· {post.minutes} min read</span>
              <span>· By the Career Optics Team</span>
            </div>
            <div className="bl-body">{post.body.map(render)}</div>
          </div>
        </article>

        <aside className="bl-side">
          <div className="bl-box bl-help">
            <h3>Admission open 2026–27</h3>
            <p>24 job-oriented courses with QR-verified certificates. Talk to us about the right course for you.</p>
            <a className="w" href="/computercentre/apply">Apply online</a>
            <a className="g" href={`https://wa.me/${BRAND.phoneIntl}`}>WhatsApp {BRAND.phone}</a>
          </div>
          <div className="bl-box">
            <h3>More from the blog</h3>
            {others.map((p) => (
              <a key={p.slug} className="row" href={`blog-${p.slug}.html`}>
                <img src={p.image} alt="" loading="lazy" />
                <span><b>{p.title}</b><small>{longDate(p.date)}</small></span>
              </a>
            ))}
          </div>
        </aside>
      </div>
    </BlogShell>
  );
}
