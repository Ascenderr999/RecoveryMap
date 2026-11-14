import Papa from "papaparse";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PlanActivity } from "../types";

export const fields = [
  "exercise",
  "instructions",
  "sets",
  "repetitions",
  "duration",
  "frequency",
  "schedule",
  "notes",
] as const;
const aliases: Record<string, (typeof fields)[number]> = {
  exercise: "exercise",
  name: "exercise",
  exercisename: "exercise",
  activity: "exercise",
  instructions: "instructions",
  description: "instructions",
  sets: "sets",
  reps: "repetitions",
  repetitions: "repetitions",
  duration: "duration",
  frequency: "frequency",
  schedule: "schedule",
  days: "schedule",
  day: "schedule",
  notes: "notes",
};
export const blankActivity = (): PlanActivity => ({
  id: crypto.randomUUID(),
  exercise: "",
  instructions: "",
  sets: "",
  repetitions: "",
  duration: "",
  frequency: "",
  schedule: "",
  notes: "",
});
export function parsePlanText(text: string, csv = false): PlanActivity[] {
  if (!text.trim())
    throw Error(
      "No readable text found. Image-only scanned PDFs require OCR, which is not available.",
    );
  if (csv) {
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
    });
    if (
      result.errors.some(
        (e) => e.type === "Quotes" || e.code === "TooManyFields",
      )
    )
      throw Error("Invalid CSV. Check quotation marks and column counts.");
    const mapped = result.data
      .map((row) => {
        const a = blankActivity();
        Object.entries(row).forEach(([k, v]) => {
          const field = aliases[k.toLowerCase().replace(/[^a-z]/g, "")];
          if (field) a[field] = String(v ?? "").trim();
        });
        return a;
      })
      .filter((a) => fields.some((f) => a[f]));
    if (!mapped.length)
      throw Error(
        "No recognized columns. Use exercise, instructions, sets, repetitions, duration, frequency, schedule, notes.",
      );
    if (mapped.length > 200)
      throw Error("A plan can contain at most 200 activities.");
    return mapped;
  }
  // Preserve source wording. Unstructured text is never converted into invented doses.
  const normalized = text.replace(/\r\n?/g, "\n").trim();
  const blocks = (
    /^(?:exercise|exercise name|name|activity)\s*:/im.test(normalized)
      ? normalized.split(
          /\n(?=\s*(?:exercise|exercise name|name|activity)\s*:)/i,
        )
      : normalized.split(/\n\s*\n/)
  ).filter(Boolean);
  if (blocks.length > 200)
    throw Error("A plan can contain at most 200 activities.");
  return blocks.map((block) => {
    const a = blankActivity();
    let structured = false;
    for (const line of block.split("\n")) {
      const match = line.match(/^\s*([\w ]+)\s*:\s*(.*)$/);
      if (match) {
        const field = aliases[match[1].toLowerCase().replace(/[^a-z]/g, "")];
        if (field) {
          a[field] = a[field] ? a[field] + "\n" + match[2] : match[2];
          structured = true;
        }
      }
    }
    if (!structured) {
      a.instructions = block.trim();
    } else {
      const remainder = block
        .split("\n")
        .filter((line) => {
          const match = line.match(/^\s*([\w ]+)\s*:/);
          return (
            !match || !aliases[match[1].toLowerCase().replace(/[^a-z]/g, "")]
          );
        })
        .join("\n")
        .trim();
      a.instructions = [a.instructions, remainder].filter(Boolean).join("\n");
    }
    return a;
  });
}
export async function readPlanFile(file: File): Promise<PlanActivity[]> {
  if (file.size > 15 * 1024 * 1024) throw Error("Maximum file size is 15 MB.");
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv" || ext === "txt")
    return parsePlanText(await file.text(), ext === "csv");
  if (ext === "pdf") {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
    const pdf = await task.promise.catch(() => {
      throw Error(
        "The PDF could not be read. It may be encrypted, corrupt, or unsupported.",
      );
    });
    try {
      if (pdf.numPages > 100)
        throw Error("Maximum document length is 100 pages.");
      const pages: string[] = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        const content = await (await pdf.getPage(n)).getTextContent();
        pages.push(
          content.items
            .map((item) =>
              "str" in item
                ? item.str + ("hasEOL" in item && item.hasEOL ? "\n" : " ")
                : "",
            )
            .join(""),
        );
      }
      return parsePlanText(pages.join("\n\n"));
    } finally {
      await task.destroy();
    }
  }
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth
      .convertToHtml(
        { arrayBuffer: await file.arrayBuffer() },
        { convertImage: mammoth.images.imgElement(async () => ({ src: "" })) },
      )
      .catch(() => {
        throw Error(
          "The DOCX could not be read. It may be corrupt or unsupported.",
        );
      });
    return parseDocxHtml(result.value);
  }
  throw Error("Unsupported file. Choose CSV, TXT, PDF, or DOCX.");
}

export function parseDocxHtml(html: string): PlanActivity[] {
  const text = html
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:p|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(
      /&(?:amp|lt|gt|quot|apos|nbsp);|&#(?:x[0-9a-f]+|\d+);/gi,
      (entity) => {
        const named: Record<string, string> = {
          "&amp;": "&",
          "&lt;": "<",
          "&gt;": ">",
          "&quot;": '"',
          "&apos;": "'",
          "&nbsp;": " ",
        };
        if (named[entity]) return named[entity];
        const n = entity.startsWith("&#x")
          ? parseInt(entity.slice(3, -1), 16)
          : parseInt(entity.slice(2, -1), 10);
        return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
      },
    );
  return parsePlanText(text);
}
