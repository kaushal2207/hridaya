import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

type Report = {
  target_url: string | null; created_at: string;
  scores: { overall: number; technical: number; onpage: number; content: number; performance: number; performanceSource?: string };
  issues: { category: string; priority: string; title: string; detail: string; fix: string }[];
  ai_output: { summary?: string; recommendations?: string[] } | null;
};

const clean = (s: unknown) => String(s ?? "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/₹/g, "Rs.").replace(/[^\x20-\x7E\n]/g, "");

export async function renderAuditPdf(r: Report) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.03, 0.05, 0.11), blue = rgb(0.25, 0.41, 1), grey = rgb(0.36, 0.39, 0.47);
  let page: PDFPage = doc.addPage([595, 842]);
  let y = 842;
  const M = 48, W = 595 - M * 2;

  const newPage = () => { page = doc.addPage([595, 842]); y = 800; };
  const wrap = (text: string, f: PDFFont, size: number, width: number) => {
    const out: string[] = [];
    for (const para of clean(text).split("\n")) {
      let line = "";
      for (const word of para.split(" ")) {
        const test = line ? `${line} ${word}` : word;
        if (f.widthOfTextAtSize(test, size) > width && line) { out.push(line); line = word; } else line = test;
      }
      out.push(line);
    }
    return out;
  };
  const write = (text: string, opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb>; x?: number; gap?: number } = {}) => {
    const size = opts.size ?? 10, f = opts.f ?? font;
    for (const line of wrap(text, f, size, W - ((opts.x ?? M) - M))) {
      if (y < 60) newPage();
      page.drawText(line, { x: opts.x ?? M, y, size, font: f, color: opts.color ?? navy });
      y -= size * 1.45;
    }
    y -= opts.gap ?? 0;
  };

  page.drawRectangle({ x: 0, y: 742, width: 595, height: 100, color: navy });
  page.drawText("HRIDAYA IT SOLUTIONS", { x: M, y: 800, size: 16, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Website SEO Audit Report", { x: M, y: 778, size: 11, font, color: rgb(0.62, 0.69, 0.85) });
  page.drawText(clean(new Date(r.created_at).toUTCString()), { x: M, y: 760, size: 9, font, color: rgb(0.62, 0.69, 0.85) });
  y = 715;
  write(r.target_url ?? "", { size: 11, f: bold, gap: 10 });

  page.drawText(`${r.scores.overall}`, { x: M, y: y - 30, size: 44, font: bold, color: blue });
  page.drawText("/100 overall SEO score", { x: M + 70, y: y - 22, size: 11, font, color: grey });
  y -= 60;
  const rows: [string, number][] = [["Technical SEO", r.scores.technical], ["On-page SEO", r.scores.onpage], ["Content", r.scores.content],
    [`Performance${r.scores.performanceSource === "estimated" ? " (estimated)" : " (Google PageSpeed)"}`, r.scores.performance]];
  for (const [label, v] of rows) {
    page.drawText(label, { x: M, y, size: 10, font, color: navy });
    page.drawRectangle({ x: M + 190, y: y - 2, width: 250, height: 9, color: rgb(0.9, 0.92, 0.96) });
    page.drawRectangle({ x: M + 190, y: y - 2, width: 2.5 * v, height: 9, color: v >= 80 ? rgb(0.13, 0.7, 0.45) : v >= 50 ? rgb(0.95, 0.65, 0.1) : rgb(0.9, 0.25, 0.3) });
    page.drawText(String(v), { x: M + 450, y, size: 10, font: bold, color: navy });
    y -= 20;
  }
  y -= 10;
  if (r.ai_output?.summary) { write("Summary (AI-generated from the audit data)", { size: 12, f: bold, gap: 4 }); write(r.ai_output.summary, { color: grey, gap: 10 }); }
  write(`Issues found (${r.issues.length})`, { size: 12, f: bold, gap: 4 });
  for (const i of r.issues) {
    write(`[${i.priority}] ${i.category}: ${i.title}`, { f: bold, size: 10 });
    if (i.detail) write(i.detail, { color: grey, size: 9 });
    write(`Fix: ${i.fix}`, { size: 9, gap: 6 });
  }
  if (r.ai_output?.recommendations?.length) {
    write("Recommendations (AI-generated)", { size: 12, f: bold, gap: 4 });
    r.ai_output.recommendations.forEach((rec, n) => write(`${n + 1}. ${rec}`, { size: 9.5, gap: 3 }));
  }
  y -= 10;
  write("This report is generated automatically from the page's HTML at the time of the check. Need help fixing these issues? Contact HRIDAYA IT SOLUTIONS - kaushalkumar2207@gmail.com", { size: 8.5, color: grey });
  return doc.save();
}
