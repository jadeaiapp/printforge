export const PX_PER_MM = 3.7795275591;

export type PageSize = "A4" | "A5";
export type Orientation = "portrait" | "landscape";
export type NodeType = "text" | "box" | "line";

export interface NodeBase {
  id: string;
  type: NodeType;
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
  z: number;
}

export interface TextNode extends NodeBase {
  type: "text";
  text: string;
  fontSize: number;
}

export interface BoxNode extends NodeBase {
  type: "box";
  fill: string;
  stroke: string;
  radius: number;
}

export interface LineNode extends NodeBase {
  type: "line";
  stroke: string;
  thickness: number;
}

export type Node = TextNode | BoxNode | LineNode;

export interface Page {
  id: string;
  name: string;
  nodes: Node[];
}

export interface Doc {
  version: number;
  pageSize: PageSize;
  orientation: Orientation;
  zoom: number;
  grid: { enabled: boolean; stepMm: number };
  pages: Page[];
  activePageId: string;
}

export function createId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function pageDimensionsMm(pageSize: PageSize, orientation: Orientation) {
  const base = pageSize === "A4" ? { wMm: 210, hMm: 297 } : { wMm: 148, hMm: 210 };
  return orientation === "portrait" ? base : { wMm: base.hMm, hMm: base.wMm };
}

export function mmToPx(mm: number) {
  return mm * PX_PER_MM;
}

export function pxToMm(px: number) {
  return px / PX_PER_MM;
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function snapMm(v: number, stepMm: number, enabled: boolean) {
  return enabled ? Math.round(v / stepMm) * stepMm : v;
}

export function defaultDoc(): Doc {
  const page = { id: createId("page"), name: "Page 1", nodes: [] };
  return {
    version: 1,
    pageSize: "A4",
    orientation: "portrait",
    zoom: 1,
    grid: { enabled: false, stepMm: 5 },
    pages: [page],
    activePageId: page.id,
  };
}
