
"use client";

import React from "react";
import "./framer-buttons.css";

interface FButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function FSubmitButton({ children, className = "", ...props }: FButtonProps) {
  return (
    <button
      type="submit"
      className={`framer-KGu8n framer-jxmfz4 framer-v-jxmfz4 ${className}`}
      data-framer-name="Default"
      data-reset="button"
      style={{
        backgroundColor: "rgb(51, 51, 51)",
        height: "100%",
        width: "100%",
        borderBottomLeftRadius: "10px",
        borderBottomRightRadius: "10px",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        opacity: 1,
      }}
      {...props}
    >
      <div
        className="framer-1ylka0v"
        style={{
          "--extracted-r6o4lv": "rgb(255, 255, 255)",
          "--framer-link-text-color": "rgb(0, 153, 255)",
          "--framer-link-text-decoration": "underline",
          transform: "none",
        } as React.CSSProperties}
      >
        <p
          style={{
            "--font-selector": "SW50ZXItU2VtaUJvbGQ=",
            "--framer-font-family": '"Inter", "Inter Placeholder", sans-serif',
            "--framer-font-size": "14px",
            "--framer-font-weight": "600",
            "--framer-text-color": "var(--extracted-r6o4lv, rgb(255, 255, 255))",
          } as React.CSSProperties}
          className="framer-text"
        >
          {children || "Submit"}
        </p>
      </div>
    </button>
  );
}

export function FNextButton({ children, className = "", ...props }: FButtonProps) {
  return (
    <button
      className={`framer-51Zpa framer-1vu6bk6 framer-v-sob4fd ${className}`}
      data-framer-name="Next"
      data-reset="button"
      style={{
        "--border-bottom-width": "0px",
        "--border-color": "rgba(0, 0, 0, 0)",
        "--border-left-width": "0px",
        "--border-right-width": "0px",
        "--border-style": "solid",
        "--border-top-width": "0px",
        backgroundColor: "rgb(51, 51, 51)",
        height: "100%",
        width: "100%",
        borderBottomLeftRadius: "10px",
        borderBottomRightRadius: "10px",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        opacity: 1,
      } as React.CSSProperties}
      {...props}
    >
      <div
        className="framer-50scrv"
        style={{
          "--extracted-r6o4lv": "rgb(255, 255, 255)",
          "--framer-link-text-color": "rgb(0, 153, 255)",
          "--framer-link-text-decoration": "underline",
          transform: "none",
        } as React.CSSProperties}
      >
        <p
          dir="auto"
          style={{
            "--font-selector": "SW50ZXItU2VtaUJvbGQ=",
            "--framer-font-size": "14px",
            "--framer-font-weight": "600",
            "--framer-text-color": "var(--extracted-r6o4lv, rgb(255, 255, 255))",
          } as React.CSSProperties}
          className="framer-text"
        >
          {children || "Next"}
        </p>
      </div>
    </button>
  );
}

export function FCancelButton({ children, className = "", ...props }: FButtonProps) {
  return (
    <button
      type="button"
      className={`framer-51Zpa framer-1vu6bk6 framer-v-hw2cpm ${className}`}
      data-framer-name="Cancel"
      data-reset="button"
      style={{
        "--border-bottom-width": "1px",
        "--border-color": "rgba(34, 34, 34, 0.2)",
        "--border-left-width": "1px",
        "--border-right-width": "1px",
        "--border-style": "solid",
        "--border-top-width": "1px",
        backgroundColor: "rgb(255, 255, 255)",
        height: "100%",
        width: "100%",
        borderBottomLeftRadius: "10px",
        borderBottomRightRadius: "10px",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        opacity: 1,
      } as React.CSSProperties}
      {...props}
    >
      <div
        className="framer-50scrv"
        style={{
          "--extracted-r6o4lv": "rgb(255, 255, 255)",
          "--framer-link-text-color": "rgb(0, 153, 255)",
          "--framer-link-text-decoration": "underline",
          transform: "none",
        } as React.CSSProperties}
      >
        <p
          dir="auto"
          style={{
            "--font-selector": "SW50ZXItU2VtaUJvbGQ=",
            "--framer-font-size": "14px",
            "--framer-font-weight": "600",
          } as React.CSSProperties}
          className="framer-text"
        >
          {children || "Cancel"}
        </p>
      </div>
    </button>
  );
}
