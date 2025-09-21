"use client";

import { useIsMobile } from "@/hooks/use-mobile";

interface MobileOverflowWrapperProps {
  children: React.ReactNode;
}

export default function MobileOverflowWrapper({ children }: MobileOverflowWrapperProps) {
  const isMobile = useIsMobile();

  return (
    <div className={isMobile ? "overflow-hidden" : ""}>
      {children}
    </div>
  );
}
