export const PX_PER_MM = 3.7795275591;

export type PageSize = "A4" | "A5";
export type Orientation = "portrait" | "landscape";

export type NodeType =
  | "text"
  | "heading"
  | "paragraph"
  | "box"
  | "line"
  | "checkbox"
  | "checklist"
  | "bulletlist"
  | "divider"
  | "highlight"
  | "circle"
  | "roundedrect"
  | "datelabel"
  | "table"
  | "calendar"
  | "image"
  | "svg";

export interface NodeProps {
  text?: string;
  items?: string[];
  checked?: boolean;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 400 | 600 | 700;
  italic?: boolean;
  align?: "left" | "center" | "right";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  thickness?: number;
  color?: string;
  src?: string;
  rows?: number;
  cols?: number;
  month?: number;
  year?: number;
  objectFit?: "contain" | "cover";
  opacity?: number;
  lineHeight?: number;
  listStyle?: "bullet" | "checkbox";
  svgMarkup?: string;
  rotation?: number;
}


export interface Node {
  id: string;
  type: NodeType;
  name: string;
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
  z: number;
  visible: boolean;
  locked: boolean;
  props: NodeProps;
}

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
  grid: { enabled: boolean; stepMm: 2 | 5 | 10 };
  workspaceBg: string;
  workspaceGradientId: string;
  workspacePatternOn: boolean;
  pageBg: string;
  brandSwatches: string[];
  defaults: {
    fontFamily: string;
    textColor: string;
    strokeColor: string;
    fillColor: string;
    radius: number;
  };
  meta?: { projectName?: string };
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
    version: 3,
    pageSize: "A4",
    orientation: "portrait",
    zoom: 1,
    grid: { enabled: false, stepMm: 5 },
    workspaceBg: "#0b1220",
    workspaceGradientId: "minimal",
    workspacePatternOn: false,
    pageBg: "#ffffff",
    brandSwatches: ["#6366f1", "#14b8a6", "#f97316"],
    defaults: {
      fontFamily: "Inter,system-ui",
      textColor: "#111827",
      strokeColor: "#94a3b8",
      fillColor: "#e2e8f0",
      radius: 6,
    },
    meta: { projectName: "Untitled project" },
    pages: [page],
    activePageId: page.id,
  };
}
