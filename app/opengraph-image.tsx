import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "HRIDAYA IT SOLUTIONS — Your Complete Digital Growth Partner";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#080D1B 0%,#0D1425 55%,#1b1240 100%)", color: "#fff" }}>
        <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: -2 }}>HRIDAYA IT SOLUTIONS</div>
        <div style={{ fontSize: 34, color: "#9fb0d9", marginTop: 16 }}>Your Complete Digital Growth Partner.</div>
        <svg width="1040" height="160" viewBox="0 0 1000 200" style={{ marginTop: 40 }}>
          <path d="M0 120 H300 L330 120 L352 70 L380 165 L412 18 L446 182 L474 92 L496 120 H1000" fill="none" stroke="#00D4FF" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <div style={{ fontSize: 26, color: "#00D4FF", marginTop: 20 }}>Websites · Design · Digital Marketing · E-commerce — Noida, serving all India</div>
      </div>
    ),
    size,
  );
}
