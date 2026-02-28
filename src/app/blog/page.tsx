import { getAllPosts } from "@/lib/posts";
import { getAllTags } from "@/lib/posts";
import Link from "next/link";

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← 返回首页
        </Link>

        <h1 className="text-4xl font-bold mb-4">博客</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          共 {posts.length} 篇文章
        </p>

        {/* 标签云 */}
        {tags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">标签</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 文章列表 */}
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="border-b border-gray-200 dark:border-gray-800 pb-8">
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-sm text-gray-500 mb-3">
                {new Date(post.date).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {post.excerpt}
              </p>
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2">
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
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              还没有文章，在 content/posts 目录下添加 MDX 文件即可
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
