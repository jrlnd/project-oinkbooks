/**
 * v1 parity — generate N distinct colours stepping around the rainbow.
 *
 * Port of the algorithm in v1's components/TransactionsChart.tsx: three sine
 * waves (one per RGB channel, phase-shifted by 0/2/4) sampled at frequency
 * 5/N. The result is a smoothly-distributed spectrum no matter how many
 * categories the user has spent in.
 *
 * Each colour is then darkened ~25% and desaturated ~20% via inline HSL
 * conversion (v1 did this with the `color` npm lib — we don't need the dep).
 */
export function rainbowColors(count: number): string[] {
  if (count <= 0) return [];
  const out: string[] = [];
  const frequency = 5 / count;
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.sin(frequency * i + 0) * 127 + 128);
    const g = Math.floor(Math.sin(frequency * i + 2) * 127 + 128);
    const b = Math.floor(Math.sin(frequency * i + 4) * 127 + 128);
    out.push(adjustHsl(r, g, b, /*darken*/ 0.25, /*desaturate*/ 0.2));
  }
  return out;
}

function adjustHsl(
  r: number,
  g: number,
  b: number,
  darken: number,
  desaturate: number,
): string {
  // RGB (0-255) -> HSL
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
  }
  // Apply adjustments
  s = clamp(s * (1 - desaturate), 0, 1);
  const lOut = clamp(l * (1 - darken), 0, 1);
  // HSL -> RGB
  const [ar, ag, ab] = hslToRgb(h, s, lOut);
  return `#${toHex(ar)}${toHex(ag)}${toHex(ab)}`;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function toHex(v: number) {
  return Math.round(v).toString(16).padStart(2, '0');
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = h / 360;
  return [
    hueToRgb(p, q, hue + 1 / 3) * 255,
    hueToRgb(p, q, hue) * 255,
    hueToRgb(p, q, hue - 1 / 3) * 255,
  ];
}

function hueToRgb(p: number, q: number, t: number) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
