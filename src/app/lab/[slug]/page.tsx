import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import { MDXContent } from "@/components/MDXContent";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Giscus } from "@/components/Giscus";

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return { title: "文章未找到" };

  return {
    title: `${post.title} — SEQI.MUSEUM`,
    description: post.excerpt,
  };
}

export default async function LabPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <main style={{ background: "#080b0f", minHeight: "100vh", paddingTop: "56px" }}>
      <article style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
        <Link
          href="/lab"
          style={{
            fontSize: "13px",
            color: "#00d4ff",
            fontFamily: "var(--font-mono, monospace)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "32px",
          }}
        >
          ← 返回技术展厅
        </Link>

        <header style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: "#e2e8f0",
              margin: "0 0 16px 0",
              lineHeight: 1.2,
            }}
          >
            {post.title}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "13px",
              color: "#7fa3bf",
              fontFamily: "var(--font-mono, monospace)",
              flexWrap: "wrap",
            }}
          >
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {post.author && <span>· {post.author}</span>}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    border: "1px solid rgba(0, 212, 255, 0.3)",
                    borderRadius: "2px",
                    color: "#00d4ff",
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.coverImage && (
          <div style={{ marginBottom: "40px" }}>
            <img
              src={post.coverImage}
              alt={post.title}
              style={{
                width: "100%",
                borderRadius: "4px",
                border: "1px solid rgba(0, 212, 255, 0.2)",
              }}
            />
          </div>
        )}

        <div className="prose" style={{ maxWidth: "none" }}>
          <MDXContent content={post.content} />
        </div>

        <footer
          style={{
            marginTop: "64px",
            paddingTop: "32px",
            borderTop: "1px solid rgba(0, 212, 255, 0.15)",
          }}
        >
          <Link
            href="/lab"
            style={{
              fontSize: "13px",
              color: "#00d4ff",
              fontFamily: "var(--font-mono, monospace)",
              textDecoration: "none",
            }}
          >
            ← 返回技术展厅
          </Link>
        </footer>

        <div style={{ marginTop: "48px" }}>
          <Giscus />
        </div>
      </article>
    </main>
  );
}
