import React from "react";
import { useShop } from "../../context/ShopContext";
import "./WishlistDrawer.css";

export default function WishlistDrawer() {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    products,
    toggleWishlist,
    moveToCartFromWishlist,
    formatPrice,
    addToCart
  } = useShop();

  if (!isWishlistOpen) return null;

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveAllToBag = () => {
    wishlistProducts.forEach((p) => {
      addToCart(p);
      toggleWishlist(p.id);
    });
  };

  return (
    <>
      <div className="drawer-backdrop active" onClick={() => setIsWishlistOpen(false)} />
      <div className="wishlist-drawer-panel active">
        {/* Header */}
        <div className="wishlist-drawer-header">
          <div className="wishlist-title-row">
            <h2 className="wishlist-heading">Saved Pieces</h2>
            <span className="wishlist-count">({wishlist.length} saved)</span>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close wishlist"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="wishlist-items-container">
          {wishlistProducts.length === 0 ? (
            <div className="wishlist-empty-state">
              <div className="empty-wishlist-icon">❤️</div>
              <h3>Your wishlist is empty</h3>
              <p>Save pieces you love to revisit or purchase later.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsWishlistOpen(false)}
              >
                Explore Lookbook
              </button>
            </div>
          ) : (
            wishlistProducts.map((item) => (
              <div key={item.id} className="wishlist-item-card">
                <img src={item.images[0]} alt={item.name} className="wishlist-item-img" />

                <div className="wishlist-item-info">
                  <div className="wishlist-item-head">
                    <h4 className="wishlist-item-name">{item.name}</h4>
                    <button
                      className="wishlist-item-remove"
                      onClick={() => toggleWishlist(item.id)}
                      title="Remove from saved"
                      aria-label="Remove from saved"
                    >
                      ✕
                    </button>
                  </div>

                  <span className="wishlist-item-price">{formatPrice(item.price)}</span>

                  <div className="wishlist-item-actions">
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => moveToCartFromWishlist(item.id)}
                    >
                      + Move to Bag
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlistProducts.length > 0 && (
          <div className="wishlist-drawer-footer">
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: "100%" }}
              onClick={handleMoveAllToBag}
            >
              Move All to Bag ({wishlistProducts.length})
            </button>
          </div>
        )}
      </div>
    </>
  );
}
