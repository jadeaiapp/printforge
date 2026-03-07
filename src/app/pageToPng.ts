import type { Doc, Node, Page } from "./model";
import { pageDimensionsMm } from "./model";

const PX_PER_MM = 3.7795275591;
const SCALE = 2;

function mmToPx(mm: number): number {
  return mm * PX_PER_MM * SCALE;
}

function getCanvasFontFamily(cssFont: string): string {
  if (/georgia|serif/i.test(cssFont)) return "Georgia, serif";
  if (/arial|sans/i.test(cssFont)) return "Arial, sans-serif";
  return "Inter, system-ui, sans-serif";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!src || (src.length < 8 && !src.startsWith("data:"))) {
      reject(new Error("Invalid image src"));
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = text.split(/\n/);
  let y = 0;
  for (const line of lines) {
    const words = line.split(/\s+/);
    let current = "";
    for (const w of words) {
      const test = current ? `${current} ${w}` : w;
      const m = ctx.measureText(test);
      if (m.width > maxWidth && current) {
        ctx.fillText(current, 0, y);
        y += lineHeight;
        current = w;
      } else {
        current = test;
      }
    }
    if (current) {
      ctx.fillText(current, 0, y);
      y += lineHeight;
    }
  }
  return y;
}

export async function exportPageToPng(doc: Doc, pageId: string): Promise<Blob> {
  const page = doc.pages.find((p) => p.id === pageId);
  if (!page) throw new Error("Page not found");

  const dims = pageDimensionsMm(doc.pageSize, doc.orientation);
  const w = Math.round(mmToPx(dims.wMm));
  const h = Math.round(mmToPx(dims.hMm));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2d not available");

  const pageBg = page.nodes.length ? "#ffffff" : (doc.pageBg || "#ffffff");
  ctx.fillStyle = pageBg;
  ctx.fillRect(0, 0, w, h);

  const def = doc.defaults || {};
  const defaultColor = def.textColor || "#111827";
  const defaultFill = def.fillColor || "#e2e8f0";
  const defaultStroke = def.strokeColor || "#94a3b8";

  const sorted = [...page.nodes].sort((a, b) => a.z - b.z).filter((n) => n.visible);

  for (const n of sorted) {
    const x = mmToPx(n.xMm);
    const y = mmToPx(n.yMm);
    const width = mmToPx(n.wMm);
    const height = mmToPx(n.hMm);
    const opacity = n.props.opacity ?? 1;
    ctx.globalAlpha = opacity;

    switch (n.type) {
      case "text":
      case "heading":
      case "paragraph":
      case "datelabel": {
        const fontFamily = getCanvasFontFamily(n.props.fontFamily || def.fontFamily || "Inter");
        const fontSize = (n.props.fontSize ?? 14) * SCALE;
        const color = n.props.color || defaultColor;
        const align = n.props.align || "left";
        const lineHeight = (n.props.lineHeight ?? 1.3) * fontSize;
        ctx.font = `${n.props.italic ? "italic " : ""}${n.props.fontWeight === 700 ? "bold " : n.props.fontWeight === 600 ? "600 " : ""}${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textBaseline = "top";
        const text = (n.props.text || "").trim() || "Text";
        const maxW = width - 4;
        ctx.save();
        ctx.translate(x + 2, y + 2);
        if (align !== "left") {
          ctx.textAlign = align;
          ctx.translate(align === "center" ? maxW / 2 : maxW, 0);
        }
        wrapText(ctx, text, maxW, lineHeight);
        ctx.restore();
        break;
      }
      case "box":
      case "highlight":
      case "roundedrect": {
        const fill = n.props.fill || defaultFill;
        const stroke = n.props.stroke || defaultStroke;
        const strokeW = (n.props.strokeWidth ?? 1) * SCALE;
        const radius = Math.min((n.props.radius ?? 0) * SCALE, width / 2, height / 2);
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeW;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, width, height, radius);
        } else {
          const r = Math.min(radius, width / 2, height / 2);
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + width - r, y);
          ctx.arcTo(x + width, y, x + width, y + r, r);
          ctx.lineTo(x + width, y + height - r);
          ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
          ctx.lineTo(x + r, y + height);
          ctx.arcTo(x, y + height, x, y + height - r, r);
          ctx.lineTo(x, y + r);
          ctx.arcTo(x, y, x + r, y, r);
        }
        ctx.fill();
        if (strokeW > 0) ctx.stroke();
        break;
      }
      case "circle": {
        const fill = n.props.fill || defaultFill;
        const stroke = n.props.stroke || defaultStroke;
        const strokeW = (n.props.strokeWidth ?? 1) * SCALE;
        const cx = x + width / 2;
        const cy = y + height / 2;
        const r = Math.min(width, height) / 2 - strokeW / 2;
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeW;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        if (strokeW > 0) ctx.stroke();
        break;
      }
      case "line":
      case "divider": {
        const color = n.props.color || defaultStroke;
        const thickness = (n.props.thickness ?? 2) * SCALE;
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(x, y + height / 2);
        ctx.lineTo(x + width, y + height / 2);
        ctx.stroke();
        break;
      }
      case "image": {
        const src = n.props.src;
        if (src) {
          try {
            const img = await loadImage(src);
            const objectFit = n.props.objectFit || "contain";
            const imgW = img.naturalWidth;
            const imgH = img.naturalHeight;
            let drawW = width;
            let drawH = height;
            let drawX = x;
            let drawY = y;
            if (objectFit === "contain") {
              const scale = Math.min(width / imgW, height / imgH);
              drawW = imgW * scale;
              drawH = imgH * scale;
              drawX = x + (width - drawW) / 2;
              drawY = y + (height - drawH) / 2;
            }
            ctx.drawImage(img, drawX, drawY, drawW, drawH);
          } catch {
            ctx.fillStyle = "#e5e7eb";
            ctx.fillRect(x, y, width, height);
            ctx.fillStyle = "#6b7280";
            ctx.font = `${12 * SCALE}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("Image", x + width / 2, y + height / 2 - 8);
          }
        } else {
          ctx.fillStyle = "#e5e7eb";
          ctx.fillRect(x, y, width, height);
        }
        break;
      }
      case "checkbox":
        ctx.font = `${(n.props.fontSize ?? 14) * 0.9 * SCALE}px ${getCanvasFontFamily(def.fontFamily || "Inter")}`;
        ctx.fillStyle = n.props.color || defaultColor;
        ctx.textBaseline = "middle";
        ctx.fillText((n.props.checked ? "☑ " : "☐ ") + (n.props.text || "Task"), x + 4, y + height / 2);
        break;
      case "checklist":
      case "bulletlist": {
        const items = n.props.items || ["Item 1"];
        const lineH = (n.props.lineHeight ?? 1.4) * (n.props.fontSize ?? 14) * SCALE;
        const marker = n.props.listStyle === "checkbox" ? "☐" : "•";
        ctx.font = `${(n.props.fontSize ?? 14) * 0.9 * SCALE}px ${getCanvasFontFamily(def.fontFamily || "Inter")}`;
        ctx.fillStyle = n.props.color || defaultColor;
        ctx.textBaseline = "top";
        items.forEach((item, i) => {
          ctx.fillText(`${marker} ${item}`, x + 4, y + 4 + i * lineH);
        });
        break;
      }
      default:
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = "#d1d5db";
        ctx.strokeRect(x, y, width, height);
    }

    ctx.globalAlpha = 1;
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png",
      0.92
    );
  });
}
