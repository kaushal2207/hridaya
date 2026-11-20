import "server-only";
import dns from "dns";
import http from "http";
import https from "https";
import net from "net";

/**
 * SSRF-safe HTTP GET/HEAD:
 * - http/https only, ports 80/443 only, no credentials in URL
 * - every DNS answer is checked against private/reserved ranges *inside the socket lookup*,
 *   so the IP that is checked is the IP that is connected to (no DNS-rebinding window)
 * - manual redirects (max 4), each re-validated
 * - hard timeout and response size cap
 */
const blocked = new net.BlockList();
for (const [a, p] of [["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
  ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 3]] as const)
  blocked.addSubnet(a, p, "ipv4");
for (const [a, p] of [["::", 128], ["::1", 128], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8], ["64:ff9b::", 96], ["2001:db8::", 32]] as const)
  blocked.addSubnet(a, p, "ipv6");

export function isBlockedIp(ip: string) {
  const v4mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (v4mapped) return blocked.check(v4mapped[1], "ipv4");
  return net.isIPv4(ip) ? blocked.check(ip, "ipv4") : net.isIPv6(ip) ? blocked.check(ip, "ipv6") : true;
}

export class FetchError extends Error {}

export function normalizeUrl(input: string): URL {
  let s = input.trim();
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  let u: URL;
  try { u = new URL(s); } catch { throw new FetchError("Enter a valid website address, for example example.com"); }
  if (!["http:", "https:"].includes(u.protocol)) throw new FetchError("Only http and https addresses can be checked");
  if (u.username || u.password) throw new FetchError("Addresses with login details are not allowed");
  if (u.port && !["80", "443"].includes(u.port)) throw new FetchError("Only standard web ports (80, 443) are allowed");
  if (net.isIP(u.hostname.replace(/^\[|\]$/g, ""))) throw new FetchError("Enter a domain name rather than an IP address");
  if (!u.hostname.includes(".") || /\.(local|internal|localhost)$/i.test(u.hostname)) throw new FetchError("That address is not a public website");
  u.hash = "";
  return u;
}

const safeLookup: net.LookupFunction = (hostname, options, cb) => {
  dns.lookup(hostname, { all: true }, (err, addresses) => {
    if (err) return cb(err, "", 4);
    const list = addresses as dns.LookupAddress[];
    if (!list.length || list.some((a) => isBlockedIp(a.address)))
      return cb(Object.assign(new Error("Blocked address"), { code: "EBLOCKED" }), "", 4);
    if ((options as { all?: boolean }).all) return (cb as unknown as (e: null, a: dns.LookupAddress[]) => void)(null, list);
    cb(null, list[0].address, list[0].family);
  });
};

export interface SafeResponse {
  url: string; status: number; headers: Record<string, string>; body: string; timeMs: number; redirects: string[]; bytes: number;
}

function once(url: URL, method: "GET" | "HEAD", timeoutMs: number, maxBytes: number): Promise<Omit<SafeResponse, "redirects" | "url">> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(url, {
      method, lookup: safeLookup, timeout: timeoutMs,
      headers: { "User-Agent": "HridayaSEOAudit/1.0 (+https://hridaya-it-solutions; SEO checker)", Accept: "text/html,application/xhtml+xml,*/*;q=0.8", "Accept-Encoding": "identity" },
    }, (res) => {
      const chunks: Buffer[] = []; let bytes = 0;
      res.on("data", (c: Buffer) => {
        bytes += c.length;
        if (bytes > maxBytes) { req.destroy(); resolve({ status: res.statusCode ?? 0, headers: flat(res.headers), body: Buffer.concat(chunks).toString("utf8"), timeMs: Date.now() - start, bytes }); return; }
        chunks.push(c);
      });
      res.on("end", () => resolve({ status: res.statusCode ?? 0, headers: flat(res.headers), body: Buffer.concat(chunks).toString("utf8"), timeMs: Date.now() - start, bytes }));
      res.on("error", reject);
    });
    req.on("timeout", () => req.destroy(new FetchError("The website took too long to respond")));
    req.on("error", (e: NodeJS.ErrnoException) => reject(e.code === "EBLOCKED" ? new FetchError("That address points to a private network and can't be checked") : e instanceof FetchError ? e : new FetchError(`Could not reach the website (${e.code || e.message})`)));
    req.end();
  });
}

function flat(h: http.IncomingHttpHeaders) {
  return Object.fromEntries(Object.entries(h).map(([k, v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(", ") : String(v ?? "")]));
}

export async function safeFetch(input: string | URL, opts: { method?: "GET" | "HEAD"; timeoutMs?: number; maxBytes?: number } = {}): Promise<SafeResponse> {
  let url = typeof input === "string" ? normalizeUrl(input) : input;
  const redirects: string[] = [];
  const started = Date.now();
  for (let i = 0; i <= 4; i++) {
    const r = await once(url, opts.method ?? "GET", opts.timeoutMs ?? 8000, opts.maxBytes ?? 2_000_000);
    if (r.status >= 300 && r.status < 400 && r.headers.location) {
      redirects.push(url.toString());
      url = normalizeUrl(new URL(r.headers.location, url).toString());
      continue;
    }
    return { ...r, url: url.toString(), redirects, timeMs: Date.now() - started };
  }
  throw new FetchError("Too many redirects");
}
