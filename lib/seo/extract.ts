import "server-only";
import * as cheerio from "cheerio";
import { safeFetch, type SafeResponse } from "@/lib/seo/safe-fetch";

export interface Extracted {
  finalUrl: string; status: number; https: boolean; redirects: string[]; responseMs: number; htmlBytes: number;
  title: string; titleLength: number; metaDescription: string; metaDescriptionLength: number;
  h1: string[]; h2: string[]; h3Count: number; canonical: string | null; robotsMeta: string | null; xRobotsTag: string | null;
  lang: string | null; viewport: string | null; charset: boolean;
  og: Record<string, string>; twitterCard: string | null; structuredDataTypes: string[];
  images: { total: number; missingAlt: number; legacyFormat: number; missingDimensions: number; lazy: number; samplesMissingAlt: string[] };
  links: { internal: number; external: number; nofollow: number; emptyAnchor: number; internalSample: string[] };
  brokenLinks: { url: string; status: number | string }[]; brokenChecked: number;
  wordCount: number; textSample: string; firstWords: string;
  robotsTxt: boolean | null; sitemap: boolean | null; favicon: boolean;
  scripts: number; stylesheets: number; inlineStyleBytes: number;
}

export async function fetchPage(url: string) {
  const res = await safeFetch(url);
  if (res.status >= 400) throw new Error(`The page returned HTTP ${res.status}`);
  const ct = res.headers["content-type"] || "";
  if (ct && !/html/i.test(ct)) throw new Error("That address isn't an HTML web page");
  return res;
}

