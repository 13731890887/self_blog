export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-20">
        {/* 返回链接 */}
        <a href="/" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← 返回首页
        </a>

        <h1 className="text-4xl font-bold mb-8">关于我</h1>

        <div className="prose dark:prose-invert">
          <p className="text-lg leading-relaxed mb-6">
            你好！我是 Seqi，一个热爱学习的人。
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">我的兴趣</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>编程与软件开发</li>
            <li>阅读与写作</li>
            <li>个人成长与效率提升</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">这个网站</h2>
          <p className="leading-relaxed">
            这是我用 Next.js 搭建的个人网站，用来记录我的学习笔记和成长感悟。
            希望这里的内容能对你有所帮助。
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">联系方式</h2>
          <p>你可以通过以下方式找到我：</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email: your@email.com</li>
            <li>GitHub: github.com/yourname</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
