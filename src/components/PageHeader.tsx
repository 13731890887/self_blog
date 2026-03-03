interface PageHeaderProps {
  title: string;
  subtitle: string;
  path: string;
}

export function PageHeader({ title, subtitle, path }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
          fontSize: '12px',
          color: 'var(--cyan)',
          marginBottom: '8px',
          letterSpacing: '0.1em',
        }}
      >
        {'>'} {path}
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 12px 0',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          margin: '0 0 24px 0',
        }}
      >
        {subtitle}
      </p>
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(to right, rgba(94, 194, 183, 0.55), rgba(94, 194, 183, 0.12), transparent)',
        }}
      />
    </div>
  );
}
