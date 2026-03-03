import { getAllPosts, getAllTags } from "@/lib/posts";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <main style={{ minHeight: "100vh", paddingTop: "56px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <PageHeader
          title="文章"
          subtitle="围绕工程实践、部署流程和可复用方法的记录"
          path="/blog"
        />

        {tags.length > 0 && (
          <div style={{ marginBottom: "26px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px" }}>主题标签</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "12px",
                    padding: "4px 10px",
                    border: "1px solid rgba(94, 194, 183, 0.3)",
                    borderRadius: "999px",
                    color: "var(--cyan)",
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: "12px" }}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
              <article
                className="list-row-hover"
                style={{
                  padding: "18px 18px",
                  border: "1px solid rgba(94, 194, 183, 0.22)",
                  borderRadius: "8px",
                  background: "var(--bg-secondary)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: 0, fontSize: "19px", color: "var(--text-primary)" }}>{post.title}</h2>
                  <time style={{ color: "var(--text-secondary)", fontSize: "12px", fontFamily: "var(--font-mono, monospace)" }}>
                    {new Date(post.date).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })}
                  </time>
                </div>
                {post.excerpt && (
                  <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "14px" }}>
                    {post.excerpt}
                  </p>
                )}
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)", fontFamily: "var(--font-mono, monospace)", fontSize: "14px" }}>
            还没有文章，在 `content/posts` 目录下添加 MDX 文件即可。
          </div>
        )}
      </div>
    </main>
  );
}
