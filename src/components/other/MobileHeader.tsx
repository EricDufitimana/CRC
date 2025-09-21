"use client";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileHeaderProps {
  title: string;
  description: string;
}

const MobileHeader = ({ title, description }: MobileHeaderProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null; // Don't render on desktop
  }

  return (
    <div className="bg-white py-12 px-4 pt-[160px] pb-[64px]">
      <div className="container mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
      </div>
    </div>
  );
};

export default MobileHeader;
