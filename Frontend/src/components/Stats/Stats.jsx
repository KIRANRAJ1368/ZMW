import { useEffect, useRef, useState } from "react";
import useScrollReveal from "../../hooks/useScrollReveal";
import "./Stats.css";

const STATS = [
  { value: 38400, suffix: "+", label: "garments rehomed via resale, not landfill" },
  { value: 96, suffix: "%", label: "of fabric traced to a named mill" },
  { value: 4.9, suffix: "/5", label: "average rating across 6,200 reviews", decimals: 1 },
  { value: 12, suffix: " yrs", label: "average founder tenure on the floor" },
];

function Counter({ value, suffix, decimals = 0, start }) {
  const [display, setDisplay] = useState(0);
  const frame = useRef(null);

  useEffect(() => {
    if (!start) return undefined;
    const duration = 1400;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [start, value]);

  return (
    <span>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function Stats() {
  const [ref, visible] = useScrollReveal({ threshold: 0.4 });

  return (
    <section className="stats" ref={ref}>
      <div className="container stats-grid">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat-item">
            <p className="stat-value">
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals}
                start={visible}
              />
            </p>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
