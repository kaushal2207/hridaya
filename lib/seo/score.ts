import type { Extracted } from "@/lib/seo/extract";

export type Priority = "High" | "Medium" | "Low";
export interface Issue { category: "Technical" | "On-page" | "Content" | "Performance"; priority: Priority; title: string; detail: string; fix: string }
export interface Check { label: string; pass: boolean; points: number; max: number }
export interface AuditScores { overall: number; technical: number; onpage: number; content: number; performance: number; performanceSource: "pagespeed" | "estimated" }

type PSI = { score: number; lcp?: string; cls?: string; tbt?: string; fcp?: string } | null;

/** Deterministic scoring: every point traces to a fact in `Extracted`. The AI never changes these numbers. */
export function scoreAudit(x: Extracted, psi: PSI) {
  const issues: Issue[] = [];
  const add = (i: Issue) => issues.push(i);

  // ----- Technical (100)
  let t = 0;
  if (x.https) t += 20; else add({ category: "Technical", priority: "High", title: "Site is not served over HTTPS", detail: "Browsers mark HTTP pages as not secure and Google prefers HTTPS.", fix: "Install an SSL certificate and redirect all HTTP traffic to HTTPS." });
  const noindex = /noindex/i.test(`${x.robotsMeta ?? ""} ${x.xRobotsTag ?? ""}`);
  if (!noindex) t += 20; else add({ category: "Technical", priority: "High", title: "Page is blocked from Google (noindex)", detail: `Robots directive found: ${x.robotsMeta || x.xRobotsTag}.`, fix: "Remove the noindex directive if this page should appear in search results." });
  if (x.canonical) t += 10; else add({ category: "Technical", priority: "Medium", title: "No canonical URL", detail: "Without a canonical tag, duplicate URL variants can split ranking signals.", fix: 'Add <link rel="canonical"> pointing to the preferred URL.' });
  if (x.viewport && /width=device-width/i.test(x.viewport)) t += 15; else add({ category: "Technical", priority: "High", title: "Missing mobile viewport", detail: "The page may not display properly on phones.", fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.' });
  if (x.structuredDataTypes.length && !x.structuredDataTypes.includes("Invalid JSON-LD")) t += 10;
  else add({ category: "Technical", priority: "Medium", title: x.structuredDataTypes.includes("Invalid JSON-LD") ? "Structured data has JSON errors" : "No structured data", detail: "Structured data helps search engines understand your business and can enable rich results.", fix: "Add Organization/LocalBusiness JSON-LD and validate it with Google's Rich Results Test." });
  if (x.robotsTxt) t += 5; else add({ category: "Technical", priority: "Low", title: "robots.txt not found", detail: "A robots.txt file guides crawlers and points them to your sitemap.", fix: "Publish /robots.txt with a Sitemap: line." });
  if (x.sitemap) t += 10; else add({ category: "Technical", priority: "Medium", title: "sitemap.xml not found", detail: "No XML sitemap was found at /sitemap.xml.", fix: "Generate an XML sitemap and submit it in Google Search Console." });
  if (x.lang) t += 5; else add({ category: "Technical", priority: "Low", title: "Missing language attribute", detail: "The <html> tag has no lang attribute.", fix: 'Add lang="en" (or the correct language) to the <html> tag.' });
  if (x.brokenLinks.length === 0) t += 5; else add({ category: "Technical", priority: "High", title: `${x.brokenLinks.length} broken internal link(s)`, detail: x.brokenLinks.slice(0, 5).map((b) => `${b.url} (${b.status})`).join("; "), fix: "Fix or remove the broken links, or redirect the old URLs." });

  // ----- On-page (100)
  let o = 0;
  if (!x.title) add({ category: "On-page", priority: "High", title: "Missing page title", detail: "The page has no <title> tag.", fix: "Add a unique 30–60 character title with your main keyword." });
  else if (x.titleLength < 30 || x.titleLength > 60) { o += 12; add({ category: "On-page", priority: "Medium", title: `Title length is ${x.titleLength} characters`, detail: `"${x.title}"`, fix: "Keep titles between about 30 and 60 characters so they aren't truncated." }); }
  else o += 25;
  if (!x.metaDescription) add({ category: "On-page", priority: "High", title: "Missing meta description", detail: "Google may pick random text for your search snippet.", fix: "Write a 120–160 character description that encourages clicks." });
  else if (x.metaDescriptionLength < 70 || x.metaDescriptionLength > 165) { o += 10; add({ category: "On-page", priority: "Low", title: `Meta description is ${x.metaDescriptionLength} characters`, detail: x.metaDescription, fix: "Aim for roughly 120–160 characters." }); }
  else o += 20;
  if (x.h1.length === 1) o += 20;
  else if (x.h1.length === 0) add({ category: "On-page", priority: "High", title: "No H1 heading", detail: "The page has no main heading.", fix: "Add one H1 that describes the page topic." });
  else { o += 10; add({ category: "On-page", priority: "Medium", title: `${x.h1.length} H1 headings`, detail: x.h1.slice(0, 4).join(" | "), fix: "Use a single H1 and turn the others into H2s." }); }
  if (x.h2.length >= 2) o += 10; else add({ category: "On-page", priority: "Low", title: "Few subheadings (H2)", detail: `${x.h2.length} H2 heading(s) found.`, fix: "Break content into sections with descriptive H2 headings." });
  const altRatio = x.images.total ? 1 - x.images.missingAlt / x.images.total : 1;
  o += Math.round(10 * altRatio);
  if (x.images.missingAlt) add({ category: "On-page", priority: x.images.missingAlt > 5 ? "Medium" : "Low", title: `${x.images.missingAlt} of ${x.images.total} images missing alt text`, detail: x.images.samplesMissingAlt.join(", "), fix: "Describe each meaningful image in its alt attribute." });
  if (x.og.title && x.og.image) o += 10; else add({ category: "On-page", priority: "Low", title: "Incomplete Open Graph tags", detail: "Shared links on WhatsApp, Facebook and LinkedIn may show no preview image or the wrong title.", fix: "Add og:title, og:description and og:image." });
  if (x.links.internal >= 5) o += 5; else add({ category: "On-page", priority: "Low", title: "Few internal links", detail: `${x.links.internal} internal link(s) found.`, fix: "Link to your key service pages from this page." });

  // ----- Content (100)
  let c = 0;
  if (x.wordCount >= 600) c += 50; else if (x.wordCount >= 300) { c += 35; add({ category: "Content", priority: "Low", title: `Moderate content length (${x.wordCount} words)`, detail: "More helpful detail can help the page rank for more searches.", fix: "Expand with FAQs, process details and specifics about your services." }); }
  else { c += Math.round((x.wordCount / 300) * 25); add({ category: "Content", priority: "Medium", title: `Thin content (${x.wordCount} words)`, detail: "Pages with very little text are harder for search engines to rank.", fix: "Add useful, original content that answers your customers' questions." }); }
  if (x.h2.length >= 3) c += 20; else c += x.h2.length * 6;
  if (x.links.emptyAnchor === 0) c += 15; else { c += 5; add({ category: "Content", priority: "Low", title: `${x.links.emptyAnchor} link(s) without descriptive text`, detail: "Links with no text or label give no context to users or search engines.", fix: "Add descriptive link text or an aria-label." }); }
  if (x.favicon) c += 15; else add({ category: "Content", priority: "Low", title: "No favicon", detail: "A favicon helps your site stand out in browser tabs and mobile search results.", fix: "Add a favicon link tag." });

  // ----- Performance (100)
  let p: number; let source: AuditScores["performanceSource"] = "estimated";
  if (psi) { p = psi.score; source = "pagespeed"; }
  else {
    p = 100;
    if (x.responseMs > 3000) p -= 30; else if (x.responseMs > 1500) p -= 15; else if (x.responseMs > 800) p -= 5;
    if (x.htmlBytes > 500_000) p -= 15; else if (x.htmlBytes > 200_000) p -= 5;
    if (x.scripts > 25) p -= 15; else if (x.scripts > 12) p -= 7;
    if (x.images.total > 3 && x.images.lazy === 0) p -= 10;
    p -= Math.min(15, x.images.legacyFormat * 2);
    p -= Math.min(10, x.images.missingDimensions);
    p = Math.max(5, p);
  }
  if (x.responseMs > 1500) add({ category: "Performance", priority: "High", title: `Slow server response (${(x.responseMs / 1000).toFixed(1)}s)`, detail: "Measured from our server for the HTML document only.", fix: "Use caching, a CDN or faster hosting." });
  if (x.images.legacyFormat > 2) add({ category: "Performance", priority: "Medium", title: `${x.images.legacyFormat} images in JPG/PNG/GIF`, detail: "Modern formats are usually much smaller.", fix: "Serve WebP or AVIF versions of large images." });
  if (x.images.total > 3 && x.images.lazy === 0) add({ category: "Performance", priority: "Medium", title: "Images are not lazy-loaded", detail: "All images load immediately, even ones below the fold.", fix: 'Add loading="lazy" to below-the-fold images.' });
  if (x.images.missingDimensions > 3) add({ category: "Performance", priority: "Low", title: `${x.images.missingDimensions} images without width/height`, detail: "Missing dimensions can cause layout shift while loading.", fix: "Set width and height attributes on images." });
  if (x.scripts > 20) add({ category: "Performance", priority: "Medium", title: `${x.scripts} external scripts`, detail: "Many scripts slow down interactivity on mobile.", fix: "Remove unused plugins and defer non-critical scripts." });

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const scores: AuditScores = { technical: clamp(t), onpage: clamp(o), content: clamp(c), performance: clamp(p), overall: 0, performanceSource: source };
  scores.overall = clamp(scores.technical * 0.3 + scores.onpage * 0.3 + scores.content * 0.2 + scores.performance * 0.2);
  const order: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
  issues.sort((a, b) => order[a.priority] - order[b.priority]);
  return { scores, issues };
}

/** Keyword-targeting score for the SEO Score Checker. */
export function scoreKeyword(x: Extracted, keyword: string) {
  const kw = keyword.toLowerCase().trim();
  const words = kw.split(/\s+/);
  const has = (s: string | null | undefined) => !!s && s.toLowerCase().includes(kw);
  const partial = (s: string | null | undefined) => !!s && words.every((w) => s.toLowerCase().includes(w));
  const text = x.textSample.toLowerCase();
  const occurrences = kw ? text.split(kw).length - 1 : 0;
  const density = x.wordCount ? (occurrences * words.length * 100) / Math.min(x.wordCount, 700) : 0;
  let slug = ""; try { slug = decodeURIComponent(new URL(x.finalUrl).pathname).toLowerCase().replace(/[-_/]/g, " "); } catch { /* ignore */ }

  const checks: Check[] = [
    { label: "Keyword in title tag", pass: has(x.title) || partial(x.title), points: has(x.title) ? 20 : partial(x.title) ? 12 : 0, max: 20 },
    { label: "Keyword in meta description", pass: has(x.metaDescription) || partial(x.metaDescription), points: has(x.metaDescription) ? 12 : partial(x.metaDescription) ? 7 : 0, max: 12 },
    { label: "Keyword in H1", pass: x.h1.some((h) => partial(h)), points: x.h1.some(has) ? 15 : x.h1.some((h) => partial(h)) ? 9 : 0, max: 15 },
    { label: "Keyword in H2 subheadings", pass: x.h2.some((h) => partial(h)), points: x.h2.some((h) => partial(h)) ? 8 : 0, max: 8 },
    { label: "Keyword in first 100 words", pass: partial(x.firstWords), points: partial(x.firstWords) ? 10 : 0, max: 10 },
    { label: "Keyword in URL", pass: partial(slug), points: partial(slug) ? 7 : 0, max: 7 },
    { label: "Natural keyword usage (0.5–3% of text)", pass: density >= 0.5 && density <= 3, points: density >= 0.5 && density <= 3 ? 10 : density > 0 ? 4 : 0, max: 10 },
    { label: "Enough content (300+ words)", pass: x.wordCount >= 300, points: x.wordCount >= 600 ? 8 : x.wordCount >= 300 ? 5 : 0, max: 8 },
    { label: "Internal links (5+)", pass: x.links.internal >= 5, points: x.links.internal >= 5 ? 5 : 0, max: 5 },
    { label: "Technical basics (HTTPS, viewport, indexable)", pass: x.https && !!x.viewport && !/noindex/i.test(x.robotsMeta ?? ""), points: (x.https ? 2 : 0) + (x.viewport ? 1 : 0) + (/noindex/i.test(x.robotsMeta ?? "") ? 0 : 2), max: 5 },
  ];
  const score = Math.round(checks.reduce((s, c) => s + c.points, 0));
  return { score, checks, occurrences, density: Math.round(density * 100) / 100 };
}
