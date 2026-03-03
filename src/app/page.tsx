import { getAllPosts } from "@/lib/posts";
import { getAllBooks } from "@/lib/books";
import Link from "next/link";

const featuredSlugs = ["cloudflare-pages-deploy", "first-post"];

export default function Home() {
  const allPosts = getAllPosts();
  const allBooks = getAllBooks();
  const featuredPosts = featuredSlugs
    .map((slug) => allPosts.find((post) => post.slug === slug))
    .filter((post): post is NonNullable<typeof post> => Boolean(post));
  const fallbackPosts = allPosts.filter((post) => !featuredSlugs.includes(post.slug)).slice(0, 3);
  const showcasePosts = (featuredPosts.length > 0 ? featuredPosts : fallbackPosts).slice(0, 3);
  const recentBooks = allBooks.slice(0, 2);

  return (
    <main style={{ minHeight: "100vh", paddingTop: "56px" }}>
      <section style={{ maxWidth: "1040px", margin: "0 auto", padding: "72px 24px 48px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            letterSpacing: "0.08em",
            fontFamily: "var(--font-mono, monospace)",
            color: "var(--cyan)",
          }}
        >
          SEQI.MUSEUM / Personal Site
        </p>
        <h1
          style={{
            margin: "14px 0 12px",
            fontSize: "clamp(2.1rem, 7vw, 4rem)",
            lineHeight: 1.08,
            fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
            color: "var(--text-primary)",
          }}
        >
          记录技术实践，沉淀可复用的方法。
        </h1>
        <p style={{ maxWidth: "680px", margin: 0, fontSize: "18px", lineHeight: 1.75, color: "var(--text-secondary)" }}>
          我是 Seqi，这里主要分享工程实践、部署经验和阅读笔记。内容会尽量写到可以直接照着做，而不是只谈概念。
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "26px" }}>
          <Link
            href="/blog"
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid rgba(94, 194, 183, 0.35)",
              background: "rgba(94, 194, 183, 0.1)",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "13px",
            }}
          >
            查看全部文章
          </Link>
          <Link
            href="/about"
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid rgba(200, 169, 107, 0.35)",
              background: "rgba(200, 169, 107, 0.1)",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "13px",
            }}
          >
            了解我在做什么
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: "1040px", margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: "24px", color: "var(--text-primary)" }}>代表文章</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>新访客建议先从这里开始</p>
        </div>
        <div style={{ display: "grid", gap: "12px" }}>
          {showcasePosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <article
                className="list-row-hover"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid rgba(94, 194, 183, 0.22)",
                  borderRadius: "8px",
                  padding: "18px 20px",
                }}
              >
                <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--text-primary)" }}>{post.title}</h3>
                <p style={{ margin: "0 0 8px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {post.excerpt || "可直接复用的实践记录与步骤总结。"}
                </p>
                <div style={{ fontSize: "12px", color: "var(--cyan)", fontFamily: "var(--font-mono, monospace)" }}>
                  {new Date(post.date).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })} / WHY READ: 有结论、有步骤
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "1040px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "24px", color: "var(--text-primary)" }}>你可以从这里继续</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
          <Link href="/reading" style={{ textDecoration: "none" }}>
            <div className="card-hover-cyan" style={{ background: "var(--bg-secondary)", border: "1px solid rgba(94, 194, 183, 0.22)", borderRadius: "8px", padding: "18px" }}>
              <div style={{ fontSize: "16px", color: "var(--text-primary)", marginBottom: "6px" }}>阅读笔记</div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                看我最近在读什么，以及每本书最值得记住的一句话。
              </p>
            </div>
          </Link>
          <Link href="/guestbook" style={{ textDecoration: "none" }}>
            <div className="card-hover-cyan" style={{ background: "var(--bg-secondary)", border: "1px solid rgba(94, 194, 183, 0.22)", borderRadius: "8px", padding: "18px" }}>
              <div style={{ fontSize: "16px", color: "var(--text-primary)", marginBottom: "6px" }}>留言与反馈</div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                如果某篇文章对你有帮助，或你想看某个主题，可以直接告诉我。
              </p>
            </div>
          </Link>
          <Link href="/about" style={{ textDecoration: "none" }}>
            <div className="card-hover-purple" style={{ background: "var(--bg-secondary)", border: "1px solid rgba(200, 169, 107, 0.24)", borderRadius: "8px", padding: "18px" }}>
              <div style={{ fontSize: "16px", color: "var(--text-primary)", marginBottom: "6px" }}>关于我</div>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                当前关注方向、合作偏好和可联系渠道。
              </p>
            </div>
          </Link>
        </div>

        {recentBooks.length > 0 && (
          <div style={{ marginTop: "32px", padding: "18px 20px", borderRadius: "8px", border: "1px solid rgba(200, 169, 107, 0.24)", background: "rgba(200, 169, 107, 0.06)" }}>
            <div style={{ marginBottom: "10px", fontSize: "13px", fontFamily: "var(--font-mono, monospace)", color: "var(--purple)" }}>
              RECENT READING SNAPSHOT
            </div>
            <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
              {recentBooks.map((book) => (
                <li key={book.slug}>
                  <Link href={`/reading/${book.slug}`} style={{ color: "var(--text-primary)", textDecoration: "none" }}>
                    {book.title}
                  </Link>
                  <span style={{ color: "var(--text-secondary)" }}> - {book.excerpt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
