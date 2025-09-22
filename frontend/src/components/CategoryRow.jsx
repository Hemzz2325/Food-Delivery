// src/components/CategoryRow.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import CategoryCard from "./CategoryCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CategoryRow = ({
  categories = [],
  title = "Browse Categories",
  itemWidth = 160,     // card width (matches CategoryCard)
  gap = 12,            // gap between items (px)
  className = "",
}) => {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const scrollByPx = useMemo(() => Math.round(itemWidth * 2.5), [itemWidth]);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft < max - 1);
  }, []);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -scrollByPx : scrollByPx, behavior: "smooth" });
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    const onScroll = () => updateArrows();
    const onResize = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updateArrows]);

  // Keyboard support when the row is focused
  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scroll("left");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scroll("right");
    }
  };

  return (
    <section className={`w-full ${className}`}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 md:px-2 mb-2">
          <h3 className="text-gray-800 text-xl sm:text-2xl font-bold">{title}</h3>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canLeft}
              className={`p-2 rounded-full border shadow-sm transition ${
                canLeft ? "bg-white hover:bg-gray-50" : "bg-white/60 cursor-not-allowed opacity-50"
              }`}
              aria-label="Scroll left"
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canRight}
              className={`p-2 rounded-full border shadow-sm transition ${
                canRight ? "bg-white hover:bg-gray-50" : "bg-white/60 cursor-not-allowed opacity-50"
              }`}
              aria-label="Scroll right"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Scroll container */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-[#fff9f6] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#fff9f6] to-transparent" />

        {/* Track */}
        <div
          ref={trackRef}
          role="listbox"
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="flex gap-3 px-4 snap-x snap-mandatory overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent scroll-smooth"
          style={{ scrollPaddingLeft: 16, scrollPaddingRight: 16 }}
          aria-label="Categories"
        >
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="snap-start flex-none"
              style={{ width: itemWidth, marginRight: idx === categories.length - 1 ? 0 : gap }}
              role="option"
              aria-selected="false"
            >
              <CategoryCard
                name={cat.name}
                image={cat.image}
                address={cat.address}
                city={cat.city}
                state={cat.state}
                onClick={cat.onClick}
              />
            </div>
          ))}
        </div>

        {/* Mobile overlay arrows */}
        <div className="sm:hidden">
          {canLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md"
              aria-label="Scroll left"
            >
              <FaChevronLeft />
            </button>
          )}
          {canRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md"
              aria-label="Scroll right"
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryRow;
