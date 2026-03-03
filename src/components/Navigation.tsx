"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "文章" },
  { href: "/reading", label: "阅读" },
  { href: "/guestbook", label: "留言墙" },
  { href: "/about", label: "关于我" },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: '#000000',
        borderBottom: '1px solid rgba(143, 215, 206, 0.28)',
        boxShadow: '0 10px 28px rgba(0, 0, 0, 0.34)',
        backdropFilter: 'blur(8px)',
        height: '56px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
            fontSize: '16px',
            fontWeight: 700,
            color: '#d7fff8',
            textDecoration: 'none',
            letterSpacing: '0.05em',
          }}
        >
          SEQI.MUSEUM
        </Link>

        {/* Desktop nav */}
        <div
          className="hidden md:flex"
          style={{ gap: '8px', alignItems: 'center' }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                color: isActive(link.href) ? '#f3fffd' : '#c6d2e6',
                textDecoration: 'none',
                borderBottom: isActive(link.href) ? '2px solid #8fd7ce' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.href)) {
                  (e.target as HTMLElement).style.color = '#f3fffd';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.href)) {
                  (e.target as HTMLElement).style.color = '#c6d2e6';
                }
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#d7fff8',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            background: '#000000',
            borderBottom: '1px solid rgba(143, 215, 206, 0.28)',
            padding: '8px 0',
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block',
                padding: '12px 24px',
                fontSize: '14px',
                fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                color: isActive(link.href) ? '#f3fffd' : '#c6d2e6',
                textDecoration: 'none',
              }}
            >
              {isActive(link.href) ? '> ' : '  '}{link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
