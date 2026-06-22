import React from "react";

const FALLBACK = [
  { id: "music", title: "Music", emoji: "🎵" },
  { id: "dance", title: "Dance", emoji: "💃" },
  { id: "cultural", title: "Cultural", emoji: "🪔" },
];

function Categories({ categories = [], selected, onSelect }) {
  const list =
    categories.length > 0
      ? categories.map((c) => ({ id: c, title: c, emoji: "✦" }))
      : FALLBACK;

  return (
    <section className="py-10 px-0 max-w-6xl mx-auto">
      <h2 className="text-2xl font-serif text-[#1e2a5e] mb-6">Browse by category</h2>
      <p className="text-sm text-[#5c4f3d] mb-6 max-w-2xl">
        Tap a category to filter programs below. Categories come from what artists publish.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onSelect?.("")}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
            !selected
              ? "bg-[#1e2a5e] text-[#faf7f2] border-[#1e2a5e]"
              : "bg-white text-[#1e2a5e] border-[#1e2a5e]/25 hover:border-[#1e2a5e]/50"
          }`}
        >
          All
        </button>
        {list.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect?.(cat.title)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              selected === cat.title
                ? "bg-[#c45c26] text-white border-[#c45c26]"
                : "bg-white text-[#1e2a5e] border-[#1e2a5e]/25 hover:border-[#c45c26]/40"
            }`}
          >
            <span className="mr-1">{cat.emoji}</span>
            {cat.title}
          </button>
        ))}
      </div>
    </section>
  );
}

export default Categories;