export async function extract(res: SafeResponse, opts: { checkLinks?: boolean } = {}): Promise<Extracted> {
  const $ = cheerio.load(res.body);
  const base = new URL(res.url);
  const txt = (s: string) => s.replace(/\s+/g, " ").trim();
  const title = txt($("head title").first().text());
  const metaDescription = txt($('meta[name="description" i]').attr("content") || "");

  const og: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => { const p = $(el).attr("property")!; og[p.slice(3)] = $(el).attr("content") || ""; });

  const sdTypes = new Set<string>();
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const walk = (n: unknown): void => {
        if (Array.isArray(n)) n.forEach(walk);
        else if (n && typeof n === "object") {
          const t = (n as Record<string, unknown>)["@type"];
          if (typeof t === "string") sdTypes.add(t); else if (Array.isArray(t)) t.forEach((x) => sdTypes.add(String(x)));
          const g = (n as Record<string, unknown>)["@graph"]; if (g) walk(g);
        }
      };
      walk(JSON.parse($(el).text()));
    } catch { sdTypes.add("Invalid JSON-LD"); }
  });
  if ($("[itemtype]").length) sdTypes.add("Microdata");

  const imgs = $("img");
  const images = { total: imgs.length, missingAlt: 0, legacyFormat: 0, missingDimensions: 0, lazy: 0, samplesMissingAlt: [] as string[] };
  imgs.each((_, el) => {
    const $el = $(el); const src = $el.attr("src") || $el.attr("data-src") || "";
    if ($el.attr("alt") === undefined || !$el.attr("alt")?.trim()) { images.missingAlt++; if (images.samplesMissingAlt.length < 5 && src) images.samplesMissingAlt.push(src.slice(0, 120)); }
    if (/\.(jpe?g|png|gif|bmp)(\?|$)/i.test(src) && !$el.closest("picture").find("source[type*=webp],source[type*=avif]").length) images.legacyFormat++;
    if (!$el.attr("width") || !$el.attr("height")) images.missingDimensions++;
    if ($el.attr("loading") === "lazy") images.lazy++;
  });

  const links = { internal: 0, external: 0, nofollow: 0, emptyAnchor: 0, internalSample: [] as string[] };
  const internalSet = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")!.trim();
    if (!href || /^(#|mailto:|tel:|javascript:|whatsapp:)/i.test(href)) return;
    let u: URL; try { u = new URL(href, base); } catch { return; }
    if (!/^https?:$/.test(u.protocol)) return;
    if (/nofollow/i.test($(el).attr("rel") || "")) links.nofollow++;
    if (!txt($(el).text()) && !$(el).find("img[alt]").length && !$(el).attr("aria-label")) links.emptyAnchor++;
    if (u.hostname.replace(/^www\./, "") === base.hostname.replace(/^www\./, "")) { links.internal++; u.hash = ""; internalSet.add(u.toString()); }
    else links.external++;
  });
  links.internalSample = [...internalSet].slice(0, 30);

  $("script,style,noscript,svg,template").remove();
  const bodyText = txt($("body").text());
  const words = bodyText.split(" ").filter((w) => /[\p{L}\p{N}]/u.test(w));

  const brokenLinks: Extracted["brokenLinks"] = [];
  let brokenChecked = 0;
  if (opts.checkLinks) {
    const toCheck = [...internalSet].filter((u) => u !== res.url).slice(0, 12);
    brokenChecked = toCheck.length;
    await Promise.all(toCheck.map(async (u) => {
      try { const r = await safeFetch(u, { method: "HEAD", timeoutMs: 5000, maxBytes: 1 }); if (r.status >= 400 && r.status !== 405) brokenLinks.push({ url: u, status: r.status }); }
      catch (e) { brokenLinks.push({ url: u, status: e instanceof Error ? e.message.slice(0, 60) : "error" }); }
    }));
  }

  const [robotsTxt, sitemap] = await Promise.all([
    safeFetch(new URL("/robots.txt", base), { timeoutMs: 4000, maxBytes: 50_000 }).then((r) => r.status === 200 && /user-agent|sitemap|disallow/i.test(r.body)).catch(() => null),
    safeFetch(new URL("/sitemap.xml", base), { timeoutMs: 4000, maxBytes: 50_000 }).then((r) => r.status === 200 && /<(urlset|sitemapindex)/i.test(r.body)).catch(() => null),
  ]);

  return {
    finalUrl: res.url, status: res.status, https: base.protocol === "https:", redirects: res.redirects, responseMs: res.timeMs, htmlBytes: res.bytes,
    title, titleLength: title.length, metaDescription, metaDescriptionLength: metaDescription.length,
    h1: $("h1").map((_, el) => txt($(el).text())).get().slice(0, 10),
    h2: $("h2").map((_, el) => txt($(el).text())).get().slice(0, 30),
    h3Count: $("h3").length,
    canonical: $('link[rel="canonical"]').attr("href") || null,
    robotsMeta: $('meta[name="robots" i]').attr("content") || null,
    xRobotsTag: res.headers["x-robots-tag"] || null,
    lang: $("html").attr("lang") || null,
    viewport: $('meta[name="viewport" i]').attr("content") || null,
    charset: $("meta[charset]").length > 0 || /charset/i.test(res.headers["content-type"] || ""),
    og, twitterCard: $('meta[name="twitter:card" i]').attr("content") || null,
    structuredDataTypes: [...sdTypes],
    images, links, brokenLinks, brokenChecked,
    wordCount: words.length, textSample: bodyText.slice(0, 4000), firstWords: words.slice(0, 100).join(" "),
    robotsTxt, sitemap,
    favicon: $('link[rel*="icon" i]').length > 0,
    scripts: $("script[src]").length, stylesheets: $('link[rel="stylesheet"]').length,
    inlineStyleBytes: 0,
  };
}

/** Optional Google PageSpeed Insights (free API key). Returns null when unavailable. */
export async function pageSpeed(url: string) {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return null;
  try {
    const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${key}`;
    const r = await fetch(api, { signal: AbortSignal.timeout(45000) });
    if (!r.ok) return null;
    const j = await r.json();
    const a = j.lighthouseResult?.audits ?? {};
    return {
      score: Math.round((j.lighthouseResult?.categories?.performance?.score ?? 0) * 100),
      lcp: a["largest-contentful-paint"]?.displayValue as string | undefined,
      cls: a["cumulative-layout-shift"]?.displayValue as string | undefined,
      tbt: a["total-blocking-time"]?.displayValue as string | undefined,
      fcp: a["first-contentful-paint"]?.displayValue as string | undefined,
    };
  } catch { return null; }
}
