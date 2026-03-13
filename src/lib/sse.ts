export function consumeSseBuffer(buffer: string, flush = false) {
  const segments = flush ? [...buffer.split('\n\n'), ''] : buffer.split('\n\n');
  const remainder = flush ? '' : segments.pop() ?? '';
  const events: string[] = [];

  for (const segment of segments) {
    if (!segment.trim()) {
      continue;
    }

    const dataLines = segment
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .filter(Boolean);

    events.push(...dataLines);
  }

  return {
    events,
    remainder
  };
}
