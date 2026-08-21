import { promises as fs } from "node:fs";
import path from "node:path";

type ViewData = { comics: Record<string, number>; chapters: Record<string, number> };
const filePath = path.join(process.cwd(), "data", "fallback-views.json");

export async function readFallbackViews(): Promise<ViewData> {
  try { return JSON.parse(await fs.readFile(filePath, "utf8")) as ViewData; }
  catch { return { comics: {}, chapters: {} }; }
}

export async function incrementFallbackView(kind: keyof ViewData, id: string) {
  const data = await readFallbackViews();
  data[kind][id] = (data[kind][id] || 0) + 1;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data), "utf8");
  return data[kind][id];
}
