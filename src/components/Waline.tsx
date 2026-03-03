"use client";

import { useEffect, useRef } from "react";

interface WalineProps {
  serverURL: string;
  path?: string;
}

export function WalineComments({ serverURL, path }: WalineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !serverURL || serverURL === 'https://placeholder.vercel.app') return;

    let walineInstance: { destroy: () => void } | null = null;

    import("@waline/client").then(({ init }) => {
      if (!containerRef.current) return;
      walineInstance = init({
        el: containerRef.current,
        serverURL,
        path: path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
        lang: "zh-CN",
        dark: true,
      });
    }).catch(console.error);

    return () => {
      walineInstance?.destroy();
    };
  }, [serverURL, path]);

  if (!serverURL || serverURL === 'https://placeholder.vercel.app') {
    return (
      <div
        style={{
          padding: '32px',
          border: '1px solid rgba(94, 194, 183, 0.22)',
          borderRadius: '8px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '14px',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ color: 'var(--cyan)', marginBottom: '8px' }}>{'>'} 留言系统待配置</div>
        <p>请在 Cloudflare Pages 环境变量中设置 NEXT_PUBLIC_WALINE_URL</p>
        <p style={{ fontSize: '12px', marginTop: '8px' }}>
          参考: <a href="https://waline.js.org/guide/get-started/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>Waline 快速上手</a>
        </p>
      </div>
    );
  }

  return <div ref={containerRef} />;
}
