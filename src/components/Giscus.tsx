"use client";

import GiscusComponent from "@giscus/react";

export function Giscus() {
  return (
    <div className="pt-8">
      <GiscusComponent
        id="comments"
        repo="seqi/self_web" // 替换为你的 GitHub 仓库
        repoId="R_kgDONQ1234" // 在 https://giscus.app 获取
        category="Announcements"
        categoryId="DIC_kwDONQ12345"
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="dark_dimmed"
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
