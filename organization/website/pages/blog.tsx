import { BlogShell } from "../components/BlogPost";
import { BRAND } from "../components/brand";
import { POSTS, longDate } from "../components/blogPosts";

/** blog.html — every post, newest first; the newest is shown large. */
export default function Blog() {
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <BlogShell
      title={`Blog — Computer Courses, Career Tips & Updates | ${BRAND.name}`}
      description={`Guides on choosing a computer course, typing speed, certificate verification and opening a computer centre, from ${BRAND.name}.`}
      url="blog.html"
      image={posts[0]?.image}
    >
      <section className="bl-hero">
        <h1>Career Optics Blog</h1>
        <p>Guides on choosing the right computer course, building job-ready skills, and opening your own computer centre.</p>
        <div className="bl-crumb">
          <a href="index.html">Home</a> / Blog
        </div>
      </section>
      <div className="bl-wrap">
        <div className="bl-grid">
          {posts.map((p, i) => (
            <a key={p.slug} href={`blog-${p.slug}.html`} className={`bl-card${i === 0 ? " bl-feature" : ""}`}>
              <div className="pic"><img src={p.image} alt={p.imageAlt} loading={i === 0 ? "eager" : "lazy"} /></div>
              <div className="bd">
                <span className="bl-tag">{p.category}</span>
                <h2>{p.title}</h2>
                <p>{p.excerpt}</p>
                <div className="bl-meta"><span>{longDate(p.date)}</span><span>· {p.minutes} min read</span></div>
                <span className="bl-more">Read article →</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </BlogShell>
  );
}
