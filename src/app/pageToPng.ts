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

  const pageBgGrad = doc.pageBgGradient;
  if (pageBgGrad?.start && pageBgGrad?.end) {
    const angle = (pageBgGrad.angle ?? 90) * (Math.PI / 180);
    const cx = w / 2;
    const cy = h / 2;
    const dx = Math.cos(angle) * w;
    const dy = Math.sin(angle) * h;
    const grd = ctx.createLinearGradient(cx - dx / 2, cy - dy / 2, cx + dx / 2, cy + dy / 2);
    grd.addColorStop(0, pageBgGrad.start);
    grd.addColorStop(1, pageBgGrad.end);
    ctx.fillStyle = grd;
  } else {
    ctx.fillStyle = doc.pageBg || "#ffffff";
  }
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
        const fillGrad = n.props.fillGradient;
        const stroke = n.props.stroke || defaultStroke;
        const strokeW = (n.props.strokeWidth ?? 1) * SCALE;
        const radius = Math.min((n.props.radius ?? 0) * SCALE, width / 2, height / 2);
        if (fillGrad?.start && fillGrad?.end) {
          const angle = (fillGrad.angle ?? 90) * (Math.PI / 180);
          const grd = ctx.createLinearGradient(x, y, x + Math.cos(angle) * width, y + Math.sin(angle) * height);
          grd.addColorStop(0, fillGrad.start);
          grd.addColorStop(1, fillGrad.end);
          ctx.fillStyle = grd;
        } else {
          ctx.fillStyle = n.props.fill || defaultFill;
        }
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
        const fillGradCircle = n.props.fillGradient;
        const stroke = n.props.stroke || defaultStroke;
        const strokeW = (n.props.strokeWidth ?? 1) * SCALE;
        const cx = x + width / 2;
        const cy = y + height / 2;
        const r = Math.min(width, height) / 2 - strokeW / 2;
        if (fillGradCircle?.start && fillGradCircle?.end) {
          const angle = (fillGradCircle.angle ?? 90) * (Math.PI / 180);
          const grd = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
          grd.addColorStop(0, fillGradCircle.start);
          grd.addColorStop(1, fillGradCircle.end);
          ctx.fillStyle = grd;
        } else {
          ctx.fillStyle = n.props.fill || defaultFill;
        }
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
      case "qrcode": {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = "#6b7280";
        ctx.font = `${12 * SCALE}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("QR", x + width / 2, y + height / 2);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
        break;
      }
      case "progressbar": {
        const val = Math.max(0, Math.min(100, n.props.progressValue ?? 50));
        const track = n.props.progressTrack || "#e2e8f0";
        const bar = n.props.progressBar || "#6366f1";
        const rr = height / 2;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, width, height, rr);
        else { ctx.moveTo(x + rr, y); ctx.arcTo(x + width, y, x + width, y + height, rr); ctx.arcTo(x + width, y + height, x, y + height, rr); ctx.arcTo(x, y + height, x, y, rr); ctx.arcTo(x, y, x + rr, y, rr); }
        ctx.fillStyle = track; ctx.fill();
        const bw = width * val / 100;
        if (bw > 0) {
          ctx.beginPath();
          if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, bw, height, rr);
          else { ctx.moveTo(x + rr, y); ctx.arcTo(x + bw, y, x + bw, y + height, Math.min(rr, bw/2)); ctx.arcTo(x + bw, y + height, x, y + height, Math.min(rr, bw/2)); ctx.arcTo(x, y + height, x, y, rr); ctx.arcTo(x, y, x + rr, y, rr); }
          ctx.fillStyle = bar; ctx.fill();
        }
        break;
      }
      case "star": {
        const pts = n.props.points || 5;
        const ir = n.props.innerRadius || 0.45;
        const fill = n.props.fill || "#fbbf24";
        const stroke = n.props.stroke || "#d97706";
        const cx = x + width / 2;
        const cy = y + height / 2;
        const outerR = Math.min(width, height) / 2;
        const innerR = outerR * ir;
        const angleStep = Math.PI / pts;
        ctx.beginPath();
        for (let i = 0; i < pts * 2; i++) {
          const a = i * angleStep - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2 * SCALE;
        ctx.stroke();
        break;
      }
      case "stickynote": {
        const bg = n.props.noteBg || "#fef08a";
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, width, height);
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 4 * SCALE;
        ctx.shadowOffsetX = 2 * SCALE;
        ctx.shadowOffsetY = 3 * SCALE;
        ctx.fillRect(x, y, width, height);
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        const text = (n.props.text || "").trim();
        if (text) {
          const fs = (n.props.fontSize ?? 14) * SCALE;
          ctx.font = `${fs}px ${getCanvasFontFamily(def.fontFamily || "Inter")}`;
          ctx.fillStyle = "#1c1917";
          ctx.textBaseline = "top";
          ctx.save();
          ctx.translate(x + 10 * SCALE, y + 10 * SCALE);
          wrapText(ctx, text, width - 20 * SCALE, fs * 1.4);
          ctx.restore();
        }
        break;
      }
      case "ruler": {
        const col = "#dc2626";
        ctx.strokeStyle = col;
        ctx.lineWidth = 2 * SCALE;
        ctx.beginPath();
        ctx.moveTo(x, y + height / 2);
        ctx.lineTo(x + width, y + height / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y + height / 2 - 4 * SCALE);
        ctx.lineTo(x, y + height / 2 + 4 * SCALE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + width, y + height / 2 - 4 * SCALE);
        ctx.lineTo(x + width, y + height / 2 + 4 * SCALE);
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.font = `${10 * SCALE}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${n.wMm.toFixed(1)} mm`, x + width / 2, y + height / 2 - 4 * SCALE);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
        break;
      }
      case "rating": {
        const val = n.props.ratingValue ?? 3;
        const max = n.props.ratingMax ?? 5;
        const color = n.props.ratingColor || "#f59e0b";
        const empty = "#d1d5db";
        const fs = Math.min(height * 0.8, 20 * SCALE);
        ctx.font = `${fs}px sans-serif`;
        ctx.textBaseline = "middle";
        for (let i = 0; i < max; i++) {
          ctx.fillStyle = i < val ? color : empty;
          ctx.fillText("★", x + i * (width / max), y + height / 2);
        }
        ctx.textBaseline = "alphabetic";
        break;
      }
      case "signature": {
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = 1.5 * SCALE;
        ctx.beginPath();
        ctx.moveTo(x + 6 * SCALE, y + height * 0.7);
        ctx.lineTo(x + width - 6 * SCALE, y + height * 0.7);
        ctx.stroke();
        ctx.fillStyle = "#6b7280";
        ctx.font = `${8 * SCALE}px sans-serif`;
        ctx.fillText(n.props.signatureLabel || "Signature", x + 6 * SCALE, y + height - 4 * SCALE);
        break;
      }
      case "barcode": {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = "#e5e7eb";
        ctx.strokeRect(x, y, width, height);
        const txt = n.props.barcodeText || "123456789";
        const barW = Math.max(1, width / (txt.length * 2 + 10));
        ctx.fillStyle = "#000000";
        for (let i = 0; i < txt.length; i++) {
          const bx = x + 8 * SCALE + i * barW * 2;
          const bh = height * 0.6;
          ctx.fillRect(bx, y + 4 * SCALE, barW, bh);
        }
        ctx.fillStyle = "#000000";
        ctx.font = `${8 * SCALE}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(txt, x + width / 2, y + height - 4 * SCALE);
        ctx.textAlign = "start";
        break;
      }
      case "chart": {
        const data = (n.props.chartData || "10,30,20,50,40").split(",").map(Number);
        const maxVal = Math.max(...data, 1);
        const chartColor = n.props.chartColors || "#6366f1";
        ctx.fillStyle = chartColor;
        const barWidth2 = width / data.length * 0.8;
        const gap = width / data.length * 0.1;
        data.forEach((v, i) => {
          const bh = (v / maxVal) * height;
          const bx = x + i * (width / data.length) + gap;
          ctx.beginPath();
          ctx.roundRect(bx, y + height - bh, barWidth2, bh, 2 * SCALE);
          ctx.fill();
        });
        break;
      }
      case "timeline": {
        let items: { date: string; title: string }[] = [];
        try { items = JSON.parse(n.props.timelineItems || "[]"); } catch {}
        if (!items.length) items = [{ date: "2026", title: "Event" }];
        const tlColor = n.props.fill || "#6366f1";
        ctx.strokeStyle = tlColor;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2 * SCALE;
        ctx.beginPath();
        ctx.moveTo(x + 5 * SCALE, y + 8 * SCALE);
        ctx.lineTo(x + 5 * SCALE, y + height - 8 * SCALE);
        ctx.stroke();
        ctx.globalAlpha = n.props.opacity ?? 1;
        items.forEach((it, i) => {
          const iy = y + i * (height / items.length) + 12 * SCALE;
          ctx.fillStyle = tlColor;
          ctx.beginPath();
          ctx.arc(x + 5 * SCALE, iy, 4 * SCALE, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#111827";
          ctx.font = `bold ${9 * SCALE}px sans-serif`;
          ctx.fillText(it.date || "", x + 14 * SCALE, iy);
          ctx.fillStyle = "#64748b";
          ctx.font = `${8 * SCALE}px sans-serif`;
          ctx.fillText(it.title || "", x + 14 * SCALE, iy + 10 * SCALE);
        });
        break;
      }
      case "countdown": {
        const target = n.props.countdownTarget || new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10);
        const diff = Math.max(0, Math.ceil((new Date(target).getTime() - Date.now()) / 86400000));
        const cdColor = n.props.fill || "#6366f1";
        ctx.fillStyle = cdColor;
        ctx.font = `bold ${24 * SCALE}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(diff), x + width / 2, y + height * 0.45);
        ctx.fillStyle = "#64748b";
        ctx.font = `${9 * SCALE}px sans-serif`;
        ctx.fillText(n.props.countdownLabel || "Days left", x + width / 2, y + height * 0.75);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
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
