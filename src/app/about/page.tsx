import { PageHeader } from "@/components/PageHeader";

export default function AboutPage() {
  return (
    <main style={{ background: "#080b0f", minHeight: "100vh", paddingTop: "56px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
        <PageHeader
          title="关于我"
          subtitle="一个热爱技术与阅读的开发者"
          path="/about"
        />

        <div style={{ display: "grid", gap: "24px" }}>
          {/* Intro */}
          <div
            style={{
              background: "#0d1117",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              borderRadius: "4px",
              padding: "24px",
            }}
          >
            <p style={{ fontSize: "16px", color: "#e2e8f0", lineHeight: 1.8, margin: 0 }}>
              你好！我是 Seqi，一个热爱学习的开发者。
              这个博物馆是我数字世界的展厅，记录着技术探索、阅读感悟和成长轨迹。
            </p>
          </div>

          {/* Interests */}
          <div
            style={{
              background: "#0d1117",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              borderRadius: "4px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
                fontSize: "18px",
                color: "#00d4ff",
                marginTop: 0,
                marginBottom: "16px",
              }}
            >
              {'>'} 我的兴趣
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "8px" }}>
              {["编程与软件开发", "阅读与写作", "个人成长与效率提升", "AI 与新技术探索"].map(
                (item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#e2e8f0",
                      fontSize: "15px",
                    }}
                  >
                    <span style={{ color: "#bf5af2" }}>▸</span>
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* This site */}
          <div
            style={{
              background: "#0d1117",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              borderRadius: "4px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
                fontSize: "18px",
                color: "#00d4ff",
                marginTop: 0,
                marginBottom: "16px",
              }}
            >
              {'>'} 这个网站
            </h2>
            <p style={{ color: "#e2e8f0", lineHeight: 1.8, margin: 0 }}>
              这是我用 Next.js 搭建的个人博物馆，采用极简赛博朋克设计风格。
              技术展厅记录 AI 与工程实践，书目陈列室分享阅读感悟，
              荣誉殿堂展示 GitHub 成就，留言墙欢迎你留下足迹。
            </p>
          </div>

          {/* Contact */}
          <div
            style={{
              background: "#0d1117",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              borderRadius: "4px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-mono, JetBrains Mono, monospace)",
                fontSize: "18px",
                color: "#00d4ff",
                marginTop: 0,
                marginBottom: "16px",
              }}
            >
              {'>'} 联系方式
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "8px" }}>
              {[
                { label: "GitHub", value: "github.com/seqi" },
                { label: "Email", value: "your@email.com" },
              ].map((contact) => (
                <li
                  key={contact.label}
                  style={{
                    display: "flex",
                    gap: "12px",
                    fontSize: "15px",
                    color: "#e2e8f0",
                  }}
                >
                  <span
                    style={{
                      color: "#7fa3bf",
                      fontFamily: "var(--font-mono, monospace)",
                      minWidth: "60px",
                    }}
                  >
                    {contact.label}:
                  </span>
                  <span style={{ color: "#00d4ff" }}>{contact.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
