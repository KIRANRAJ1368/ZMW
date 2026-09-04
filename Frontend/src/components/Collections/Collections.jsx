import ScrollReveal from "../ScrollReveal/ScrollReveal";
import "./Collections.css";

const ITEMS = [
  {
    name: "Raglan Sleeve T-Shirt",
    price: "₹2,324",
    was: "₹2,988",
    tag: "New",
    size: "tall",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Kimono Sleeve Top",
    price: "₹1,992",
    was: "₹2,656",
    tag: "-25%",
    size: "wide",
    img: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Mesh Overshirt",
    price: "₹2,905",
    was: "₹3,735",
    tag: "New",
    size: "wide",
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Washed Denim Skirt",
    price: "₹2,656",
    was: "₹3,320",
    tag: "-20%",
    size: "tall",
    img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Collections() {
  return (
    <section id="collections" className="collections">
      <div className="container">
        <ScrollReveal as="div" className="collections-head">
          <h2>The current edit</h2>
          <p>
            Four pieces from this season's drop, chosen for how often you'll
            actually reach for them.
          </p>
        </ScrollReveal>

        <div className="collections-grid">
          {ITEMS.map((item, i) => (
            <ScrollReveal
              as="article"
              key={item.name}
              delay={(i % 4) + 1}
              className={`product-card size-${item.size}`}
            >
              <div className="product-media">
                <img src={item.img} alt={item.name} loading="lazy" />
                <span
                  className={`product-tag ${
                    item.tag === "New" ? "tag-new" : "tag-sale"
                  }`}
                >
                  {item.tag}
                </span>
                <button className="product-quick" type="button">
                  Quick add
                </button>
              </div>
              <div className="product-info">
                <h3>{item.name}</h3>
                <p className="product-price">
                  <span>{item.price}</span>
                  <s>{item.was}</s>
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
