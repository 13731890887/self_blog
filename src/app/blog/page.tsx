// 博客文章列表（后续可以用文件系统或数据库替代）
const posts = [
  {
    slug: "first-post",
    title: "我的第一篇博客",
    date: "2025年2月27日",
    excerpt: "欢迎来到我的个人网站！这里我会分享我的学习笔记和成长感悟。"
  },
  {
    slug: "learning-react",
    title: "React 学习笔记",
    date: "2025年2月26日",
    excerpt: "最近开始学习 React，记录一下学习过程中的心得体会。"
  }
];

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-20">
        <a href="/" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← 返回首页
        </a>

        <h1 className="text-4xl font-bold mb-8">博客</h1>

        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.slug} className="border-b pb-8">
              <h2 className="text-2xl font-semibold mb-2">
                <a href={`/blog/${post.slug}`} className="hover:text-blue-600">
                  {post.title}
                </a>
              </h2>
              <p className="text-sm text-gray-500 mb-3">{post.date}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
