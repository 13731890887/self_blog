"use client";

import Link from "next/link";

interface CyberpunkCardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export function CyberpunkCard({ children, className = "", href }: CyberpunkCardProps) {
  const style: React.CSSProperties = {
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(94, 194, 183, 0.22)',
    borderRadius: '8px',
    padding: '24px',
    transition: 'all 0.2s ease',
  };

  const content = (
    <div
      style={style}
      className={className}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = 'rgba(94, 194, 183, 0.48)';
        el.style.boxShadow = '0 0 20px rgba(94, 194, 183, 0.1)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = 'rgba(94, 194, 183, 0.22)';
        el.style.boxShadow = 'none';
      }}
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        {content}
      </Link>
    );
  }

  return content;
}
