/** The brand's signature: a heartbeat line (Hridaya = heart). Draws once on load; static when reduced motion is set. */
export function PulseLine({ className = "", animate = true }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pl-g" x1="0" x2="1">
          <stop offset="0" stopColor="#4169FF" stopOpacity="0" />
          <stop offset=".25" stopColor="#4169FF" />
          <stop offset=".7" stopColor="#00D4FF" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity=".2" />
        </linearGradient>
        <filter id="pl-glow" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      {[0, 1].map((i) => (
        <path key={i}
          d="M0 120 H300 L330 120 L352 70 L380 165 L412 18 L446 182 L474 92 L496 120 H620 L640 104 L660 120 H1000"
          fill="none" stroke="url(#pl-g)" strokeWidth={i ? 3 : 10} strokeLinejoin="round" strokeLinecap="round"
          filter={i ? undefined : "url(#pl-glow)"} opacity={i ? 1 : 0.55}
          strokeDasharray="1000" className={animate ? "animate-pulseline" : ""} style={{ strokeDashoffset: animate ? 1000 : 0 }} />
      ))}
    </svg>
  );
}
