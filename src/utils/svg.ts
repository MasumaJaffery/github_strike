/**
 * Minimal SVG utilities - no animations, no themes, just working SVG
 */

export function createSvgWrapper(
  content: string,
  width: number,
  height: number
): string {
  return `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' style='isolation: isolate' viewBox='0 0 ${width} ${height}' width='${width}px' height='${height}px'>
<defs>
<clipPath id='outer_rectangle'>
<rect width='${width}' height='${height}' rx='4.5'/>
</clipPath>
</defs>
<g clip-path='url(#outer_rectangle)'>
<rect stroke='#e4e2e2' fill='#fffefe' rx='4.5' x='0.5' y='0.5' width='${width - 1}' height='${height - 1}'/>
${content}
</g>
</svg>`;
}

export function text(
  content: string,
  x: number,
  y: number,
  size: number = 14,
  bold: boolean = false,
  color: string = '#333'
): string {
  const weight = bold ? '700' : '400';
  return `<text x='${x}' y='${y}' stroke-width='0' text-anchor='start' fill='${color}' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='${weight}' font-size='${size}px' font-style='normal'>${escapeHtml(content)}</text>`;
}

export function textCenter(
  content: string,
  x: number,
  y: number,
  size: number = 14,
  bold: boolean = false,
  color: string = '#333'
): string {
  const weight = bold ? '700' : '400';
  return `<text x='${x}' y='${y}' stroke-width='0' text-anchor='middle' fill='${color}' stroke='none' font-family='"Segoe UI", Ubuntu, sans-serif' font-weight='${weight}' font-size='${size}px' font-style='normal'>${escapeHtml(content)}</text>`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
