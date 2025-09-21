"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import HeaderLayout from "./headerLayout";
import MobileHeader from "./MobileHeader";

interface ConditionalHeaderProps {
  title: string;
  description: string;
  image: string;
  bottomPaddingClass?: string;
}

const ConditionalHeader = ({ title, description, image, bottomPaddingClass }: ConditionalHeaderProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileHeader title={title} description={description} />;
  }

  return <HeaderLayout image={image} bottomPaddingClass={bottomPaddingClass} />;
};

export default ConditionalHeader;
