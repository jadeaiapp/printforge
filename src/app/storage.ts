import type { Doc, Node } from "./model";

const STORAGE_KEY = "printforge_doc_v1";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNode(value: unknown): value is Node {
  if (!isObject(value)) return false;
  const hasBase = typeof value.id === "string"
    && typeof value.type === "string"
    && typeof value.xMm === "number"
    && typeof value.yMm === "number"
    && typeof value.wMm === "number"
    && typeof value.hMm === "number"
    && typeof value.z === "number";

  if (!hasBase) return false;

  if (value.type === "text") {
    return typeof value.text === "string" && typeof value.fontSize === "number" && typeof value.align === "string";
  }

  if (value.type === "box") {
    return typeof value.radius === "number" && typeof value.stroke === "string" && typeof value.fill === "string";
  }

  if (value.type === "line") {
    return typeof value.stroke === "string" && typeof value.thickness === "number" && typeof value.direction === "string";
  }

  return false;
}

export function validateDoc(input: unknown): input is Doc {
  if (!isObject(input)) return false;
  if (input.version !== 1) return false;
  if (input.pageSize !== "A4" && input.pageSize !== "A5") return false;
  if (input.orientation !== "portrait" && input.orientation !== "landscape") return false;
  if (typeof input.zoom !== "number") return false;
  if (!isObject(input.grid)) return false;
  if (typeof input.grid.enabled !== "boolean" || typeof input.grid.stepMm !== "number") return false;
  if (!Array.isArray(input.pages) || input.pages.length === 0) return false;
  if (typeof input.activePageId !== "string") return false;

  for (const page of input.pages) {
    if (!isObject(page)) return false;
    if (typeof page.id !== "string" || typeof page.name !== "string" || !Array.isArray(page.nodes)) return false;
    for (const node of page.nodes) {
      if (!isNode(node)) return false;
    }
  }

  return true;
}

export function saveToLocal(doc: Doc): void {
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

export function exportJSON(doc: Doc): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `printforge-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importJSON(file: File): Promise<Doc> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file");
  }

  if (!validateDoc(parsed)) {
    throw new Error("JSON schema validation failed");
  }

  return parsed;
}
