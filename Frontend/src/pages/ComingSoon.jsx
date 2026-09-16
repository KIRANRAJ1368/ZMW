import { Link } from "react-router-dom";
import "./ComingSoon.css";

export default function ComingSoon({ title }) {
  return (
    <section className="coming-soon-section">
      <div className="container coming-soon-inner">
        <span className="section-eyebrow">Coming Soon</span>
        <h1 className="coming-soon-title">{title}</h1>
        <p className="coming-soon-copy">
          We're putting the finishing touches on this collection. In the
          meantime, explore our full collection or head back to the homepage.
        </p>
        <div className="coming-soon-actions">
          <Link to="/collection" className="btn btn-primary">
            Shop Collection
          </Link>
          <Link to="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
