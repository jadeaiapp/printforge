export const PX_PER_MM = 3.7795275591;

export type PageSize = "A4" | "A5";
export type Orientation = "portrait" | "landscape";
export type Align = "left" | "center" | "right";

export type NodeType = "text" | "box" | "line";

export interface NodeBase {
  id: string;
  type: NodeType;
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
  z: number;
  locked?: boolean;
}

export interface TextNode extends NodeBase {
  type: "text";
  text: string;
  fontSize: number;
  align: Align;
}

export interface BoxNode extends NodeBase {
  type: "box";
  radius: number;
  stroke: string;
  fill: string;
}

export interface LineNode extends NodeBase {
  type: "line";
  stroke: string;
  thickness: number;
  direction: "horizontal" | "vertical";
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
  grid: {
    enabled: boolean;
    stepMm: number;
  };
  pages: Page[];
  activePageId: string;
}

export function createId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function pageDimensionsMm(pageSize: PageSize, orientation: Orientation): { wMm: number; hMm: number } {
  const base = pageSize === "A4" ? { wMm: 210, hMm: 297 } : { wMm: 148, hMm: 210 };
  return orientation === "portrait" ? base : { wMm: base.hMm, hMm: base.wMm };
}

export function mmToPx(mm: number): number {
  return mm * PX_PER_MM;
}

export function pxToMm(px: number): number {
  return px / PX_PER_MM;
}

export function snapMm(value: number, stepMm: number, enabled: boolean): number {
  if (!enabled) return value;
  return Math.round(value / stepMm) * stepMm;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function defaultDoc(): Doc {
  const page: Page = {
    id: createId("page"),
    name: "Page 1",
    nodes: [],
  };

  return {
    version: 1,
    pageSize: "A4",
    orientation: "portrait",
    zoom: 1,
    grid: {
      enabled: false,
      stepMm: 5,
    },
    pages: [page],
    activePageId: page.id,
  };
}
