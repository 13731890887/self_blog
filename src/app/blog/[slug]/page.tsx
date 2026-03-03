import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import { MDXContent } from "@/components/MDXContent";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const summary = {
    background: post.background || post.excerpt || "这篇文章来自实际开发/部署过程中的经验沉淀。",
    problem: post.problem || `核心问题集中在：${post.tags?.slice(0, 2).join("、") || "工程落地与流程稳定性"}。`,
    conclusion: post.conclusion || "可先看结论再按步骤执行，文中包含可直接复用的配置与做法。",
    audience: post.audience || "适合正在搭建个人站点、部署博客或优化开发流程的开发者。",
  };

  return (
    <main style={{ minHeight: "100vh", paddingTop: "56px" }}>
      <article style={{ maxWidth: "840px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link
          href="/blog"
          style={{
            fontSize: "13px",
            color: "var(--cyan)",
            fontFamily: "var(--font-mono, monospace)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "28px",
          }}
        >
          ← 返回文章列表
        </Link>

        <header style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
              fontSize: "clamp(1.9rem, 4.2vw, 2.8rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 10px",
              lineHeight: 1.2,
            }}
          >
            {post.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", color: "var(--text-secondary)", fontSize: "13px" }}>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
            </time>
            {post.author && <span>· {post.author}</span>}
          </div>
        </header>

        <section
          style={{
            marginBottom: "30px",
            background: "var(--bg-secondary)",
            border: "1px solid rgba(94, 194, 183, 0.24)",
            borderRadius: "8px",
            padding: "18px",
            display: "grid",
            gap: "10px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "16px", color: "var(--text-primary)" }}>速读卡片</h2>
          <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}><strong style={{ color: "var(--text-primary)" }}>背景：</strong>{summary.background}</p>
          <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}><strong style={{ color: "var(--text-primary)" }}>问题：</strong>{summary.problem}</p>
          <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}><strong style={{ color: "var(--text-primary)" }}>结论：</strong>{summary.conclusion}</p>
          <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}><strong style={{ color: "var(--text-primary)" }}>适用人群：</strong>{summary.audience}</p>
        </section>

        {post.coverImage && (
          <div style={{ marginBottom: "32px" }}>
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={675}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
                border: "1px solid rgba(94, 194, 183, 0.24)",
              }}
            />
          </div>
        )}

        <div className="prose" style={{ maxWidth: "none" }}>
          <MDXContent content={post.content} />
        </div>

        <footer
          style={{
            marginTop: "52px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(94, 194, 183, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link href="/blog" style={{ fontSize: "13px", color: "var(--cyan)", fontFamily: "var(--font-mono, monospace)", textDecoration: "none" }}>
            ← 返回文章列表
          </Link>
          <Link href="/guestbook" style={{ fontSize: "13px", color: "var(--purple)", fontFamily: "var(--font-mono, monospace)", textDecoration: "none" }}>
            去留言反馈 →
          </Link>
        </footer>

        <div style={{ marginTop: "42px" }}>
          <Giscus />
        </div>
      </article>
    </main>
  );
}
