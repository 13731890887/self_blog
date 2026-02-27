export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-20">
        {/* 头部 */}
        <header className="mb-16">
          <h1 className="text-4xl font-bold mb-4">你好，我是 Seqi 👋</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            记录个人成长，分享学习心得
          </p>
        </header>

        {/* 导航 */}
        <nav className="mb-16">
          <ul className="flex gap-6">
            <li>
              <a href="/" className="text-blue-600 hover:text-blue-800">
                首页
              </a>
            </li>
            <li>
              <a href="/about" className="text-blue-600 hover:text-blue-800">
                关于我
              </a>
            </li>
            <li>
              <a href="/blog" className="text-blue-600 hover:text-blue-800">
                博客
              </a>
            </li>
          </ul>
        </nav>

        {/* 最新文章 */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">最新文章</h2>
          <div className="space-y-4">
            <article className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="text-lg font-medium">
                <a href="/blog/first-post" className="hover:text-blue-600">
                  我的第一篇博客
                </a>
              </h3>
              <p className="text-sm text-gray-500 mt-1">2025年2月27日</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                欢迎来到我的个人网站！这里我会分享我的学习笔记和成长感悟。
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
