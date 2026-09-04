import ScrollReveal from "../ScrollReveal/ScrollReveal";
import "./MarqueeStrip.css";

const MENTIONS = ["Carolin", "Panadoxn", "Penny W. Textiles", "LH. Tech", "Shangxi", "Cheryl"];

export default function MarqueeStrip() {
  return (
    <ScrollReveal as="section" className="press" aria-label="As worn and stocked by">
      <div className="container press-inner">
        <p className="press-label">Fabric partners we've worked with since day one</p>
        <ul className="press-list">
          {MENTIONS.map((name) => (
            <li key={name} className="press-item">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </ScrollReveal>
  );
}
