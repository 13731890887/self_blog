export function ScanlineBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 212, 255, 0.025) 2px, rgba(0, 212, 255, 0.025) 3px)',
        backgroundSize: '100% 3px',
      }}
      aria-hidden="true"
    />
  );
}
