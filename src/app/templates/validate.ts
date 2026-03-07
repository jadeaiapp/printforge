import { validateDoc } from "../storage";
import { createDocFromTemplate, listTemplates } from "./index";

export interface TemplateValidationResult {
  id: string;
  name: string;
  ok: boolean;
  pages: number;
  errors: string[];
}

const requiredNodeFields = ["id", "type", "name", "xMm", "yMm", "wMm", "hMm", "z", "visible", "locked", "props"] as const;

function validateRoundtripRequiredFields(doc: ReturnType<typeof createDocFromTemplate>, errors: string[]) {
  const roundtrip = JSON.parse(JSON.stringify(doc));
  if (!validateDoc(roundtrip)) {
    errors.push("Roundtrip document failed validateDoc()");
    return;
  }

  roundtrip.pages.forEach((page, pageIndex) => {
    page.nodes.forEach((node, nodeIndex) => {
      for (const key of requiredNodeFields) {
        if (!(key in node)) {
          errors.push(`Missing required field ${key} on page ${pageIndex + 1}, node ${nodeIndex + 1}`);
        }
      }
      if ((node.type === "checklist" || node.type === "bulletlist") && !Array.isArray(node.props.items)) {
        errors.push(`List node missing items[] on page ${pageIndex + 1}, node ${nodeIndex + 1}`);
      }
    });
  });
}

export function validateTemplates(): TemplateValidationResult[] {
  return listTemplates().map((template) => {
    const errors: string[] = [];
    let pages = 0;

    try {
      const doc = createDocFromTemplate(template.id);
      pages = doc.pages.length;
      if (!validateDoc(doc)) errors.push("Template produced invalid doc schema");
      if (!doc.pages.length) errors.push("Template produced zero pages");
      if (doc.pages.some((p) => !p.nodes?.length)) errors.push("At least one page has no nodes");
      validateRoundtripRequiredFields(doc, errors);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Template threw while loading");
    }

    return {
      id: template.id,
      name: template.name,
      ok: errors.length === 0,
      pages,
      errors,
    };
  });
}
