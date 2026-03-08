import type { Doc, Node, Page } from "./model";

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace(/^#/, "").match(/^(..)(..)(..)$/);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}

function getJsPDFFont(fontFamily: string): string {
  if (/georgia|serif/i.test(fontFamily)) return "times";
  if (/courier|mono/i.test(fontFamily)) return "courier";
  return "helvetica";
}

export async function exportDocToPDF(doc: Doc): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: doc.orientation,
    unit: "mm",
    format: doc.pageSize === "A4" ? "a4" : "a5",
  });

  const defaultFont = getJsPDFFont(doc.defaults?.fontFamily || "Inter");
  const defaultColor = doc.defaults?.textColor || "#111827";

  const drawNode = (pdf: import("jspdf").jsPDF, node: Node, pageW: number, pageH: number) => {
    if (!node.visible) return;
    const opacity = node.props.opacity ?? 1;
    const x = node.xMm;
    const y = node.yMm;
    const w = node.wMm;
    const h = node.hMm;

    const setColor = (hex: string) => {
      const [r, g, b] = hexToRgb(hex);
      pdf.setDrawColor(r * 255, g * 255, b * 255);
      pdf.setFillColor(r * 255, g * 255, b * 255);
      pdf.setTextColor(r * 255, g * 255, b * 255);
    };

    const font = getJsPDFFont(node.props.fontFamily || doc.defaults?.fontFamily || "Inter");
    const color = node.props.color || defaultColor;
    const fontSize = node.props.fontSize ?? 14;
    const fontWeight = node.props.fontWeight ?? 400;

    switch (node.type) {
      case "text":
      case "heading":
      case "paragraph":
      case "datelabel": {
        pdf.setFont(font, fontWeight >= 700 ? "bold" : "normal");
        pdf.setFontSize(fontSize);
        setColor(color);
        const text = (node.props.text || "").replace(/\n/g, "\n");
        const align = node.props.align || "left";
        const opts: { align?: "left" | "center" | "right"; maxWidth?: number } = { maxWidth: w };
        if (align !== "left") opts.align = align;
        pdf.text(text, x, y + fontSize * 0.35, opts);
        break;
      }
      case "checkbox": {
        pdf.setFontSize(fontSize * 0.8);
        setColor(color);
        const sym = node.props.checked ? "☑" : "☐";
        pdf.text(`${sym} ${node.props.text || "Task"}`, x, y + fontSize * 0.35);
        break;
      }
      case "checklist":
      case "bulletlist": {
        const items = node.props.items || ["Item 1"];
        const lineH = (node.props.lineHeight || 1.4) * fontSize * 0.35;
        const marker = node.props.listStyle === "checkbox" ? "☐" : "•";
        pdf.setFontSize(fontSize * 0.9);
        setColor(color);
        items.forEach((item, i) => {
          pdf.text(`${marker} ${item}`, x, y + (i + 1) * lineH);
        });
        break;
      }
      case "box":
      case "highlight":
      case "roundedrect": {
        const fillGrad = node.props.fillGradient;
        const fill = (fillGrad?.start ? fillGrad.start : null) ?? node.props.fill ?? doc.defaults?.fillColor ?? "#e2e8f0";
        const stroke = node.props.stroke || doc.defaults?.strokeColor || "#94a3b8";
        const radius = Math.min((node.props.radius ?? 0) / 2, w / 2, h / 2);
        const [fr, fg, fb] = hexToRgb(fill);
        const [sr, sg, sb] = hexToRgb(stroke);
        pdf.setFillColor(fr * 255, fg * 255, fb * 255);
        pdf.setDrawColor(sr * 255, sg * 255, sb * 255);
        pdf.setLineWidth((node.props.strokeWidth ?? 1) * 0.3);
        if (radius > 0) {
          pdf.roundedRect(x, y, w, h, radius, radius, "FD");
        } else {
          pdf.rect(x, y, w, h, "FD");
        }
        break;
      }
      case "circle": {
        const fillGradCircle = node.props.fillGradient;
        const fill = (fillGradCircle?.start ? fillGradCircle.start : null) ?? node.props.fill ?? doc.defaults?.fillColor ?? "#e2e8f0";
        const stroke = node.props.stroke || doc.defaults?.strokeColor || "#94a3b8";
        const [fr, fg, fb] = hexToRgb(fill);
        const [sr, sg, sb] = hexToRgb(stroke);
        pdf.setFillColor(fr * 255, fg * 255, fb * 255);
        pdf.setDrawColor(sr * 255, sg * 255, sb * 255);
        pdf.setLineWidth((node.props.strokeWidth ?? 1) * 0.3);
        const r = Math.min(w, h) / 2;
        pdf.circle(x + r, y + r, r, "FD");
        break;
      }
      case "line":
      case "divider": {
        const lineColor = node.props.color || doc.defaults?.strokeColor || "#334155";
        const [lr, lg, lb] = hexToRgb(lineColor);
        pdf.setDrawColor(lr * 255, lg * 255, lb * 255);
        pdf.setLineWidth((node.props.thickness ?? 2) * 0.3);
        pdf.line(x, y + h / 2, x + w, y + h / 2);
        break;
      }
      case "table": {
        const rows = Math.max(2, node.props.rows ?? 3);
        const cols = Math.max(2, node.props.cols ?? 3);
        const cellW = w / cols;
        const cellH = h / rows;
        const stroke = node.props.stroke || doc.defaults?.strokeColor || "#94a3b8";
        const [sr, sg, sb] = hexToRgb(stroke);
        pdf.setDrawColor(sr * 255, sg * 255, sb * 255);
        pdf.setLineWidth(0.2);
        for (let r = 0; r <= rows; r++) {
          pdf.line(x, y + r * cellH, x + w, y + r * cellH);
        }
        for (let c = 0; c <= cols; c++) {
          pdf.line(x + c * cellW, y, x + c * cellW, y + h);
        }
        break;
      }
      case "calendar": {
        const month = node.props.month ?? new Date().getMonth() + 1;
        const year = node.props.year ?? new Date().getFullYear();
        const title = new Date(year, month - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
        pdf.setFontSize(10);
        setColor("#374151");
        pdf.text(title, x + w / 2, y + 5, { align: "center" });
        const cellW = w / 7;
        const cellH = (h - 8) / 6;
        const [sr, sg, sb] = hexToRgb("#e5e7eb");
        pdf.setDrawColor(sr * 255, sg * 255, sb * 255);
        pdf.setLineWidth(0.1);
        for (let r = 0; r <= 6; r++) {
          pdf.line(x, y + 8 + r * cellH, x + w, y + 8 + r * cellH);
        }
        for (let c = 0; c <= 7; c++) {
          pdf.line(x + c * cellW, y + 8, x + c * cellW, y + h);
        }
        break;
      }
      case "image": {
        const src = node.props.src;
        if (src && src.startsWith("data:")) {
          try {
            const format = src.includes("png") ? "PNG" : "JPEG";
            pdf.addImage(src, format, x, y, w, h, undefined, "FAST");
          } catch {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(x, y, w, h, "F");
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            pdf.text("Image", x + w / 2, y + h / 2, { align: "center" });
          }
        }
        break;
      }
      case "svg":
        pdf.setFillColor(245, 245, 245);
        pdf.roundedRect(x, y, w, h, 1, 1, "F");
        break;
      case "qrcode":
        pdf.setFillColor(255, 255, 255);
        pdf.rect(x, y, w, h, "F");
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text("QR", x + w / 2, y + h / 2, { align: "center" });
        break;
      case "progressbar": {
        const val = Math.max(0, Math.min(100, node.props.progressValue ?? 50));
        const track = node.props.progressTrack || "#e2e8f0";
        const bar = node.props.progressBar || "#6366f1";
        const [tr, tg, tb] = hexToRgb(track);
        pdf.setFillColor(tr * 255, tg * 255, tb * 255);
        const rr = Math.min(h / 2, 8);
        pdf.roundedRect(x, y, w, h, rr, rr, "F");
        const [br, bg, bb] = hexToRgb(bar);
        pdf.setFillColor(br * 255, bg * 255, bb * 255);
        const bw = w * val / 100;
        if (bw > 0) pdf.roundedRect(x, y, bw, h, rr, rr, "F");
        break;
      }
      case "star": {
        const fill = node.props.fill || "#fbbf24";
        const stroke = node.props.stroke || "#d97706";
        const [fr, fg, fb] = hexToRgb(fill);
        const [sr, sg, sb] = hexToRgb(stroke);
        pdf.setFillColor(fr * 255, fg * 255, fb * 255);
        pdf.setDrawColor(sr * 255, sg * 255, sb * 255);
        pdf.setLineWidth(0.5);
        const r = Math.min(w, h) / 2;
        pdf.circle(x + w / 2, y + h / 2, r, "FD");
        break;
      }
      case "stickynote": {
        const bg = node.props.noteBg || "#fef08a";
        const [nr, ng, nb] = hexToRgb(bg);
        pdf.setFillColor(nr * 255, ng * 255, nb * 255);
        pdf.roundedRect(x, y, w, h, 2, 2, "F");
        const text = (node.props.text || "").trim();
        if (text) {
          const fs = node.props.fontSize ?? 14;
          pdf.setFontSize(fs);
          pdf.setTextColor(28, 25, 23);
          pdf.text(text, x + 3, y + fs * 0.4 + 2, { maxWidth: w - 6 });
        }
        break;
      }
      case "ruler": {
        const col = "#dc2626";
        const [rr, rg, rb] = hexToRgb(col);
        pdf.setDrawColor(rr * 255, rg * 255, rb * 255);
        pdf.setLineWidth(0.5);
        pdf.line(x, y + h / 2, x + w, y + h / 2);
        pdf.setFontSize(7);
        pdf.setTextColor(rr * 255, rg * 255, rb * 255);
        pdf.text(`${w.toFixed(1)} mm`, x + w / 2, y + h / 2 - 2, { align: "center" });
        break;
      }
      default:
        break;
    }
  };

  const pageDims = doc.pageSize === "A4"
    ? (doc.orientation === "portrait" ? { w: 210, h: 297 } : { w: 297, h: 210 })
    : (doc.orientation === "portrait" ? { w: 148, h: 210 } : { w: 210, h: 148 });

  const pageBgHex = doc.pageBgGradient?.start ?? doc.pageBg ?? "#ffffff";
  const [pageR, pageG, pageB] = hexToRgb(pageBgHex);

  doc.pages.forEach((page: Page, index: number) => {
    if (index > 0) {
      pdf.addPage(
        [pageDims.w, pageDims.h],
        doc.orientation
      );
    }
    pdf.setFillColor(pageR * 255, pageG * 255, pageB * 255);
    pdf.rect(0, 0, pageDims.w, pageDims.h, "F");
    const sorted = [...page.nodes].sort((a, b) => a.z - b.z);
    sorted.forEach((node) => drawNode(pdf, node, pageDims.w, pageDims.h));
  });

  return pdf.output("blob");
}
