import "server-only";

/** Provider-agnostic AI call. Returns null when no key is configured so callers can fall back. */
export async function aiComplete(system: string, user: string, maxTokens = 1500): Promise<{ text: string; model: string } | null> {
  const key = process.env.AI_API_KEY;
  if (!key) return null;
  const provider = (process.env.AI_PROVIDER || "anthropic").toLowerCase();
  try {
    if (provider === "openai") {
      const model = process.env.AI_MODEL || "gpt-4o-mini";
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", signal: AbortSignal.timeout(45000),
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, max_tokens: maxTokens, temperature: 0.4, response_format: { type: "json_object" },
          messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
      });
      if (!r.ok) { console.error("[ai]", r.status, await r.text()); return null; }
      const j = await r.json();
      return { text: j.choices?.[0]?.message?.content ?? "", model };
    }
    const model = process.env.AI_MODEL || "claude-sonnet-4-6";
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: AbortSignal.timeout(45000),
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
    });
    if (!r.ok) { console.error("[ai]", r.status, await r.text()); return null; }
    const j = await r.json();
    return { text: (j.content ?? []).map((b: { type: string; text?: string }) => (b.type === "text" ? b.text : "")).join(""), model };
  } catch (e) {
    console.error("[ai]", e);
    return null;
  }
}

export function parseJson<T>(text: string): T | null {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.search(/[[{]/);
  if (start < 0) return null;
  try { return JSON.parse(clean.slice(start, Math.max(clean.lastIndexOf("}"), clean.lastIndexOf("]")) + 1)) as T; } catch { return null; }
}

export const aiConfigured = () => Boolean(process.env.AI_API_KEY);
