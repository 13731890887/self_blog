import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import { MDXContent } from "@/components/MDXContent";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Giscus } from "@/components/Giscus";

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章未找到",
    };
  }

  return {
    title: `${post.title} - Seqi的博客`,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <article className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← 返回博客列表
        </Link>

        {/* 文章头部 */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
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
            <div className="flex gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 封面图 */}
        {post.coverImage && (
          <div className="mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* 文章内容 */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <MDXContent content={post.content} />
        </div>

        {/* 文章底部 */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← 返回博客列表
          </Link>
        </footer>

        {/* 评论区 */}
        <div className="mt-12">
          <Giscus />
        </div>
      </article>
    </main>
  );
}
