export function ScanlineBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(94, 194, 183, 0.018) 2px, rgba(94, 194, 183, 0.018) 3px)',
        backgroundSize: '100% 3px',
      }}
      aria-hidden="true"
    />
  );
}
