import { useEffect } from "react";

export default function useFollowEyes() {
  useEffect(() => {
    const eyes = document.querySelectorAll(".character-eye");

    const handleMouseMove = (e: MouseEvent) => {
      eyes.forEach((eye) => {
        const rect = eye.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
        const distance = 5; // how much eyes move
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        (eye as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
}
