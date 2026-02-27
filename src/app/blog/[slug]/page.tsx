// 博客文章内容（后续可以从 Markdown 文件读取）
const posts: Record<string, {
  title: string;
  date: string;
  content: string;
}> = {
  "first-post": {
    title: "我的第一篇博客",
    date: "2025年2月27日",
    content: `
欢迎来到我的个人网站！

这是我的第一篇博客文章。在这个网站上，我会分享：

- 我的编程学习笔记
- 阅读心得与思考
- 个人成长感悟
- 项目经验总结

### 关于这个网站

这个网站使用 Next.js 搭建，部署在 Vercel 上。如果你也想创建自己的个人网站，可以参考我的搭建过程。

### 持续更新

我会定期更新内容，欢迎常来看看！
    `
  },
  "learning-react": {
    title: "React 学习笔记",
    date: "2025年2月26日",
    content: `
开始学习 React 了！

### 为什么选择 React

- 组件化开发，代码复用率高
- 生态系统完善
- 就业市场需求大

### 学习计划

1. 掌握 React 基础概念
2. 学习 Hooks
3. 了解状态管理
4. 实战项目练习

### 心得

React 的声明式编程方式让我耳目一新...
    `
  }
};

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="text-2xl font-bold">文章未找到</h1>
        <a href="/blog" className="text-blue-600 hover:text-blue-800">
          ← 返回博客列表
        </a>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <article className="max-w-2xl mx-auto px-6 py-20">
        <a href="/blog" className="text-blue-600 hover:text-blue-800 mb-8 inline-block">
          ← 返回博客列表
        </a>

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-500 mb-8">{post.date}</p>

        <div className="prose dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans leading-relaxed">
            {post.content}
          </pre>
        </div>
      </article>
    </main>
  );
}

// 生成静态路由（用于构建时生成所有文章页面）
export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}
