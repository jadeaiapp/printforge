export type AssetCategory = "Icons" | "Dividers" | "Badges" | "Stickers";

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  svgMarkup: string;
  widthMm: number;
  heightMm: number;
}

const iconGlyphs = [
  "★","✓","✕","✚","⚑","⚙","✉","☎","☀","☁","☂","♫","⚡","⌛","⌂","⌁","⌘","⌖","⌚","✿",
  "☕","☘","☯","☮","⚓","⚖","⚠","♻","♞","✈","☾","❄","✦","✪","✧","❖","❂","⎋","⌁","✎",
  "✂","✆","⚗","⚛"
];

const iconPalette = ["#1d4ed8", "#7c3aed", "#0f766e", "#be123c", "#b45309", "#334155"];

const createIconSvg = (glyph: string, idx: number) => {
  const color = iconPalette[idx % iconPalette.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="8" y="8" width="104" height="104" rx="24" fill="${color}22" stroke="${color}" stroke-width="4"/><text x="60" y="74" text-anchor="middle" font-size="46" fill="${color}" font-family="Inter, Arial, sans-serif">${glyph}</text></svg>`;
};

const dividerPatterns = [
  { stroke: "#334155", path: "M8 30 H232" },
  { stroke: "#1d4ed8", path: "M8 30 H232 M120 14 V46" },
  { stroke: "#0f766e", path: "M8 30 H108 M132 30 H232" },
  { stroke: "#7c3aed", path: "M8 30 H232" , dash: "8 6"},
  { stroke: "#be123c", path: "M8 30 H232", width: 4 },
  { stroke: "#b45309", path: "M8 30 Q120 8 232 30" },
  { stroke: "#0369a1", path: "M8 30 C55 10 185 50 232 30" },
  { stroke: "#15803d", path: "M8 30 H232 M20 22 L8 30 L20 38 M220 22 L232 30 L220 38" },
  { stroke: "#6d28d9", path: "M8 30 H232 M120 20 L126 30 L120 40 L114 30 Z" },
  { stroke: "#9f1239", path: "M8 30 H232 M58 20 L64 30 L58 40 M182 20 L176 30 L182 40" },
  { stroke: "#0f766e", path: "M8 30 H232", dash: "2 8" },
  { stroke: "#1e293b", path: "M8 30 H232", width: 6 },
];

const createDividerSvg = (pattern: { stroke: string; path: string; dash?: string; width?: number }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60"><path d="${pattern.path}" fill="none" stroke="${pattern.stroke}" stroke-linecap="round" stroke-width="${pattern.width ?? 3}" ${pattern.dash ? `stroke-dasharray="${pattern.dash}"` : ""}/></svg>`;

const badgeData = [
  ["NEW", "#1d4ed8"], ["SALE", "#be123c"], ["HOT", "#b91c1c"], ["TODO", "#7c3aed"],
  ["DONE", "#15803d"], ["PLAN", "#0f766e"], ["NOTE", "#334155"], ["IDEA", "#b45309"],
  ["VIP", "#4f46e5"], ["DRAFT", "#475569"], ["EVENT", "#c026d3"], ["WEEKLY", "#0369a1"],
];

const createBadgeSvg = (label: string, color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 70"><rect x="4" y="8" width="172" height="54" rx="26" fill="${color}22" stroke="${color}" stroke-width="4"/><text x="90" y="45" text-anchor="middle" font-size="22" font-family="Inter, Arial, sans-serif" font-weight="700" fill="${color}">${label}</text></svg>`;

const stickers = [
  ["Smiley", "😀"], ["Party", "🎉"], ["Spark", "✨"], ["Heart", "💖"], ["Coffee", "☕"],
  ["Leaf", "🍀"], ["Star", "🌟"], ["Rocket", "🚀"], ["Idea", "💡"], ["Music", "🎵"],
  ["Sun", "🌞"], ["Moon", "🌙"], ["Cloud", "☁️"], ["Check", "✅"], ["Fire", "🔥"],
  ["Gift", "🎁"], ["Camera", "📷"], ["Bell", "🔔"], ["Globe", "🌍"], ["Book", "📘"],
];

const createStickerSvg = (emoji: string, idx: number) => {
  const ring = iconPalette[(idx + 2) % iconPalette.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="#ffffff" stroke="${ring}" stroke-width="5"/><text x="60" y="78" text-anchor="middle" font-size="52">${emoji}</text></svg>`;
};

export const ASSET_LIBRARY: AssetItem[] = [
  ...iconGlyphs.map((glyph, idx) => ({ id: `icon-${idx + 1}`, name: `Icon ${idx + 1}`, category: "Icons" as const, svgMarkup: createIconSvg(glyph, idx), widthMm: 20, heightMm: 20 })),
  ...dividerPatterns.map((pattern, idx) => ({ id: `divider-${idx + 1}`, name: `Divider ${idx + 1}`, category: "Dividers" as const, svgMarkup: createDividerSvg(pattern), widthMm: 65, heightMm: 8 })),
  ...badgeData.map(([label, color], idx) => ({ id: `badge-${idx + 1}`, name: `Badge ${label}`, category: "Badges" as const, svgMarkup: createBadgeSvg(label, color), widthMm: 36, heightMm: 14 })),
  ...stickers.map(([name, emoji], idx) => ({ id: `sticker-${idx + 1}`, name: `${name} Sticker`, category: "Stickers" as const, svgMarkup: createStickerSvg(emoji, idx), widthMm: 24, heightMm: 24 })),
];
