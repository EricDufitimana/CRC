"use client";

import { useState } from "react";

const PALETTE = ["#143D2B", "#0F4D92", "#A41034", "#B58500", "#3E7BC2", "#2FA96A", "#7A3AB8"];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function initials(name: string) {
  const words = name.replace(/^The\s+/i, "").split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** College logo via Clearbit, falling back to a colored monogram.
 *  Self-contained inline styles so it renders correctly anywhere
 *  (inside the CRP workspace and inside the admin shell). */
export function CollegeLogo({
  name,
  logoUrl,
  size = 34,
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const base: React.CSSProperties = { width: size, height: size, borderRadius: 9, flex: "none" };

  if (!logoUrl || failed) {
    return (
      <span
        aria-hidden
        style={{
          ...base,
          background: colorFor(name),
          display: "grid",
          placeItems: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: Math.round(size * 0.34),
          letterSpacing: "-0.02em",
        }}
      >
        {initials(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      src={logoUrl}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ ...base, objectFit: "contain", background: "#fff", border: "1px solid #ececec" }}
    />
  );
}
