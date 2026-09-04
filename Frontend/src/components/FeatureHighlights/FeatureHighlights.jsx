import ScrollReveal from "../ScrollReveal/ScrollReveal";
import "./FeatureHighlights.css";

const FEATURES = [
  {
    title: "Real humans, always on",
    body: "A stylist answers within the hour, every day of the week.",
    icon: (
      <path
        d="M4 17V9a8 8 0 0 1 16 0v8m-16 0a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Zm16 0a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "14 days to change your mind",
    body: "Free returns on anything that doesn't earn its spot in your wardrobe.",
    icon: (
      <path
        d="M4 12a8 8 0 1 1 2.34 5.66M4 12v5m0-5h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Backed for the life of the garment",
    body: "Free repairs on stitching and seams for as long as you own it.",
    icon: (
      <path
        d="m9 12 2 2 4-4m5-2v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V8l7-3 7 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Shipped wherever you are",
    body: "Carbon-offset delivery to over 40 countries, tracked door to door.",
    icon: (
      <path
        d="M3 7h11v8H3V7Zm11 3h4l3 3v2h-7v-5Z M6.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function FeatureHighlights() {
  return (
    <section className="features">
      <div className="container features-grid">
        {FEATURES.map((feature, i) => (
          <ScrollReveal
            as="div"
            key={feature.title}
            delay={(i % 4) + 1}
            className="feature-item"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {feature.icon}
            </svg>
            <h3>{feature.title}</h3>
            <p>{feature.body}</p>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
