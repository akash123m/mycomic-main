"use client";

import React, { useState } from "react";
import StarIcon from "./icons/StarIcon";

interface StarRatingProps {
  rating: number; // 0-5, supports decimals
  maxStars?: number;
  size?: number; // px
  showValue?: boolean;
  interactive?: boolean;
  onRate?: (stars: number) => void;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  showValue = true,
  interactive = false,
  onRate,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <div style={{ display: "flex", gap: "2px" }}>
        {Array.from({ length: maxStars }, (_, i) => {
          const starIndex = i + 1;
          const fillPercent = Math.min(1, Math.max(0, displayRating - i)) * 100;

          return (
            <div
              key={i}
              onMouseEnter={() => interactive && setHoverRating(starIndex)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              onClick={() => interactive && onRate?.(starIndex)}
              style={{
                position: "relative",
                width: size,
                height: size,
                cursor: interactive ? "pointer" : "default",
                transition: "transform 150ms ease",
                transform: hoverRating === starIndex ? "scale(1.15)" : "scale(1)",
              }}
            >
              {/* Empty star (background) */}
              <StarIcon
                width={size}
                height={size}
                fill="var(--color-bg-hover)"
              />

              {/* Filled star (overlay, clipped) */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: `${fillPercent}%`,
                  height: "100%",
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <StarIcon
                  width={size}
                  height={size}
                  fill="var(--color-primary)"
                />
              </div>
            </div>
          );
        })}
      </div>

      {showValue && (
        <span
          style={{
            fontSize: "var(--font-size-caption)",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            marginLeft: "2px",
          }}
        >
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
