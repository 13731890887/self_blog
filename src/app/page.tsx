import { getAllPosts } from "@/lib/posts";
import Link from "next/link";

export default function Home() {
  const posts = getAllPosts().slice(0, 3); // 只显示最新 3 篇

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-20">
        {/* 头部 */}
        <header className="mb-16">
          <h1 className="text-4xl font-bold mb-4">
            你好，我是 Seqi 👋
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            记录个人成长，分享学习心得
          </p>
        </header>

        {/* 导航 */}
        <nav className="mb-16">
          <ul className="flex gap-6">
            <li>
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                首页
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-blue-600 hover:text-blue-800">
                关于我
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-blue-600 hover:text-blue-800">
                博客
              </Link>
            </li>
          </ul>
        </nav>

        {/* 最新文章 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">最新文章</h2>
            <Link
              href="/blog"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-lg font-medium hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(post.date).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {post.excerpt}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 rounded"
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
            <p className="text-gray-500 dark:text-gray-400">
              还没有文章，敬请期待！
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
