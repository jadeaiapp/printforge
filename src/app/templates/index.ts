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

const text = (ctx: BuildContext, name: string, txt: string, xMm: number, yMm: number, wMm: number, hMm: number, z: number, type: NodeType = "text", extra: Partial<Node["props"]> = {}): Node => ({
  id: ctx.nextId("node"), type, name, xMm, yMm, wMm, hMm, z, visible: true, locked: false, groupId: null,
  props: { text: txt, fontSize: type === "heading" ? 20 : 13, fontWeight: type === "heading" ? 700 : 400, lineHeight: 1.3, ...extra },
});

const box = (ctx: BuildContext, name: string, xMm: number, yMm: number, wMm: number, hMm: number, z: number, extra: Partial<Node["props"]> = {}): Node => ({
  id: ctx.nextId("node"), type: "box", name, xMm, yMm, wMm, hMm, z, visible: true, locked: false, groupId: null,
  props: { fill: "#f8fafc", stroke: "#94a3b8", strokeWidth: 1, radius: 6, ...extra },
});

const highlight = (ctx: BuildContext, name: string, xMm: number, yMm: number, wMm: number, hMm: number, z: number, extra: Partial<Node["props"]> = {}): Node => ({
  id: ctx.nextId("node"), type: "highlight", name, xMm, yMm, wMm, hMm, z, visible: true, locked: false, groupId: null,
  props: { fill: "#e0e7ff", stroke: "#818cf8", strokeWidth: 1, radius: 8, ...extra },
});

const divider = (ctx: BuildContext, name: string, xMm: number, yMm: number, wMm: number, z: number, extra: Partial<Node["props"]> = {}): Node => ({
  id: ctx.nextId("node"), type: "divider", name, xMm, yMm, wMm, hMm: 2, z, visible: true, locked: false, groupId: null,
  props: { thickness: 1, color: "#cbd5e1", ...extra },
});

const table = (ctx: BuildContext, name: string, xMm: number, yMm: number, wMm: number, hMm: number, z: number, rows = 8, cols = 4): Node => ({
  id: ctx.nextId("node"), type: "table", name, xMm, yMm, wMm, hMm, z, visible: true, locked: false, groupId: null,
  props: { rows, cols },
});

const checklist = (ctx: BuildContext, name: string, xMm: number, yMm: number, wMm: number, hMm: number, z: number, items: string[], listStyle: "checkbox" | "bullet" = "checkbox"): Node => ({
  id: ctx.nextId("node"), type: listStyle === "checkbox" ? "checklist" : "bulletlist", name, xMm, yMm, wMm, hMm, z, visible: true, locked: false, groupId: null,
  props: { items, listStyle, lineHeight: 1.4 },
});

const circle = (ctx: BuildContext, name: string, xMm: number, yMm: number, size: number, z: number, extra: Partial<Node["props"]> = {}): Node => ({
  id: ctx.nextId("node"), type: "circle", name, xMm, yMm, wMm: size, hMm: size, z, visible: true, locked: false, groupId: null,
  props: { fill: "#e0e7ff", stroke: "#818cf8", strokeWidth: 1, ...extra },
});

const pg = (ctx: BuildContext, name: string, nodes: Node[]): Page => ({ id: ctx.nextId("page"), name, nodes });

/* ── Single Templates ─────────────────────────────────────────── */

