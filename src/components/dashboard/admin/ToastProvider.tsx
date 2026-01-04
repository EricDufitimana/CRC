"use client";

import { Toaster, ToastBar } from "react-hot-toast";
import "@/styles/toast-animations.css";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      containerStyle={{
        // Custom positioning for top-right
        marginTop: "20px",
        marginRight: "20px",
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'transparent',
          padding: 0,
          margin: 0,
          boxShadow: 'none',
        },
      }}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            ...t.style,
            animation: t.visible
              ? "slide-in-top 0.4s ease-out"
              : "slide-out-top 0.4s ease-in forwards",
          }}
        />
      )}
    </Toaster>
  );
}

