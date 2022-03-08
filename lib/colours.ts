export const rgbAddAlpha = (rgb: string, alpha: string) => (
  `rgba(${rgb.slice(4, -1)}, ${alpha})`
)
  
export const hexToRgb = (hex: string, alpha: string = '1') => {
  const rgb = hex
    .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1)
    .match(/.{2}/g)
    ?.map(x => parseInt(x, 16)).toString() || ""

  return `rgba(${rgb.toString()}, ${alpha})` 
}
  