const singleTemplates: TemplateDefinition[] = [
  {
    id: "daily-planner", name: "Daily Planner", category: "Planner", isPack: false, pagesCount: 1, thumbnail: thumb("Daily Planner"),
    build: (ctx) => [pg(ctx, "Daily Planner", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#6366f1", stroke: "#6366f1", radius: 10 }),
      text(ctx, "Title", "Daily Planner", 18, 13, 120, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      text(ctx, "Date", "Date: _______________", 130, 14, 62, 8, 3, "text", { color: "#e0e7ff", fontSize: 11, align: "right" }),
      divider(ctx, "Sep1", 12, 32, 186, 4),
      text(ctx, "ScheduleLabel", "Schedule", 14, 36, 60, 8, 5, "heading", { fontSize: 14, color: "#6366f1" }),
      box(ctx, "ScheduleBox", 14, 46, 112, 164, 6, { fill: "#fafafe", stroke: "#c7d2fe", radius: 8 }),
      table(ctx, "Schedule", 18, 50, 104, 156, 7, 12, 2),
      text(ctx, "TodoLabel", "To-Do", 132, 36, 60, 8, 8, "heading", { fontSize: 14, color: "#6366f1" }),
      box(ctx, "TodoBox", 132, 46, 64, 100, 9, { fill: "#fafafe", stroke: "#c7d2fe", radius: 8 }),
      checklist(ctx, "Todos", 136, 52, 56, 88, 10, ["Top priority", "Second priority", "Quick win", "Follow up", "Review notes"]),
      text(ctx, "NotesLabel", "Notes", 132, 152, 60, 8, 11, "heading", { fontSize: 14, color: "#6366f1" }),
      box(ctx, "NotesBox", 132, 162, 64, 48, 12, { fill: "#fafafe", stroke: "#c7d2fe", radius: 8 }),
      text(ctx, "NotesPlaceholder", "Write your notes here...", 136, 168, 56, 36, 13, "text", { fontSize: 10, color: "#94a3b8" }),
      divider(ctx, "Sep2", 12, 218, 186, 14),
      text(ctx, "PrioritiesLabel", "Top 3 Priorities", 14, 222, 80, 8, 15, "heading", { fontSize: 14, color: "#6366f1" }),
      highlight(ctx, "P1", 14, 232, 58, 20, 16, { fill: "#fef3c7", stroke: "#fbbf24", radius: 6 }),
      text(ctx, "P1Text", "1. ___________", 18, 236, 50, 12, 17, "text", { fontSize: 11 }),
      highlight(ctx, "P2", 76, 232, 58, 20, 18, { fill: "#dcfce7", stroke: "#4ade80", radius: 6 }),
      text(ctx, "P2Text", "2. ___________", 80, 236, 50, 12, 19, "text", { fontSize: 11 }),
      highlight(ctx, "P3", 138, 232, 58, 20, 20, { fill: "#e0e7ff", stroke: "#818cf8", radius: 6 }),
      text(ctx, "P3Text", "3. ___________", 142, 236, 50, 12, 21, "text", { fontSize: 11 }),
      text(ctx, "Gratitude", "Today I'm grateful for:", 14, 260, 120, 8, 22, "text", { fontSize: 11, color: "#6366f1", italic: true }),
      box(ctx, "GratBox", 14, 268, 182, 18, 23, { fill: "#f5f3ff", stroke: "#c7d2fe", radius: 6 }),
    ])],
  },
  {
    id: "weekly-planner", name: "Weekly Planner", category: "Planner", isPack: false, pagesCount: 1, thumbnail: thumb("Weekly Planner"),
    build: (ctx) => [pg(ctx, "Weekly Planner", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#0f766e", stroke: "#0f766e", radius: 10 }),
      text(ctx, "Title", "Weekly Planner", 18, 13, 140, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      text(ctx, "Week", "Week of: ___________", 120, 14, 72, 8, 3, "text", { color: "#ccfbf1", fontSize: 11, align: "right" }),
      divider(ctx, "Sep", 12, 32, 186, 4),
      ...[["Mon", 0], ["Tue", 1], ["Wed", 2], ["Thu", 3], ["Fri", 4], ["Sat", 5], ["Sun", 6]].map(([day, i]) => {
        const col = (i as number) < 4 ? 0 : 1;
        const row = (i as number) < 4 ? (i as number) : (i as number) - 4;
        const x = 14 + col * 94;
        const y = 38 + row * 54;
        return [
          highlight(ctx, `${day}Label`, x, y, 86, 10, 5 + (i as number) * 3, { fill: "#f0fdfa", stroke: "#5eead4", radius: 4 }),
          text(ctx, `${day}Title`, day as string, x + 2, y + 1, 30, 8, 6 + (i as number) * 3, "text", { fontSize: 11, fontWeight: 700, color: "#0f766e" }),
          box(ctx, `${day}Box`, x, y + 12, 86, 38, 7 + (i as number) * 3, { fill: "#ffffff", stroke: "#99f6e4", radius: 6 }),
        ];
      }).flat(),
      text(ctx, "NotesLabel", "Weekly Notes", 108, 200, 80, 8, 30, "heading", { fontSize: 14, color: "#0f766e" }),
      box(ctx, "NotesBox", 108, 210, 88, 72, 31, { fill: "#f0fdfa", stroke: "#99f6e4", radius: 8 }),
      text(ctx, "GoalsLabel", "Weekly Goals", 14, 260, 80, 8, 32, "heading", { fontSize: 14, color: "#0f766e" }),
      checklist(ctx, "Goals", 14, 270, 182, 18, 33, ["Goal 1", "Goal 2", "Goal 3"]),
    ])],
  },
  {
    id: "monthly-overview", name: "Monthly Overview", category: "Planner", isPack: false, pagesCount: 1, thumbnail: thumb("Monthly Overview"),
    build: (ctx) => [pg(ctx, "Monthly Overview", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#7c3aed", stroke: "#7c3aed", radius: 10 }),
      text(ctx, "Title", "Monthly Overview", 18, 13, 150, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      divider(ctx, "Sep", 12, 32, 186, 3),
      text(ctx, "CalLabel", "Calendar", 14, 36, 80, 8, 4, "heading", { fontSize: 14, color: "#7c3aed" }),
      table(ctx, "MonthGrid", 14, 46, 120, 120, 5, 6, 7),
      text(ctx, "FocusLabel", "Focus Areas", 140, 36, 60, 8, 6, "heading", { fontSize: 14, color: "#7c3aed" }),
      highlight(ctx, "Focus1", 140, 48, 54, 24, 7, { fill: "#faf5ff", stroke: "#c084fc", radius: 6 }),
      text(ctx, "F1", "Health & Fitness", 144, 54, 46, 12, 8, "text", { fontSize: 10, color: "#7c3aed" }),
      highlight(ctx, "Focus2", 140, 76, 54, 24, 9, { fill: "#fef3c7", stroke: "#fbbf24", radius: 6 }),
      text(ctx, "F2", "Career / Study", 144, 82, 46, 12, 10, "text", { fontSize: 10, color: "#92400e" }),
      highlight(ctx, "Focus3", 140, 104, 54, 24, 11, { fill: "#dcfce7", stroke: "#4ade80", radius: 6 }),
      text(ctx, "F3", "Relationships", 144, 110, 46, 12, 12, "text", { fontSize: 10, color: "#166534" }),
      highlight(ctx, "Focus4", 140, 132, 54, 24, 13, { fill: "#e0e7ff", stroke: "#818cf8", radius: 6 }),
      text(ctx, "F4", "Personal Growth", 144, 138, 46, 12, 14, "text", { fontSize: 10, color: "#4338ca" }),
      divider(ctx, "Sep2", 12, 172, 186, 15),
      text(ctx, "GoalsLabel", "Monthly Goals", 14, 178, 80, 8, 16, "heading", { fontSize: 14, color: "#7c3aed" }),
      checklist(ctx, "Goals", 14, 190, 88, 50, 17, ["Goal 1", "Goal 2", "Goal 3", "Goal 4"]),
      text(ctx, "HabitsLabel", "Habit Tracker", 108, 178, 80, 8, 18, "heading", { fontSize: 14, color: "#7c3aed" }),
      table(ctx, "Habits", 108, 190, 88, 50, 19, 5, 7),
      text(ctx, "ReflLabel", "Month-End Reflection", 14, 248, 120, 8, 20, "heading", { fontSize: 14, color: "#7c3aed" }),
      box(ctx, "ReflBox", 14, 258, 182, 28, 21, { fill: "#faf5ff", stroke: "#c084fc", radius: 8 }),
    ])],
  },
  {
    id: "habit-tracker-30", name: "Habit Tracker 30-day", category: "Tracker", isPack: false, pagesCount: 1, thumbnail: thumb("Habit Tracker"),
    build: (ctx) => [pg(ctx, "Habit Tracker", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#be123c", stroke: "#be123c", radius: 10 }),
      text(ctx, "Title", "30-Day Habit Tracker", 18, 13, 150, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      text(ctx, "Month", "Month: _________", 130, 14, 62, 8, 3, "text", { color: "#fecdd3", fontSize: 11, align: "right" }),
      divider(ctx, "Sep", 12, 32, 186, 4),
      text(ctx, "Inst", "Write habits in the left column, mark each day with ✓", 14, 36, 180, 8, 5, "text", { fontSize: 10, color: "#94a3b8", italic: true }),
      box(ctx, "GridBox", 12, 46, 186, 200, 6, { fill: "#fff1f2", stroke: "#fecdd3", radius: 8 }),
      table(ctx, "HabitGrid", 16, 50, 178, 192, 7, 8, 31),
      divider(ctx, "Sep2", 12, 252, 186, 8),
      text(ctx, "Summary", "Monthly Summary", 14, 258, 100, 8, 9, "heading", { fontSize: 13, color: "#be123c" }),
      highlight(ctx, "S1", 14, 268, 58, 16, 10, { fill: "#dcfce7", stroke: "#4ade80", radius: 6 }),
      text(ctx, "S1T", "Best streak: ___", 18, 271, 50, 10, 11, "text", { fontSize: 9 }),
      highlight(ctx, "S2", 76, 268, 58, 16, 12, { fill: "#fef3c7", stroke: "#fbbf24", radius: 6 }),
      text(ctx, "S2T", "Missed days: ___", 80, 271, 50, 10, 13, "text", { fontSize: 9 }),
      highlight(ctx, "S3", 138, 268, 58, 16, 14, { fill: "#e0e7ff", stroke: "#818cf8", radius: 6 }),
      text(ctx, "S3T", "Completion: ___%", 142, 271, 50, 10, 15, "text", { fontSize: 9 }),
    ])],
  },
  {
    id: "study-planner", name: "Study Planner", category: "Study", isPack: false, pagesCount: 1, thumbnail: thumb("Study Planner"),
    build: (ctx) => [pg(ctx, "Study Planner", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#1d4ed8", stroke: "#1d4ed8", radius: 10 }),
      text(ctx, "Title", "Study Planner", 18, 13, 120, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      text(ctx, "Date", "Date: ___________", 130, 14, 62, 8, 3, "text", { color: "#bfdbfe", fontSize: 11, align: "right" }),
      divider(ctx, "Sep", 12, 32, 186, 4),
      text(ctx, "SubjectsLabel", "Today's Subjects", 14, 36, 100, 8, 5, "heading", { fontSize: 14, color: "#1d4ed8" }),
      ...[0, 1, 2].map((i) => [
        highlight(ctx, `Sub${i}`, 14 + i * 62, 46, 58, 22, 6 + i * 2, { fill: ["#dbeafe", "#fef3c7", "#dcfce7"][i], stroke: ["#93c5fd", "#fbbf24", "#86efac"][i], radius: 6 }),
        text(ctx, `Sub${i}T`, `Subject ${i + 1}`, 18 + i * 62, 52, 50, 10, 7 + i * 2, "text", { fontSize: 10, color: "#334155" }),
      ]).flat(),
      text(ctx, "TasksLabel", "Tasks & Assignments", 14, 74, 120, 8, 12, "heading", { fontSize: 14, color: "#1d4ed8" }),
      box(ctx, "TasksBox", 14, 84, 180, 80, 13, { fill: "#eff6ff", stroke: "#93c5fd", radius: 8 }),
      checklist(ctx, "Tasks", 20, 90, 168, 68, 14, ["Read chapter 5", "Complete worksheet", "Review flashcards", "Practice problems", "Submit assignment"]),
      text(ctx, "PomodoroLabel", "Pomodoro Tracker", 14, 170, 80, 8, 15, "heading", { fontSize: 14, color: "#1d4ed8" }),
      ...[0, 1, 2, 3, 4, 5].map((i) => circle(ctx, `Pom${i}`, 14 + i * 18, 180, 14, 16 + i, { fill: "#eff6ff", stroke: "#93c5fd" })),
      text(ctx, "PomNote", "Color in each circle after 25 min focus", 14, 198, 160, 8, 22, "text", { fontSize: 9, color: "#94a3b8", italic: true }),
      divider(ctx, "Sep2", 12, 208, 186, 23),
      text(ctx, "NotesLabel", "Study Notes", 14, 214, 80, 8, 24, "heading", { fontSize: 14, color: "#1d4ed8" }),
      box(ctx, "NotesBox", 14, 224, 180, 62, 25, { fill: "#eff6ff", stroke: "#93c5fd", radius: 8 }),
    ])],
  },
  {
    id: "reading-log", name: "Reading Log", category: "Study", isPack: false, pagesCount: 1, thumbnail: thumb("Reading Log"),
    build: (ctx) => [pg(ctx, "Reading Log", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#92400e", stroke: "#92400e", radius: 10 }),
      text(ctx, "Title", "Reading Log", 18, 13, 120, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      divider(ctx, "Sep", 12, 32, 186, 3),
      text(ctx, "Current", "Currently Reading", 14, 38, 100, 8, 4, "heading", { fontSize: 14, color: "#92400e" }),
      box(ctx, "BookBox", 14, 48, 180, 36, 5, { fill: "#fefce8", stroke: "#fde68a", radius: 8 }),
      text(ctx, "BookTitle", "Book: ______________________", 20, 52, 120, 8, 6, "text", { fontSize: 11, fontWeight: 600 }),
      text(ctx, "BookAuthor", "Author: _____________________", 20, 62, 120, 8, 7, "text", { fontSize: 10, color: "#78716c" }),
      text(ctx, "BookPages", "Pages: ___/___", 20, 72, 60, 8, 8, "text", { fontSize: 10, color: "#78716c" }),
      highlight(ctx, "Progress", 150, 52, 38, 26, 9, { fill: "#dcfce7", stroke: "#86efac", radius: 6 }),
      text(ctx, "Pct", "__%", 156, 58, 26, 12, 10, "text", { fontSize: 14, fontWeight: 700, color: "#166534", align: "center" }),
      divider(ctx, "Sep2", 12, 90, 186, 11),
      text(ctx, "LogLabel", "Books Read", 14, 96, 80, 8, 12, "heading", { fontSize: 14, color: "#92400e" }),
      box(ctx, "LogBox", 14, 106, 180, 140, 13, { fill: "#fffbeb", stroke: "#fde68a", radius: 8 }),
      table(ctx, "BookTable", 18, 110, 172, 132, 14, 10, 5),
      divider(ctx, "Sep3", 12, 252, 186, 15),
      text(ctx, "WishLabel", "Wish List", 14, 258, 80, 8, 16, "heading", { fontSize: 14, color: "#92400e" }),
      checklist(ctx, "WishList", 14, 268, 180, 18, 17, ["Book title 1", "Book title 2", "Book title 3"], "bullet"),
    ])],
  },
  {
    id: "meal-planner", name: "Meal Planner", category: "Home", isPack: false, pagesCount: 1, thumbnail: thumb("Meal Planner"),
    build: (ctx) => [pg(ctx, "Meal Planner", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#15803d", stroke: "#15803d", radius: 10 }),
      text(ctx, "Title", "Weekly Meal Planner", 18, 13, 140, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      divider(ctx, "Sep", 12, 32, 186, 3),
      ...[["Mon", 0], ["Tue", 1], ["Wed", 2], ["Thu", 3], ["Fri", 4], ["Sat", 5], ["Sun", 6]].map(([day, i]) => {
        const y = 38 + (i as number) * 26;
        return [
          highlight(ctx, `${day}Lbl`, 14, y, 28, 22, 4 + (i as number) * 2, { fill: "#dcfce7", stroke: "#86efac", radius: 4 }),
          text(ctx, `${day}Day`, day as string, 16, y + 5, 24, 10, 5 + (i as number) * 2, "text", { fontSize: 10, fontWeight: 700, color: "#166534", align: "center" }),
          box(ctx, `${day}Meals`, 44, y, 150, 22, 6 + (i as number) * 2, { fill: "#f0fdf4", stroke: "#bbf7d0", radius: 4 }),
        ];
      }).flat(),
      divider(ctx, "Sep2", 12, 224, 186, 22),
      text(ctx, "GroceryLabel", "Grocery List", 14, 230, 90, 8, 23, "heading", { fontSize: 14, color: "#15803d" }),
      box(ctx, "GroceryBox", 14, 240, 88, 46, 24, { fill: "#f0fdf4", stroke: "#bbf7d0", radius: 8 }),
      checklist(ctx, "Groceries", 18, 244, 80, 38, 25, ["Vegetables", "Fruits", "Protein", "Dairy", "Pantry"]),
      text(ctx, "PrepLabel", "Meal Prep Notes", 108, 230, 90, 8, 26, "heading", { fontSize: 14, color: "#15803d" }),
      box(ctx, "PrepBox", 108, 240, 88, 46, 27, { fill: "#f0fdf4", stroke: "#bbf7d0", radius: 8 }),
    ])],
  },
  {
    id: "chore-chart", name: "Chore Chart", category: "Home", isPack: false, pagesCount: 1, thumbnail: thumb("Chore Chart"),
    build: (ctx) => [pg(ctx, "Chore Chart", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#0369a1", stroke: "#0369a1", radius: 10 }),
      text(ctx, "Title", "Weekly Chore Chart", 18, 13, 150, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      divider(ctx, "Sep", 12, 32, 186, 3),
      text(ctx, "FamilyLabel", "Family Members", 14, 36, 100, 8, 4, "text", { fontSize: 12, color: "#0369a1", fontWeight: 700 }),
      ...[0, 1, 2, 3].map((i) =>
        highlight(ctx, `Member${i}`, 14 + i * 46, 46, 42, 14, 5 + i, { fill: ["#dbeafe", "#dcfce7", "#fef3c7", "#fce7f3"][i], stroke: ["#93c5fd", "#86efac", "#fbbf24", "#f9a8d4"][i], radius: 6 })
      ),
      divider(ctx, "Sep2", 12, 66, 186, 10),
      box(ctx, "ChoreBox", 12, 72, 186, 176, 11, { fill: "#f0f9ff", stroke: "#bae6fd", radius: 8 }),
      table(ctx, "ChoreTable", 16, 76, 178, 168, 12, 10, 8),
      divider(ctx, "Sep3", 12, 254, 186, 13),
      text(ctx, "Rewards", "Weekly Reward: ________________________________", 14, 260, 180, 8, 14, "text", { fontSize: 12, color: "#0369a1", fontWeight: 600 }),
      highlight(ctx, "RewardBox", 14, 270, 182, 16, 15, { fill: "#dbeafe", stroke: "#93c5fd", radius: 6 }),
    ])],
  },
  {
    id: "budget-snapshot", name: "Budget Snapshot", category: "Finance", isPack: false, pagesCount: 1, thumbnail: thumb("Budget Snapshot"),
    build: (ctx) => [pg(ctx, "Budget Snapshot", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#4f46e5", stroke: "#4f46e5", radius: 10 }),
      text(ctx, "Title", "Monthly Budget", 18, 13, 140, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      text(ctx, "Period", "Month: _________", 130, 14, 62, 8, 3, "text", { color: "#c7d2fe", fontSize: 11, align: "right" }),
      divider(ctx, "Sep", 12, 32, 186, 4),
      text(ctx, "IncomeLabel", "Income", 14, 38, 60, 8, 5, "heading", { fontSize: 14, color: "#16a34a" }),
      box(ctx, "IncomeBox", 14, 48, 86, 80, 6, { fill: "#f0fdf4", stroke: "#86efac", radius: 8 }),
      table(ctx, "IncomeTbl", 18, 52, 78, 72, 7, 5, 2),
      text(ctx, "ExpenseLabel", "Expenses", 108, 38, 80, 8, 8, "heading", { fontSize: 14, color: "#dc2626" }),
      box(ctx, "ExpenseBox", 108, 48, 88, 80, 9, { fill: "#fef2f2", stroke: "#fca5a5", radius: 8 }),
      table(ctx, "ExpenseTbl", 112, 52, 80, 72, 10, 5, 2),
      divider(ctx, "Sep2", 12, 134, 186, 11),
      text(ctx, "SummaryLabel", "Summary", 14, 140, 80, 8, 12, "heading", { fontSize: 14, color: "#4f46e5" }),
      highlight(ctx, "TotalIncome", 14, 152, 58, 24, 13, { fill: "#dcfce7", stroke: "#4ade80", radius: 6 }),
      text(ctx, "TI", "Total Income\n$_____", 18, 154, 50, 18, 14, "text", { fontSize: 10, color: "#166534" }),
      highlight(ctx, "TotalExp", 76, 152, 58, 24, 15, { fill: "#fef2f2", stroke: "#fca5a5", radius: 6 }),
      text(ctx, "TE", "Total Expense\n$_____", 80, 154, 50, 18, 16, "text", { fontSize: 10, color: "#dc2626" }),
      highlight(ctx, "Balance", 138, 152, 58, 24, 17, { fill: "#dbeafe", stroke: "#93c5fd", radius: 6 }),
      text(ctx, "Bal", "Balance\n$_____", 142, 154, 50, 18, 18, "text", { fontSize: 10, color: "#1d4ed8" }),
      divider(ctx, "Sep3", 12, 182, 186, 19),
      text(ctx, "SavingsLabel", "Savings Goals", 14, 188, 100, 8, 20, "heading", { fontSize: 14, color: "#4f46e5" }),
      box(ctx, "SavingsBox", 14, 198, 182, 36, 21, { fill: "#eef2ff", stroke: "#c7d2fe", radius: 8 }),
      checklist(ctx, "SavingGoals", 20, 202, 172, 28, 22, ["Emergency fund", "Vacation", "New gadget"]),
      text(ctx, "NotesLabel", "Notes", 14, 242, 80, 8, 23, "heading", { fontSize: 14, color: "#4f46e5" }),
      box(ctx, "NotesBox", 14, 252, 182, 34, 24, { fill: "#eef2ff", stroke: "#c7d2fe", radius: 8 }),
    ])],
  },
  {
    id: "bills-tracker", name: "Bills Tracker", category: "Finance", isPack: false, pagesCount: 1, thumbnail: thumb("Bills Tracker"),
    build: (ctx) => [pg(ctx, "Bills Tracker", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#b91c1c", stroke: "#b91c1c", radius: 10 }),
      text(ctx, "Title", "Bills & Subscriptions", 18, 13, 150, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      divider(ctx, "Sep", 12, 32, 186, 3),
      text(ctx, "MonthlyLabel", "Monthly Bills", 14, 38, 80, 8, 4, "heading", { fontSize: 14, color: "#b91c1c" }),
      box(ctx, "BillsBox", 14, 48, 180, 100, 5, { fill: "#fef2f2", stroke: "#fca5a5", radius: 8 }),
      table(ctx, "BillsTable", 18, 52, 172, 92, 6, 8, 4),
      divider(ctx, "Sep2", 12, 154, 186, 7),
      text(ctx, "SubsLabel", "Subscriptions", 14, 160, 80, 8, 8, "heading", { fontSize: 14, color: "#b91c1c" }),
      box(ctx, "SubsBox", 14, 170, 180, 68, 9, { fill: "#fff1f2", stroke: "#fecdd3", radius: 8 }),
      table(ctx, "SubsTable", 18, 174, 172, 60, 10, 6, 4),
      divider(ctx, "Sep3", 12, 244, 186, 11),
      text(ctx, "TotalLabel", "Total Monthly: $_______", 14, 250, 100, 8, 12, "text", { fontSize: 13, fontWeight: 700, color: "#b91c1c" }),
      text(ctx, "PaidLabel", "Paid this month:", 14, 264, 100, 8, 13, "text", { fontSize: 12, color: "#334155" }),
      highlight(ctx, "PaidBox", 14, 274, 40, 12, 14, { fill: "#dcfce7", stroke: "#4ade80", radius: 4 }),
      text(ctx, "PaidYes", "Yes: __", 18, 276, 32, 8, 15, "text", { fontSize: 9 }),
      highlight(ctx, "PaidNo", 58, 274, 40, 12, 16, { fill: "#fef2f2", stroke: "#fca5a5", radius: 4 }),
      text(ctx, "PaidNoT", "No: __", 62, 276, 32, 8, 17, "text", { fontSize: 9 }),
    ])],
  },
  {
    id: "water-tracker", name: "Water Tracker", category: "Tracker", isPack: false, pagesCount: 1, thumbnail: thumb("Water Tracker"),
    build: (ctx) => [pg(ctx, "Water Tracker", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#0284c7", stroke: "#0284c7", radius: 10 }),
      text(ctx, "Title", "Water Tracker", 18, 13, 120, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      text(ctx, "Goal", "Daily goal: 8 glasses", 120, 14, 72, 8, 3, "text", { color: "#bae6fd", fontSize: 11, align: "right" }),
      divider(ctx, "Sep", 12, 32, 186, 4),
      text(ctx, "Inst", "Color in a drop for each glass of water", 14, 36, 180, 8, 5, "text", { fontSize: 10, color: "#94a3b8", italic: true }),
      ...[...Array(7)].map((_, row) => {
        const day = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][row];
        const y = 48 + row * 30;
        return [
          highlight(ctx, `${day}Lbl`, 14, y, 28, 24, 6 + row * 2, { fill: "#e0f2fe", stroke: "#7dd3fc", radius: 4 }),
          text(ctx, `${day}Day`, day, 16, y + 6, 24, 10, 7 + row * 2, "text", { fontSize: 10, fontWeight: 700, color: "#0369a1", align: "center" }),
          ...[...Array(8)].map((_, col) => circle(ctx, `D${row}C${col}`, 46 + col * 18, y + 2, 16, 20 + row * 8 + col, { fill: "#f0f9ff", stroke: "#7dd3fc" })),
        ];
      }).flat(),
      divider(ctx, "Sep2", 12, 262, 186, 80),
      text(ctx, "WeeklyTotal", "Weekly total: ___/56 glasses", 14, 268, 180, 8, 81, "text", { fontSize: 12, fontWeight: 600, color: "#0284c7" }),
    ])],
  },
  {
    id: "mood-tracker", name: "Mood Tracker", category: "Tracker", isPack: false, pagesCount: 1, thumbnail: thumb("Mood Tracker"),
    build: (ctx) => [pg(ctx, "Mood Tracker", [
      highlight(ctx, "Header", 12, 10, 186, 18, 1, { fill: "#c026d3", stroke: "#c026d3", radius: 10 }),
      text(ctx, "Title", "Monthly Mood Tracker", 18, 13, 150, 12, 2, "heading", { color: "#ffffff", fontSize: 18 }),
      divider(ctx, "Sep", 12, 32, 186, 3),
      text(ctx, "Legend", "Legend", 14, 36, 40, 8, 4, "heading", { fontSize: 12, color: "#c026d3" }),
      ...[["Great", "#dcfce7", "#4ade80"], ["Good", "#dbeafe", "#93c5fd"], ["Okay", "#fef3c7", "#fbbf24"], ["Low", "#fce7f3", "#f9a8d4"], ["Tired", "#f1f5f9", "#94a3b8"]].map(([label, fill, stroke], i) => [
        highlight(ctx, `L${i}`, 14 + i * 38, 46, 34, 14, 5 + i * 2, { fill, stroke, radius: 4 }),
        text(ctx, `L${i}T`, label as string, 16 + i * 38, 48, 30, 10, 6 + i * 2, "text", { fontSize: 8, align: "center", color: "#334155" }),
      ]).flat(),
      divider(ctx, "Sep2", 12, 64, 186, 16),
      box(ctx, "GridBox", 12, 70, 186, 170, 17, { fill: "#fdf4ff", stroke: "#f0abfc", radius: 8 }),
      table(ctx, "MoodGrid", 16, 74, 178, 162, 18, 6, 7),
      divider(ctx, "Sep3", 12, 246, 186, 19),
      text(ctx, "NotesLabel", "Monthly Reflection", 14, 252, 100, 8, 20, "heading", { fontSize: 13, color: "#c026d3" }),
      box(ctx, "NotesBox", 14, 262, 182, 24, 21, { fill: "#fdf4ff", stroke: "#f0abfc", radius: 8 }),
    ])],
  },
];

