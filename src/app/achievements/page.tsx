import { GitHubStats } from "@/components/GitHubStats";
import { PageHeader } from "@/components/PageHeader";

export default function AchievementsPage() {
  return (
    <main style={{ minHeight: "100vh", paddingTop: "56px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "48px 24px" }}>
        <PageHeader
          title="荣誉殿堂"
          subtitle="GitHub 数据统计与项目成就"
          path="/achievements"
        />
        <GitHubStats username="seqi" />
      </div>
    </main>
  );
}
