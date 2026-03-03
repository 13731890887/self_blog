import { getBookBySlug, getAllBookSlugs } from "@/lib/books";
import { MDXContent } from "@/components/MDXContent";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  const slugs = getAllBookSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) return { title: "书目未找到" };

  return {
    title: `${book.title} — SEQI.MUSEUM`,
    description: book.excerpt,
  };
}

export default async function ReadingPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) notFound();

  return (
    <main style={{ minHeight: "100vh", paddingTop: "56px" }}>
      <article style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
        <Link
          href="/reading"
          style={{
            fontSize: "13px",
            color: "var(--purple)",
            fontFamily: "var(--font-mono, monospace)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "32px",
          }}
        >
          ← 返回书目陈列室
        </Link>

        <header style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 8px 0",
              lineHeight: 1.2,
            }}
          >
            {book.title}
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary)",
              margin: "0 0 16px 0",
            }}
          >
            {book.author}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "2px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    color: star <= book.rating ? "var(--purple)" : "var(--text-secondary)",
                    fontSize: "16px",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <time
              style={{
                fontSize: "13px",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              {book.readDate}
            </time>
          </div>
          {book.tags && book.tags.length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {book.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    border: "1px solid rgba(200, 169, 107, 0.3)",
                    borderRadius: "2px",
                    color: "var(--purple)",
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              borderLeft: "3px solid var(--purple)",
              background: "rgba(200, 169, 107, 0.09)",
              borderRadius: "0 4px 4px 0",
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontStyle: "italic", margin: 0, lineHeight: 1.7 }}>
              {book.excerpt}
            </p>
          </div>
        </header>

        <div className="prose" style={{ maxWidth: "none" }}>
          <MDXContent content={book.content} />
        </div>

        <footer
          style={{
            marginTop: "64px",
            paddingTop: "32px",
            borderTop: "1px solid rgba(200, 169, 107, 0.2)",
          }}
        >
          <Link
            href="/reading"
            style={{
              fontSize: "13px",
              color: "var(--purple)",
              fontFamily: "var(--font-mono, monospace)",
              textDecoration: "none",
            }}
          >
            ← 返回书目陈列室
          </Link>
        </footer>
      </article>
    </main>
  );
}
