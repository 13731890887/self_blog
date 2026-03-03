"use client";

import { WalineComments } from "@/components/Waline";
import { PageHeader } from "@/components/PageHeader";

export default function GuestbookPage() {
  const serverURL =
    process.env.NEXT_PUBLIC_WALINE_URL || "https://placeholder.vercel.app";

  return (
    <main style={{ background: "#080b0f", minHeight: "100vh", paddingTop: "56px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
        <PageHeader
          title="留言墙"
          subtitle="留下你来过的足迹"
          path="/guestbook"
        />
        <WalineComments serverURL={serverURL} path="/guestbook" />
      </div>
    </main>
  );
}
