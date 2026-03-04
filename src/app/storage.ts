import type { Doc } from "./model";

const STORAGE_KEY = "printforge_doc_v1";

export function saveToLocal(doc: Doc) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
}

export function loadFromLocal(): Doc | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.pages) || !parsed.activePageId) return null;
    return parsed;
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
  if (!parsed || !Array.isArray(parsed.pages) || !parsed.activePageId) {
    throw new Error("Invalid document");
  }
  return parsed;
}
