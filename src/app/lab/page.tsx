import { getAllPosts, getAllTags } from "@/lib/posts";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default function LabPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <main style={{ background: "#080b0f", minHeight: "100vh", paddingTop: "56px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>
        <PageHeader
          title="技术展厅"
          subtitle="AI、工程实践与技术探索的记录"
          path="/lab"
        />

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                fontSize: "11px",
                color: "#7fa3bf",
                fontFamily: "var(--font-mono, monospace)",
                marginBottom: "12px",
                letterSpacing: "0.1em",
              }}
            >
              TAGS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "12px",
                    padding: "3px 10px",
                    border: "1px solid rgba(0, 212, 255, 0.25)",
                    borderRadius: "2px",
                    color: "#00d4ff",
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Posts list */}
        <div style={{ display: "grid", gap: "2px" }}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/lab/${post.slug}`} style={{ textDecoration: "none" }}>
              <article
                className="post-row-hover"
                style={{
                  padding: "20px 24px",
                  borderLeft: "2px solid rgba(0, 212, 255, 0.15)",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#e2e8f0",
                        margin: "0 0 6px 0",
                      }}
                    >
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p style={{ fontSize: "14px", color: "#7fa3bf", margin: "0 0 8px 0" }}>
                        {post.excerpt}
                      </p>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: "11px",
                              padding: "1px 7px",
                              border: "1px solid rgba(0, 212, 255, 0.2)",
                              borderRadius: "2px",
                              color: "#7fa3bf",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <time
                    dateTime={post.date}
                    style={{
                      fontSize: "12px",
                      color: "#7fa3bf",
                      fontFamily: "var(--font-mono, monospace)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(post.date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </time>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div style={{ padding: "48px", textAlign: "center", color: "#7fa3bf", fontFamily: "var(--font-mono, monospace)", fontSize: "14px" }}>
            {'>'} 还没有文章，在 content/posts 目录下添加 MDX 文件即可
          </div>
        )}
      </div>
    </main>
  );
}