/* ── Packs ─────────────────────────────────────────── */

const makeCover = (ctx: BuildContext, title: string, color: string) => pg(ctx, "Cover", [
  box(ctx, "CoverBg", 0, 0, 210, 297, 1, { fill: "#f8fafc", stroke: "transparent", radius: 0 }),
  highlight(ctx, "CoverAccent", 30, 80, 150, 80, 2, { fill: color, stroke: color, radius: 16 }),
  text(ctx, "CoverTitle", title, 40, 100, 130, 30, 3, "heading", { color: "#ffffff", fontSize: 26, align: "center" }),
  text(ctx, "CoverSub", "PrintForge Template", 40, 135, 130, 12, 4, "text", { color: "#ffffff", fontSize: 12, align: "center" }),
  divider(ctx, "CoverDiv", 60, 200, 90, 5, { color }),
  text(ctx, "CoverName", "Name: ____________________", 50, 220, 110, 10, 6, "text", { fontSize: 12, color: "#64748b", align: "center" }),
]);

const packs: TemplateDefinition[] = [
  {
    id: "teacher-pack-lite", name: "Teacher Pack Lite", category: "Study", isPack: true, pagesCount: 5, thumbnail: thumb("Teacher Pack"),
    build: (ctx) => [
      makeCover(ctx, "Teacher Pack Lite", "#1d4ed8"),
      pg(ctx, "Weekly Planner", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#1d4ed8", stroke: "#1d4ed8", radius: 8 }),
        text(ctx, "T", "Weekly Lesson Planner", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        table(ctx, "Week", 14, 30, 180, 200, 3, 8, 6),
        text(ctx, "Notes", "Notes", 14, 236, 60, 8, 4, "heading", { fontSize: 12, color: "#1d4ed8" }),
        box(ctx, "NB", 14, 246, 180, 40, 5, { fill: "#eff6ff", stroke: "#93c5fd", radius: 6 }),
      ]),
      pg(ctx, "Grades", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#1d4ed8", stroke: "#1d4ed8", radius: 8 }),
        text(ctx, "T", "Grade Tracker", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "GB", 14, 30, 180, 210, 3, { fill: "#eff6ff", stroke: "#93c5fd", radius: 8 }),
        table(ctx, "Grades", 18, 34, 172, 202, 4, 12, 5),
      ]),
      pg(ctx, "Attendance", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#1d4ed8", stroke: "#1d4ed8", radius: 8 }),
        text(ctx, "T", "Attendance Sheet", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        table(ctx, "Att", 14, 30, 180, 250, 3, 16, 8),
      ]),
      pg(ctx, "Notes", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#1d4ed8", stroke: "#1d4ed8", radius: 8 }),
        text(ctx, "T", "Teacher Notes", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "NB", 14, 30, 180, 254, 3, { fill: "#eff6ff", stroke: "#93c5fd", radius: 8 }),
      ]),
    ],
  },
  {
    id: "student-study-pack", name: "Student Study Pack", category: "Study", isPack: true, pagesCount: 4, thumbnail: thumb("Student Pack"),
    build: (ctx) => [
      makeCover(ctx, "Student Study Pack", "#7c3aed"),
      pg(ctx, "Weekly Study", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#7c3aed", stroke: "#7c3aed", radius: 8 }),
        text(ctx, "T", "Weekly Study Schedule", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        table(ctx, "Week", 14, 30, 180, 200, 3, 8, 6),
        checklist(ctx, "Goals", 14, 238, 180, 40, 4, ["Complete assignments", "Review for quiz", "Study group"]),
      ]),
      pg(ctx, "Exam Tracker", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#7c3aed", stroke: "#7c3aed", radius: 8 }),
        text(ctx, "T", "Exam Tracker", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "EB", 14, 30, 180, 200, 3, { fill: "#faf5ff", stroke: "#c084fc", radius: 8 }),
        table(ctx, "Exams", 18, 34, 172, 192, 4, 10, 5),
      ]),
      pg(ctx, "Reading Log", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#7c3aed", stroke: "#7c3aed", radius: 8 }),
        text(ctx, "T", "Reading Log", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "RB", 14, 30, 180, 200, 3, { fill: "#faf5ff", stroke: "#c084fc", radius: 8 }),
        table(ctx, "Reading", 18, 34, 172, 192, 4, 10, 4),
      ]),
    ],
  },
  {
    id: "fitness-pack", name: "Fitness Pack", category: "Tracker", isPack: true, pagesCount: 4, thumbnail: thumb("Fitness Pack"),
    build: (ctx) => [
      makeCover(ctx, "Fitness Pack", "#be123c"),
      pg(ctx, "Workout Log", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#be123c", stroke: "#be123c", radius: 8 }),
        text(ctx, "T", "Workout Log", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "WB", 14, 30, 180, 200, 3, { fill: "#fff1f2", stroke: "#fecdd3", radius: 8 }),
        table(ctx, "Workouts", 18, 34, 172, 192, 4, 10, 5),
        text(ctx, "Notes", "Notes", 14, 238, 60, 8, 5, "heading", { fontSize: 12, color: "#be123c" }),
        box(ctx, "NB", 14, 248, 180, 36, 6, { fill: "#fff1f2", stroke: "#fecdd3", radius: 6 }),
      ]),
      pg(ctx, "Measurements", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#be123c", stroke: "#be123c", radius: 8 }),
        text(ctx, "T", "Body Measurements", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "MB", 14, 30, 180, 200, 3, { fill: "#fff1f2", stroke: "#fecdd3", radius: 8 }),
        table(ctx, "Meas", 18, 34, 172, 192, 4, 10, 4),
      ]),
      pg(ctx, "Habit Tracker", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#be123c", stroke: "#be123c", radius: 8 }),
        text(ctx, "T", "Fitness Habits", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "HB", 14, 30, 180, 250, 3, { fill: "#fff1f2", stroke: "#fecdd3", radius: 8 }),
        table(ctx, "Habits", 18, 34, 172, 242, 4, 8, 10),
      ]),
    ],
  },
  {
    id: "budget-pack", name: "Budget Pack", category: "Finance", isPack: true, pagesCount: 4, thumbnail: thumb("Budget Pack"),
    build: (ctx) => [
      makeCover(ctx, "Budget Pack", "#4f46e5"),
      pg(ctx, "Monthly Budget", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#4f46e5", stroke: "#4f46e5", radius: 8 }),
        text(ctx, "T", "Monthly Budget", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        text(ctx, "IL", "Income", 14, 30, 60, 8, 3, "heading", { fontSize: 12, color: "#16a34a" }),
        box(ctx, "IB", 14, 40, 86, 80, 4, { fill: "#f0fdf4", stroke: "#86efac", radius: 8 }),
        table(ctx, "IT", 18, 44, 78, 72, 5, 5, 2),
        text(ctx, "EL", "Expenses", 108, 30, 80, 8, 6, "heading", { fontSize: 12, color: "#dc2626" }),
        box(ctx, "EB", 108, 40, 88, 80, 7, { fill: "#fef2f2", stroke: "#fca5a5", radius: 8 }),
        table(ctx, "ET", 112, 44, 80, 72, 8, 5, 2),
        divider(ctx, "S", 12, 126, 186, 9),
        text(ctx, "SL", "Savings Goals", 14, 132, 100, 8, 10, "heading", { fontSize: 12, color: "#4f46e5" }),
        box(ctx, "SB", 14, 142, 180, 60, 11, { fill: "#eef2ff", stroke: "#c7d2fe", radius: 8 }),
        checklist(ctx, "SG", 20, 148, 168, 48, 12, ["Emergency fund", "Vacation", "Investment", "Education"]),
      ]),
      pg(ctx, "Bills Tracker", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#4f46e5", stroke: "#4f46e5", radius: 8 }),
        text(ctx, "T", "Bills & Subscriptions", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "BB", 14, 30, 180, 240, 3, { fill: "#eef2ff", stroke: "#c7d2fe", radius: 8 }),
        table(ctx, "Bills", 18, 34, 172, 232, 4, 14, 4),
      ]),
      pg(ctx, "Savings Tracker", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#4f46e5", stroke: "#4f46e5", radius: 8 }),
        text(ctx, "T", "Savings Progress", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "SB", 14, 30, 180, 200, 3, { fill: "#eef2ff", stroke: "#c7d2fe", radius: 8 }),
        table(ctx, "Savings", 18, 34, 172, 192, 4, 10, 4),
        text(ctx, "NL", "Notes", 14, 238, 60, 8, 5, "heading", { fontSize: 12, color: "#4f46e5" }),
        box(ctx, "NB", 14, 248, 180, 36, 6, { fill: "#eef2ff", stroke: "#c7d2fe", radius: 6 }),
      ]),
    ],
  },
  {
    id: "meal-grocery-pack", name: "Meal & Grocery Pack", category: "Home", isPack: true, pagesCount: 4, thumbnail: thumb("Meal Pack"),
    build: (ctx) => [
      makeCover(ctx, "Meal & Grocery Pack", "#15803d"),
      pg(ctx, "Meal Planner", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#15803d", stroke: "#15803d", radius: 8 }),
        text(ctx, "T", "Weekly Meal Planner", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        table(ctx, "Meals", 14, 30, 180, 200, 3, 8, 4),
        text(ctx, "NL", "Meal Prep Notes", 14, 238, 100, 8, 4, "heading", { fontSize: 12, color: "#15803d" }),
        box(ctx, "NB", 14, 248, 180, 36, 5, { fill: "#f0fdf4", stroke: "#bbf7d0", radius: 6 }),
      ]),
      pg(ctx, "Grocery List", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#15803d", stroke: "#15803d", radius: 8 }),
        text(ctx, "T", "Grocery Shopping List", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "GB", 14, 30, 86, 200, 3, { fill: "#f0fdf4", stroke: "#bbf7d0", radius: 8 }),
        checklist(ctx, "G1", 18, 36, 78, 190, 4, ["Apples", "Bananas", "Carrots", "Spinach", "Tomatoes", "Onions", "Garlic"]),
        box(ctx, "PB", 108, 30, 88, 200, 5, { fill: "#fefce8", stroke: "#fde68a", radius: 8 }),
        checklist(ctx, "G2", 112, 36, 80, 190, 6, ["Chicken", "Rice", "Pasta", "Bread", "Eggs", "Milk", "Cheese"]),
      ]),
      pg(ctx, "Pantry Inventory", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#15803d", stroke: "#15803d", radius: 8 }),
        text(ctx, "T", "Pantry Inventory", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "PB", 14, 30, 180, 250, 3, { fill: "#f0fdf4", stroke: "#bbf7d0", radius: 8 }),
        table(ctx, "Pantry", 18, 34, 172, 242, 4, 14, 4),
      ]),
    ],
  },
  {
    id: "event-wedding-pack-lite", name: "Event/Wedding Pack Lite", category: "Planner", isPack: true, pagesCount: 4, thumbnail: thumb("Event Pack"),
    build: (ctx) => [
      makeCover(ctx, "Event Planner Pack", "#c026d3"),
      pg(ctx, "Checklist", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#c026d3", stroke: "#c026d3", radius: 8 }),
        text(ctx, "T", "Event Checklist", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "CB", 14, 30, 180, 250, 3, { fill: "#fdf4ff", stroke: "#f0abfc", radius: 8 }),
        checklist(ctx, "CL", 20, 36, 168, 238, 4, ["Book venue", "Send invitations", "Hire photographer", "Order flowers", "Arrange catering", "Plan seating", "Music / DJ", "Decorations", "Transportation", "Rehearsal"]),
      ]),
      pg(ctx, "Budget", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#c026d3", stroke: "#c026d3", radius: 8 }),
        text(ctx, "T", "Event Budget", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "BB", 14, 30, 180, 240, 3, { fill: "#fdf4ff", stroke: "#f0abfc", radius: 8 }),
        table(ctx, "Budget", 18, 34, 172, 232, 4, 12, 4),
      ]),
      pg(ctx, "Vendors", [
        highlight(ctx, "H", 12, 10, 186, 14, 1, { fill: "#c026d3", stroke: "#c026d3", radius: 8 }),
        text(ctx, "T", "Vendor Contacts", 18, 12, 160, 10, 2, "heading", { color: "#fff", fontSize: 15 }),
        box(ctx, "VB", 14, 30, 180, 240, 3, { fill: "#fdf4ff", stroke: "#f0abfc", radius: 8 }),
        table(ctx, "Vendors", 18, 34, 172, 232, 4, 12, 4),
      ]),
    ],
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
