import useParallax from "../../hooks/useParallax";
import ScrollReveal from "../ScrollReveal/ScrollReveal";
import "./StorySection.css";

export default function StorySection() {
  const [imgRef, offset] = useParallax(0.08);

  return (
    <section id="story" className="story">
      <div className="container story-inner">
        <div className="story-visual">
          <div
            className="story-visual-frame frame-back"
            ref={imgRef}
            style={{ transform: `translateY(${offset}px)` }}
          >
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80"
              alt="Bolts of undyed natural linen fabric stacked on a workshop table"
              loading="lazy"
            />
          </div>
          <div className="story-visual-frame frame-front">
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=80"
              alt="Seamstress hand-finishing a garment hem"
              loading="lazy"
            />
          </div>
        </div>

        <ScrollReveal as="div" className="story-copy">
          <h2>Every piece starts on a cutting table, not a spreadsheet.</h2>
          <p>
            We work with three family-run mills across Portugal and Gujarat,
            weaving in small batches so a fabric's flaws — and its
            character — stay visible. Patterns are cut by hand, graded for a
            dozen body types, then finished by machinists who've been doing
            this for decades.
          </p>
          <ul className="story-list">
            <li>
              <span>01</span>
              Fabric sourced and washed before a single stitch
            </li>
            <li>
              <span>02</span>
              Hand-cut patterns, graded across 12 sizes
            </li>
            <li>
              <span>03</span>
              Finished, pressed and inspected twice
            </li>
          </ul>
          <a href="#" className="story-link">
            Read the full process
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
