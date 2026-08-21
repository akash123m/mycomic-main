export const pageSize = (value: string | null) => Math.min(100, Math.max(10, Number(value) || 25));
export function csvResponse(rows: Record<string, unknown>[], filename: string) {
  const keys = rows[0] ? Object.keys(rows[0]) : [];
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const body = [keys.map(escape).join(","), ...rows.map((row) => keys.map((key) => escape(row[key])).join(","))].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"` } });
}
