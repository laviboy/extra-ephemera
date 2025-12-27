import type { Item } from "../data/items";

type CardGridProps = {
  items: Item[];
};

export default function CardGrid({ items }: CardGridProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
      gap: "16px",
      padding: "24px",
      maxWidth: 1200,
      margin: "0 auto"
    }}>
      {items.map((item) => (
        <a
          key={item.id}
          href={`/items/${item.slug}`}
          style={{
            display: "block",
            textDecoration: "none",
            color: "inherit",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
          }}
        >
          <div style={{ aspectRatio: "3 / 2", overflow: "hidden", background: "#f3f4f6" }}>
            <img
              src={item.imageUrl}
              alt={item.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading="lazy"
            />
          </div>
          <div style={{ padding: "12px 14px" }}>
            <h3 style={{ margin: 0, fontSize: 18, lineHeight: 1.3 }}>{item.title}</h3>
            <p style={{ margin: "6px 0 0 0", color: "#4b5563", fontSize: 14 }}>{item.description}</p>
          </div>
        </a>
      ))}
    </div>
  );
}


