import { Link } from "react-router-dom";
import "./ComingSoon.css";

/**
 * ComingSoon
 * Lightweight placeholder used for the category routes that are wired
 * into the nav but not yet built out (Women, Kids, Oversized T-Shirts as
 * a standalone landing). Keeps every nav item navigable to a real page —
 * styled with the same tokens as the rest of the site — without building
 * full catalog pages for them yet.
 */
export default function ComingSoon({ title }) {
  return (
    <section className="coming-soon-section">
      <div className="container coming-soon-inner">
        <span className="section-eyebrow">Coming Soon</span>
        <h1 className="coming-soon-title">{title}</h1>
        <p className="coming-soon-copy">
          We're putting the finishing touches on this collection. In the
          meantime, explore our Men's edit or head back to the homepage.
        </p>
        <div className="coming-soon-actions">
          <Link to="/men" className="btn btn-primary">
            Shop Men
          </Link>
          <Link to="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
