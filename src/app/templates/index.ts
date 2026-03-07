import type { Doc, Node, NodeType, Page } from "../model";

export interface TemplateMeta {
  id: string;
  name: string;
  category: "Planner" | "Tracker" | "Study" | "Home" | "Finance";
  isPack: boolean;
  pagesCount: number;
  thumbnail: string;
}

type TemplateDefinition = TemplateMeta & { build: (ctx: BuildContext) => Page[] };

type BuildContext = {
  nextId: (prefix: string) => string;
};

const thumb = (label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='180' viewBox='0 0 300 180'><rect width='300' height='180' rx='14' fill='#0f172a'/><rect x='16' y='16' width='268' height='148' rx='10' fill='#1e293b' stroke='#475569'/><text x='28' y='52' fill='#e2e8f0' font-size='18' font-family='Inter,sans-serif' font-weight='700'>${label}</text><rect x='28' y='68' width='244' height='10' fill='#334155'/><rect x='28' y='86' width='190' height='10' fill='#334155'/><rect x='28' y='104' width='220' height='10' fill='#334155'/></svg>`)}`;

const textNode = (ctx: BuildContext, name: string, text: string, xMm: number, yMm: number, wMm: number, hMm: number, z: number, type: NodeType = "text"): Node => ({
  id: ctx.nextId("node"), type, name, xMm, yMm, wMm, hMm, z, visible: true, locked: false, groupId: null,
  props: { text, fontSize: type === "heading" ? 20 : 13, fontWeight: type === "heading" ? 700 : 400, lineHeight: 1.3 },
});

const boxNode = (ctx: BuildContext, name: string, xMm: number, yMm: number, wMm: number, hMm: number, z: number): Node => ({
  id: ctx.nextId("node"), type: "box", name, xMm, yMm, wMm, hMm, z, visible: true, locked: false, groupId: null,
  props: { fill: "#f8fafc", stroke: "#94a3b8", strokeWidth: 1, radius: 6 },
});

const tableNode = (ctx: BuildContext, name: string, xMm: number, yMm: number, wMm: number, hMm: number, z: number, rows = 8, cols = 4): Node => ({
  id: ctx.nextId("node"), type: "table", name, xMm, yMm, wMm, hMm, z, visible: true, locked: false, groupId: null,
  props: { rows, cols },
});

const checklistNode = (ctx: BuildContext, name: string, xMm: number, yMm: number, wMm: number, hMm: number, z: number, items: string[], listStyle: "checkbox" | "bullet"): Node => ({
  id: ctx.nextId("node"), type: listStyle === "checkbox" ? "checklist" : "bulletlist", name, xMm, yMm, wMm, hMm, z, visible: true, locked: false, groupId: null,
  props: { items, listStyle, lineHeight: 1.4 },
});

const page = (ctx: BuildContext, name: string, nodes: Node[]): Page => ({ id: ctx.nextId("page"), name, nodes });

const singleTemplates: TemplateDefinition[] = [
  {
    id: "daily-planner", name: "Daily Planner", category: "Planner", isPack: false, pagesCount: 1, thumbnail: thumb("Daily Planner"),
    build: (ctx) => [page(ctx, "Daily Planner", [
      textNode(ctx, "Title", "Daily Planner", 16, 14, 120, 12, 1, "heading"),
      boxNode(ctx, "Schedule Box", 16, 32, 118, 180, 2),
      tableNode(ctx, "Schedule", 20, 40, 110, 164, 3, 12, 2),
      textNode(ctx, "Todo Label", "To-dos", 140, 34, 50, 8, 4, "heading"),
      checklistNode(ctx, "Todos", 140, 46, 54, 110, 5, ["Top priority", "Second priority", "Quick win"], "checkbox"),
      textNode(ctx, "Notes Label", "Notes", 140, 162, 50, 8, 6, "heading"),
      boxNode(ctx, "Notes Box", 140, 172, 54, 40, 7),
    ])],
  },
  {
    id: "weekly-planner", name: "Weekly Planner", category: "Planner", isPack: false, pagesCount: 1, thumbnail: thumb("Weekly Planner"),
    build: (ctx) => [page(ctx, "Weekly Planner", [textNode(ctx, "Title", "Weekly Planner", 16, 14, 120, 12, 1, "heading"), tableNode(ctx, "Week Grid", 16, 34, 178, 170, 2, 8, 7), textNode(ctx, "Notes", "Notes", 16, 212, 40, 8, 3, "heading"), boxNode(ctx, "Notes Area", 16, 220, 178, 52, 4)])],
  },
  {
    id: "monthly-overview", name: "Monthly Overview", category: "Planner", isPack: false, pagesCount: 1, thumbnail: thumb("Monthly Overview"),
    build: (ctx) => [page(ctx, "Monthly Overview", [textNode(ctx, "Title", "Monthly Overview", 16, 14, 140, 12, 1, "heading"), tableNode(ctx, "Month Grid", 16, 34, 178, 164, 2, 6, 7), textNode(ctx, "Goals", "Goals", 16, 204, 60, 8, 3, "heading"), checklistNode(ctx, "Goals List", 16, 214, 178, 58, 4, ["Goal 1", "Goal 2", "Goal 3"], "checkbox")])],
  },
  {
    id: "habit-tracker-30", name: "Habit Tracker 30-day", category: "Tracker", isPack: false, pagesCount: 1, thumbnail: thumb("Habit Tracker"),
    build: (ctx) => [page(ctx, "Habit Tracker", [textNode(ctx, "Title", "30-Day Habit Tracker", 16, 14, 160, 12, 1, "heading"), tableNode(ctx, "Habit Grid", 16, 34, 178, 238, 2, 11, 31)])],
  },
  {
    id: "study-planner", name: "Study Planner", category: "Study", isPack: false, pagesCount: 1, thumbnail: thumb("Study Planner"),
    build: (ctx) => [page(ctx, "Study Planner", [textNode(ctx, "Title", "Study Planner", 16, 14, 130, 12, 1, "heading"), boxNode(ctx, "Pomodoro", 16, 34, 56, 46, 2), textNode(ctx, "Pomodoro Label", "Pomodoro", 20, 40, 46, 8, 3), tableNode(ctx, "Tasks", 78, 34, 116, 150, 4, 10, 3), textNode(ctx, "Priorities", "Priorities", 16, 88, 80, 8, 5, "heading"), checklistNode(ctx, "Priority List", 16, 98, 56, 86, 6, ["Exam review", "Homework", "Practice"], "checkbox"), textNode(ctx, "Notes", "Notes", 16, 190, 80, 8, 7, "heading"), boxNode(ctx, "Notes Box", 16, 200, 178, 72, 8)])],
  },
  {
    id: "reading-log", name: "Reading Log", category: "Study", isPack: false, pagesCount: 1, thumbnail: thumb("Reading Log"),
    build: (ctx) => [page(ctx, "Reading Log", [textNode(ctx, "Title", "Reading Log", 16, 14, 120, 12, 1, "heading"), tableNode(ctx, "Reading Table", 16, 34, 178, 238, 2, 14, 5)])],
  },
  {
    id: "meal-planner", name: "Meal Planner", category: "Home", isPack: false, pagesCount: 1, thumbnail: thumb("Meal Planner"),
    build: (ctx) => [page(ctx, "Meal Planner", [textNode(ctx, "Title", "Meal Planner", 16, 14, 120, 12, 1, "heading"), tableNode(ctx, "Meal Week", 16, 34, 120, 180, 2, 8, 4), textNode(ctx, "Grocery Label", "Grocery List", 142, 34, 50, 8, 3, "heading"), checklistNode(ctx, "Grocery", 142, 46, 52, 226, 4, ["Produce", "Dairy", "Pantry"], "checkbox")])],
  },
  {
    id: "chore-chart", name: "Chore Chart", category: "Home", isPack: false, pagesCount: 1, thumbnail: thumb("Chore Chart"),
    build: (ctx) => [page(ctx, "Chore Chart", [textNode(ctx, "Title", "Chore Chart", 16, 14, 120, 12, 1, "heading"), tableNode(ctx, "Chore Table", 16, 34, 178, 238, 2, 10, 8)])],
  },
  {
    id: "budget-snapshot", name: "Budget Snapshot", category: "Finance", isPack: false, pagesCount: 1, thumbnail: thumb("Budget Snapshot"),
    build: (ctx) => [page(ctx, "Budget Snapshot", [textNode(ctx, "Title", "Budget Snapshot", 16, 14, 150, 12, 1, "heading"), textNode(ctx, "Income", "Income", 16, 34, 60, 8, 2, "heading"), tableNode(ctx, "Income Table", 16, 44, 86, 94, 3, 6, 3), textNode(ctx, "Expense", "Expenses", 108, 34, 70, 8, 4, "heading"), tableNode(ctx, "Expense Table", 108, 44, 86, 94, 5, 6, 3), textNode(ctx, "Notes", "Notes", 16, 146, 50, 8, 6, "heading"), boxNode(ctx, "Notes Box", 16, 156, 178, 116, 7)])],
  },
  {
    id: "bills-tracker", name: "Bills Tracker", category: "Finance", isPack: false, pagesCount: 1, thumbnail: thumb("Bills Tracker"),
    build: (ctx) => [page(ctx, "Bills Tracker", [textNode(ctx, "Title", "Bills Tracker", 16, 14, 130, 12, 1, "heading"), tableNode(ctx, "Bills Table", 16, 34, 178, 238, 2, 14, 5)])],
  },
  {
    id: "water-tracker", name: "Water Tracker", category: "Tracker", isPack: false, pagesCount: 1, thumbnail: thumb("Water Tracker"),
    build: (ctx) => [page(ctx, "Water Tracker", [textNode(ctx, "Title", "Water Tracker", 16, 14, 130, 12, 1, "heading"), tableNode(ctx, "Water Grid", 16, 34, 178, 238, 2, 10, 12)])],
  },
  {
    id: "mood-tracker", name: "Mood Tracker", category: "Tracker", isPack: false, pagesCount: 1, thumbnail: thumb("Mood Tracker"),
    build: (ctx) => [page(ctx, "Mood Tracker", [textNode(ctx, "Title", "Mood Tracker", 16, 14, 130, 12, 1, "heading"), tableNode(ctx, "Mood Grid", 16, 34, 138, 238, 2, 10, 10), textNode(ctx, "Legend", "Legend", 160, 34, 40, 8, 3, "heading"), checklistNode(ctx, "Mood Legend", 160, 46, 34, 226, 4, ["Great", "Good", "Okay", "Low", "Tired"], "bullet")])],
  },
];

const makeCover = (ctx: BuildContext, title: string) => page(ctx, "Cover", [boxNode(ctx, "Cover Box", 16, 24, 178, 248, 1), textNode(ctx, "Cover Title", title, 28, 120, 154, 22, 2, "heading")]);

const packs: TemplateDefinition[] = [
  {
    id: "teacher-pack-lite", name: "Teacher Pack Lite", category: "Study", isPack: true, pagesCount: 5, thumbnail: thumb("Teacher Pack"),
    build: (ctx) => [makeCover(ctx, "Teacher Pack Lite"), page(ctx, "Weekly Planner", [tableNode(ctx, "Weekly", 16, 26, 178, 246, 1, 8, 7)]), page(ctx, "Grades", [tableNode(ctx, "Grades", 16, 26, 178, 246, 1, 14, 5)]), page(ctx, "Attendance", [tableNode(ctx, "Attendance", 16, 26, 178, 246, 1, 16, 8)]), page(ctx, "Notes", [boxNode(ctx, "Notes", 16, 26, 178, 246, 1)])],
  },
  {
    id: "student-study-pack", name: "Student Study Pack", category: "Study", isPack: true, pagesCount: 4, thumbnail: thumb("Student Pack"),
    build: (ctx) => [makeCover(ctx, "Student Study Pack"), page(ctx, "Weekly Study", [tableNode(ctx, "Weekly", 16, 26, 178, 246, 1, 8, 7)]), page(ctx, "Exam Tracker", [tableNode(ctx, "Exams", 16, 26, 178, 246, 1, 12, 5)]), page(ctx, "Reading Log", [tableNode(ctx, "Reading", 16, 26, 178, 246, 1, 14, 5)])],
  },
  {
    id: "fitness-pack", name: "Fitness Pack", category: "Tracker", isPack: true, pagesCount: 4, thumbnail: thumb("Fitness Pack"),
    build: (ctx) => [makeCover(ctx, "Fitness Pack"), page(ctx, "Workout Log", [tableNode(ctx, "Workouts", 16, 26, 178, 246, 1, 14, 5)]), page(ctx, "Measurements", [tableNode(ctx, "Measurements", 16, 26, 178, 246, 1, 12, 4)]), page(ctx, "Habit Tracker", [tableNode(ctx, "Habits", 16, 26, 178, 246, 1, 11, 31)])],
  },
  {
    id: "budget-pack", name: "Budget Pack", category: "Finance", isPack: true, pagesCount: 4, thumbnail: thumb("Budget Pack"),
    build: (ctx) => [makeCover(ctx, "Budget Pack"), page(ctx, "Monthly Budget", [tableNode(ctx, "Budget", 16, 26, 178, 246, 1, 14, 5)]), page(ctx, "Bills", [tableNode(ctx, "Bills", 16, 26, 178, 246, 1, 14, 5)]), page(ctx, "Savings Tracker", [tableNode(ctx, "Savings", 16, 26, 178, 246, 1, 12, 4)])],
  },
  {
    id: "meal-grocery-pack", name: "Meal & Grocery Pack", category: "Home", isPack: true, pagesCount: 4, thumbnail: thumb("Meal Pack"),
    build: (ctx) => [makeCover(ctx, "Meal & Grocery Pack"), page(ctx, "Meal Planner", [tableNode(ctx, "Meals", 16, 26, 178, 246, 1, 8, 4)]), page(ctx, "Grocery List", [checklistNode(ctx, "Groceries", 16, 26, 178, 246, 1, ["Produce", "Protein", "Dairy", "Pantry"], "checkbox")]), page(ctx, "Pantry Inventory", [tableNode(ctx, "Pantry", 16, 26, 178, 246, 1, 16, 4)])],
  },
  {
    id: "event-wedding-pack-lite", name: "Event/Wedding Pack Lite", category: "Planner", isPack: true, pagesCount: 4, thumbnail: thumb("Event Pack"),
    build: (ctx) => [makeCover(ctx, "Event Pack Lite"), page(ctx, "Checklist", [checklistNode(ctx, "Checklist", 16, 26, 178, 246, 1, ["Venue", "Guest list", "Vendors", "Timeline"], "checkbox")]), page(ctx, "Budget", [tableNode(ctx, "Event Budget", 16, 26, 178, 246, 1, 14, 4)]), page(ctx, "Vendors", [tableNode(ctx, "Vendors", 16, 26, 178, 246, 1, 14, 5)])],
  },
];

const templates = [...singleTemplates, ...packs];

export function listTemplates(): TemplateMeta[] {
  return templates.map(({ build: _build, ...meta }) => ({ ...meta }));
}

export function createDocFromTemplate(templateId: string): Doc {
  const template = templates.find((item) => item.id === templateId);
  if (!template) throw new Error(`Unknown template: ${templateId}`);

  let counter = 1;
  const ctx: BuildContext = {
    nextId: (prefix) => `${prefix}_${templateId.replace(/[^a-z0-9]/gi, "")}_${counter++}`,
  };

  const pages = template.build(ctx);
  if (!pages.length) throw new Error(`Template ${templateId} produced no pages`);

  return {
    version: 3,
    pageSize: "A4",
    orientation: "portrait",
    zoom: 1,
    grid: { enabled: false, stepMm: 5 },
    rulerOn: false,
    safeAreaOn: false,
    workspaceBg: "#e5e7eb",
    workspaceGradientId: "light",
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
    pages,
    activePageId: pages[0].id,
  };
}
