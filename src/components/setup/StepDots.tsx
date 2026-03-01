import React from "react";

interface StepDotsProps {
  /** zero-based index of the current step */
  current: number;
  total: number;
}

export function StepDots({ current, total }: StepDotsProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: "100px",
            height: "5px",
            width: i === current ? "43px" : "30px",
            backgroundColor:
              i < current
                ? "rgb(34,34,34)"
                : i === current
                  ? "rgb(34,34,34)"
                  : "rgba(212,212,212,0.6)",
            opacity: i < current ? 0.35 : 1,
            transition: "width 0.25s ease, background-color 0.25s ease, opacity 0.25s ease",
          }}
        />
      ))}
    </div>
  );
}
