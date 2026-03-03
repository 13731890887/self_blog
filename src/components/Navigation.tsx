"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "入口大厅" },
  { href: "/lab", label: "技术展厅" },
  { href: "/reading", label: "书目陈列室" },
  { href: "/achievements", label: "荣誉殿堂" },
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
        background: '#111820',
        borderBottom: '1px solid rgba(0, 212, 255, 0.15)',
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
            color: '#00d4ff',
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
                color: isActive(link.href) ? '#00d4ff' : '#7fa3bf',
                textDecoration: 'none',
                borderBottom: isActive(link.href) ? '2px solid #00d4ff' : '2px solid transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.href)) {
                  (e.target as HTMLElement).style.color = '#e2e8f0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.href)) {
                  (e.target as HTMLElement).style.color = '#7fa3bf';
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
            color: '#00d4ff',
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
            background: '#111820',
            borderBottom: '1px solid rgba(0, 212, 255, 0.15)',
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
                color: isActive(link.href) ? '#00d4ff' : '#7fa3bf',
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
