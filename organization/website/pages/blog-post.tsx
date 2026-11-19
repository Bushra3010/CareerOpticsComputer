import { BlogShell } from "../components/BlogPost";
import { BRAND } from "../components/brand";

/**
 * blog-post.html?p=<slug> — a post written in the ERP (Website -> Blog),
 * filled in the browser by behaviour/blog.js. The built-in articles keep
 * their own pages (blog-<slug>.html).
 */
export default function BlogPostPage() {
  return (
    <BlogShell title={`Blog | ${BRAND.name}`} description={`Articles from ${BRAND.name}.`} url="blog.html">
      <section className="bl-hero">
        <h1>Career Optics Blog</h1>
        <div className="bl-crumb">
          <a href="index.html">Home</a> / <a href="blog.html">Blog</a> / <span id="blCrumbCat">Article</span>
        </div>
      </section>
      <div className="bl-wrap bl-post">
        <div data-blog="post">
          <div className="bl-article"><div className="inner"><p>Loading the article…</p></div></div>
        </div>
        <aside className="bl-side">
          <div className="bl-box bl-help">
            <h3>Admission open 2026–27</h3>
            <p>24 job-oriented courses with QR-verified certificates. Talk to us about the right course for you.</p>
            <a className="w" href="/computercentre/apply">Apply online</a>
            <a className="g" href={`https://wa.me/${BRAND.phoneIntl}`}>WhatsApp {BRAND.phone}</a>
          </div>
          <div className="bl-box">
            <h3>More from the blog</h3>
            <a className="row" href="blog.html"><span><b>See all articles →</b></span></a>
          </div>
        </aside>
      </div>
    </BlogShell>
  );
}
