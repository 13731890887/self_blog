import { getAllPosts } from "@/lib/posts";
import { getAllBooks } from "@/lib/books";
import Link from "next/link";

const exhibits = [
  {
    href: "/lab",
    icon: "⚗️",
    title: "技术展厅",
    subtitle: "Lab",
    desc: "AI、工程实践与技术探索",
    color: "#00d4ff",
  },
  {
    href: "/reading",
    icon: "📚",
    title: "书目陈列室",
    subtitle: "Reading",
    desc: "阅读笔记与思想碰撞",
    color: "#bf5af2",
  },
  {
    href: "/achievements",
    icon: "🏆",
    title: "荣誉殿堂",
    subtitle: "Achievements",
    desc: "GitHub 数据与项目成就",
    color: "#00d4ff",
  },
  {
    href: "/guestbook",
    icon: "💬",
    title: "留言墙",
    subtitle: "Guestbook",
    desc: "留下你来过的足迹",
    color: "#bf5af2",
  },
  {
    href: "/about",
    icon: "👤",
    title: "关于我",
    subtitle: "About",
    desc: "这个博物馆背后的人",
    color: "#00d4ff",
  },
];

export default function Home() {
  const posts = getAllPosts().slice(0, 3);
  const books = getAllBooks().slice(0, 2);

  return (
    <main style={{ background: "#080b0f", minHeight: "100vh", paddingTop: "56px" }}>
      {/* Hero Section */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 24px 60px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
            fontSize: "13px",
            color: "#00d4ff",
            marginBottom: "16px",
            letterSpacing: "0.1em",
          }}
        >
          {'>'} 欢迎来到
        </div>
        <h1
          style={{
            fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            margin: "0 0 20px 0",
            color: "#e2e8f0",
          }}
        >
          SEQI
          <span style={{ color: "#00d4ff" }}>.MUSEUM</span>
        </h1>
        <p
          style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "#7fa3bf",
            margin: "0 0 16px 0",
            maxWidth: "480px",
          }}
        >
          个人博物馆 — 技术、阅读、成就的数字展厅
        </p>
        <div
          style={{
            height: "1px",
            background: "linear-gradient(to right, rgba(0, 212, 255, 0.4), rgba(0, 212, 255, 0.05), transparent)",
            marginTop: "40px",
          }}
        />
      </section>

      {/* Exhibit Grid */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
            fontSize: "12px",
            color: "#7fa3bf",
            marginBottom: "24px",
            letterSpacing: "0.1em",
          }}
        >
          EXHIBITS
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {exhibits.map((exhibit) => (
            <Link
              key={exhibit.href}
              href={exhibit.href}
              style={{ textDecoration: "none" }}
            >
              <div
                className={exhibit.color === "#00d4ff" ? "card-hover-cyan" : "card-hover-purple"}
                style={{
                  background: "#0d1117",
                  border: "1px solid rgba(0, 212, 255, 0.15)",
                  borderRadius: "4px",
                  padding: "24px",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{exhibit.icon}</div>
                <div
                  style={{
                    fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#e2e8f0",
                    marginBottom: "4px",
                  }}
                >
                  {exhibit.title}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: exhibit.color,
                    fontFamily: "var(--font-mono, monospace)",
                    marginBottom: "8px",
                    letterSpacing: "0.05em",
                  }}
                >
                  /{exhibit.subtitle}
                </div>
                <div style={{ fontSize: "13px", color: "#7fa3bf", lineHeight: 1.5 }}>
                  {exhibit.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 80px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
                fontSize: "12px",
                color: "#7fa3bf",
                letterSpacing: "0.1em",
              }}
            >
              LATEST POSTS
            </div>
            <Link
              href="/lab"
              style={{
                fontSize: "12px",
                color: "#00d4ff",
                fontFamily: "var(--font-mono, monospace)",
                textDecoration: "none",
              }}
            >
              查看全部 →
            </Link>
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {posts.map((post) => (
              <Link key={post.slug} href={`/lab/${post.slug}`} style={{ textDecoration: "none" }}>
                <div
                  className="list-row-hover"
                  style={{
                    background: "#0d1117",
                    border: "1px solid rgba(0, 212, 255, 0.15)",
                    borderRadius: "4px",
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#e2e8f0",
                        marginBottom: "4px",
                      }}
                    >
                      {post.title}
                    </div>
                    {post.excerpt && (
                      <div style={{ fontSize: "13px", color: "#7fa3bf" }}>{post.excerpt}</div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#7fa3bf",
                      whiteSpace: "nowrap",
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  >
                    {new Date(post.date).toLocaleDateString("zh-CN", {
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Books */}
      {books.length > 0 && (
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 80px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
                fontSize: "12px",
                color: "#7fa3bf",
                letterSpacing: "0.1em",
              }}
            >
              RECENT READING
            </div>
            <Link
              href="/reading"
              style={{
                fontSize: "12px",
                color: "#bf5af2",
                fontFamily: "var(--font-mono, monospace)",
                textDecoration: "none",
              }}
            >
              查看全部 →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {books.map((book) => (
              <Link key={book.slug} href={`/reading/${book.slug}`} style={{ textDecoration: "none" }}>
                <div
                  className="book-row-hover"
                  style={{
                    background: "#0d1117",
                    border: "1px solid rgba(191, 90, 242, 0.2)",
                    borderRadius: "4px",
                    padding: "20px",
                  }}
                >
                  <div style={{ fontSize: "16px", fontWeight: 500, color: "#e2e8f0", marginBottom: "4px" }}>
                    {book.title}
                  </div>
                  <div style={{ fontSize: "13px", color: "#7fa3bf", marginBottom: "8px" }}>
                    {book.author}
                  </div>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "8px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} style={{ color: star <= book.rating ? "#bf5af2" : "#7fa3bf", fontSize: "12px" }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: "13px", color: "#7fa3bf", lineHeight: 1.5, margin: 0 }}>
                    {book.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(0, 212, 255, 0.1)",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            color: "#7fa3bf",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          © 2025 SEQI.MUSEUM — Built with Next.js
        </p>
      </footer>
    </main>
  );
}
