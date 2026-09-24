import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import "./Wishlist.css";

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, findProduct, toggleWishlist, addToCart } = useShop();

  const wishlistProducts = wishlist.map((id) => findProduct(id)).filter(Boolean);

  const formatINR = (usdAmount) => {
    if (usdAmount === null || usdAmount === undefined) return "";
    const inr = Math.round(usdAmount * 83);
    return `₹${new Intl.NumberFormat("en-IN").format(inr)}`;
  };

  return (
    <div className="wishlist-page">
      <div className="container">
        {/* ── Page Header ── */}
        <header className="wishlist-header">
          <nav className="wishlist-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="wishlist-breadcrumb-link">
              Home
            </Link>
            <span className="wishlist-breadcrumb-sep">/</span>
            <span className="wishlist-breadcrumb-current">Wishlist</span>
          </nav>

          <div className="wishlist-title-row">
            <div className="wishlist-heading-wrap">
              <h1 className="wishlist-title">My Wishlist</h1>
            </div>

            {wishlistProducts.length > 0 && (
              <Link to="/" className="wishlist-continue-top">
                Continue Shopping &rarr;
              </Link>
            )}
          </div>
        </header>

        {/* ── Products Grid ── */}
        {wishlistProducts.length > 0 ? (
          <>
            <div className="wishlist-grid">
              {wishlistProducts.map((product) => (
                <article className="wishlist-card" key={product.id}>
                  {/* Image Box */}
                  <div
                    className="wishlist-card-img-box"
                    onClick={() => navigate(`/product/${product.id}`)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${product.name}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/product/${product.id}`);
                      }
                    }}
                  >
                    {/* Badge */}
                    {product.badge && (
                      <span className={`wishlist-card-badge badge-${product.badgeType || "new"}`}>
                        {product.badge}
                      </span>
                    )}

                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="wishlist-card-img"
                      loading="lazy"
                    />

                    {/* Remove ❤️ Button */}
                    <button
                      type="button"
                      className="wishlist-card-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      title="Remove from Wishlist"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="heart-icon-filled"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Card Info */}
                  <div className="wishlist-card-info">
                    <span className="wishlist-card-category">{product.category}</span>

                    <h2
                      className="wishlist-card-name"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h2>

                    {/* Pricing */}
                    <div className="wishlist-card-pricing">
                      <span className="wishlist-card-price">
                        {formatINR(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="wishlist-card-original">
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      className="wishlist-card-add-btn"
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.name} to bag`}
                    >
                      Add to Bag
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Bottom Continue Shopping Button */}
            <div className="wishlist-footer-cta">
              <Link to="/" className="btn btn-secondary wishlist-continue-btn">
                Continue Shopping
              </Link>
            </div>
          </>
        ) : (
          /* ── Empty State ── */
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h2 className="wishlist-empty-title">Your Wishlist is Empty</h2>
            <p className="wishlist-empty-text">
              You haven't saved any items to your wishlist yet. Explore our latest collections and tap the heart icon on any piece you love.
            </p>
            <Link to="/" className="btn btn-primary wishlist-empty-btn">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}