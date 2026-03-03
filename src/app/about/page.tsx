import { PageHeader } from "@/components/PageHeader";

const focusAreas = [
  "Next.js 静态站点与部署流程",
  "AI 辅助开发工作流",
  "文档化与知识沉淀",
];

const nowDoing = [
  "持续优化博客信息架构，让内容更易读、更有决策价值",
  "围绕 Cloudflare Pages + 后端服务沉淀可复用模板",
  "把阅读笔记从“书摘”升级为“可执行清单”",
];

export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", paddingTop: "56px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <PageHeader
          title="关于我"
          subtitle="一个关注工程落地与长期积累的开发者"
          path="/about"
        />

        <section style={{ display: "grid", gap: "14px", marginBottom: "28px" }}>
          <div style={{ background: "var(--bg-secondary)", border: "1px solid rgba(94, 194, 183, 0.22)", borderRadius: "8px", padding: "20px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "18px", color: "var(--text-primary)" }}>我是谁</h2>
            <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.8 }}>
              我是 Seqi，主要写工程实践、部署经验与阅读输出。这个网站是我的长期工作台，不追求“发很多”，更关注“写得能用”。
            </p>
          </div>

          <div style={{ background: "var(--bg-secondary)", border: "1px solid rgba(94, 194, 183, 0.22)", borderRadius: "8px", padding: "20px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "18px", color: "var(--text-primary)" }}>我关注什么</h2>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
              {focusAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: "var(--bg-secondary)", border: "1px solid rgba(200, 169, 107, 0.24)", borderRadius: "8px", padding: "20px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "18px", color: "var(--text-primary)" }}>我正在做</h2>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
              {nowDoing.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section style={{ background: "var(--bg-secondary)", border: "1px solid rgba(94, 194, 183, 0.22)", borderRadius: "8px", padding: "20px" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: "18px", color: "var(--text-primary)" }}>联系与合作</h2>
          <p style={{ margin: "0 0 10px", color: "var(--text-secondary)", lineHeight: 1.8 }}>
            如果你希望我写某个主题，或者想交流博客与知识管理实践，欢迎通过以下方式联系我。
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "8px" }}>
            <li style={{ color: "var(--text-secondary)" }}>
              GitHub: <span style={{ color: "var(--cyan)", fontFamily: "var(--font-mono, monospace)" }}>github.com/13731890887</span>
            </li>
            <li style={{ color: "var(--text-secondary)" }}>
              Guestbook: <span style={{ color: "var(--cyan)", fontFamily: "var(--font-mono, monospace)" }}>/guestbook</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
