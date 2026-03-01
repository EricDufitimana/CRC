"use client";

import React, { useState } from "react";

// ─── Shared token ─────────────────────────────────────────────────────────────
const FONT: React.CSSProperties = {
  fontFamily: '"Inter", sans-serif',
};

const BASE_INPUT: React.CSSProperties = {
  ...FONT,
  fontSize: "14px",
  fontWeight: 400,
  color: "rgb(34,34,34)",
  background: "rgba(187,187,187,0.15)",
  border: "1px solid rgba(136,136,136,0.15)",
  borderRadius: "10px",
  padding: "0 12px",
  outline: "none",
  width: "100%",
  height: "40px",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

// ─── Label wrapper ────────────────────────────────────────────────────────────
export function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
      <span
        style={{ ...FONT, fontSize: "12px", fontWeight: 500, color: "rgb(136,136,136)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

// ─── Text Input ───────────────────────────────────────────────────────────────
export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...BASE_INPUT,
        borderColor: focused ? "rgba(136,136,136,0.8)" : "rgba(136,136,136,0.15)",
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <select
        {...props}
        style={{
          ...BASE_INPUT,
          appearance: "none",
          paddingRight: "36px",
          borderColor: focused ? "rgba(234,120,30,0.7)" : "rgba(136,136,136,0.15)",
          cursor: "pointer",
        }}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
      />
      <svg
        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M3.5 6 L8 10.5 L12.5 6" stroke="rgb(153,153,153)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─── Radio Group ──────────────────────────────────────────────────────────────
export function RadioGroup({ name, options }: { name: string; options: string[] }) {
  const [selected, setSelected] = useState(options[0]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {options.map((opt) => (
        <label
          key={opt}
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={selected === opt}
            onChange={() => setSelected(opt)}
            style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
          />
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              border: "1px solid rgba(136,136,136,0.3)",
              background: "rgba(187,187,187,0.3)",
              boxSizing: "border-box",
              flexShrink: 0,
              boxShadow: selected === opt ? "inset 0 0 0 5px rgb(34,34,34)" : undefined,
              transition: "box-shadow 0.15s",
            }}
          />
          <span style={{ ...FONT, fontSize: "12px", fontWeight: 500, color: "rgb(136,136,136)", userSelect: "none" }}>
            {opt}
          </span>
        </label>
      ))}
    </div>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
export function Checkbox({ label }: { label: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked((c) => !c)}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      <div
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "4px",
          border: "1px solid rgba(136,136,136,0.3)",
          background: checked ? "rgb(34,34,34)" : "rgba(187,187,187,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.15s",
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path d="M4 8 L6.5 10.5 L11.5 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ ...FONT, fontSize: "12px", fontWeight: 500, color: "rgb(136,136,136)", userSelect: "none" }}>
        {label}
      </span>
    </label>
  );
}
