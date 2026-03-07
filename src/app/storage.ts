import type { Doc, NodeType } from "./model";

const STORAGE_KEY = "printforge_doc_v2d";

const NODE_TYPES = new Set<NodeType>([
  "text", "heading", "paragraph", "box", "line", "checkbox", "checklist", "bulletlist",
  "divider", "highlight", "circle", "roundedrect", "datelabel", "table", "calendar", "image", "svg",
]);

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function validateDoc(input: unknown): input is Doc {
  if (!isObj(input)) return false;
  if ((input.pageSize !== "A4" && input.pageSize !== "A5") || (input.orientation !== "portrait" && input.orientation !== "landscape")) return false;
  if (!Array.isArray(input.pages) || typeof input.activePageId !== "string") return false;
  if (!isObj(input.grid) || typeof input.grid.enabled !== "boolean" || typeof input.grid.stepMm !== "number") return false;
  if (typeof input.workspaceBg !== "string" || typeof input.workspaceGradientId !== "string" || typeof input.workspacePatternOn !== "boolean") return false;
  if (typeof input.pageBg !== "string") return false;
  if (input.brandSwatches !== undefined && (!Array.isArray(input.brandSwatches) || input.brandSwatches.length > 5)) return false;
  if (input.recentColors !== undefined && (!Array.isArray(input.recentColors) || input.recentColors.length > 8)) return false;
  if (!isObj(input.defaults)) return false;
  if (typeof input.defaults.fontFamily !== "string" || typeof input.defaults.textColor !== "string" || typeof input.defaults.strokeColor !== "string" || typeof input.defaults.fillColor !== "string" || typeof input.defaults.radius !== "number") return false;

  for (const p of input.pages) {
    if (!isObj(p) || typeof p.id !== "string" || typeof p.name !== "string" || !Array.isArray(p.nodes)) return false;
    for (const n of p.nodes) {
      if (!isObj(n)) return false;
      if (typeof n.id !== "string" || typeof n.type !== "string" || !NODE_TYPES.has(n.type as NodeType)) return false;
      if ([n.xMm, n.yMm, n.wMm, n.hMm, n.z].some((v) => typeof v !== "number")) return false;
      if (typeof n.visible !== "boolean" || typeof n.locked !== "boolean" || !isObj(n.props)) return false;
    }
  }
  return true;
}

export function saveToLocal(doc: Doc) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
}

export function loadFromLocal(): Doc | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return validateDoc(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function exportJSON(doc: Doc) {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `printforge-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importJSON(file: File): Promise<Doc> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!validateDoc(parsed)) throw new Error("Invalid document");
  return parsed;
}
