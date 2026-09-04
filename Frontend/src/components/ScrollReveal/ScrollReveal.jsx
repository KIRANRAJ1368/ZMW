import useScrollReveal from "../../hooks/useScrollReveal";

/**
 * ScrollReveal
 * Thin wrapper so pages/components can opt an element into the shared
 * reveal-on-scroll treatment without re-wiring the hook each time.
 *
 *   <ScrollReveal as="li" delay={2} className="card">...</ScrollReveal>
 */
export default function ScrollReveal({
  as: Tag = "div",
  delay = 0,
  className = "",
  threshold,
  ...rest
}) {
  const [ref, visible] = useScrollReveal(
    threshold ? { threshold } : undefined
  );
  const delayClass = delay ? `reveal-delay-${delay}` : "";

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${delayClass} ${className}`.trim()}
      {...rest}
    />
  );
}
