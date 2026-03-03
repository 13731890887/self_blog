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
          color: '#00d4ff',
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
          color: '#e2e8f0',
          margin: '0 0 12px 0',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: '16px',
          color: '#7fa3bf',
          margin: '0 0 24px 0',
        }}
      >
        {subtitle}
      </p>
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(to right, #00d4ff, rgba(0, 212, 255, 0.1), transparent)',
        }}
      />
    </div>
  );
}
