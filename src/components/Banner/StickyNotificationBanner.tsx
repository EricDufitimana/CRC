
"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import markdownToHtml from "@/utils/markdownToHtml";

type Notification = {
  id: number;
  message: string;
};

export default function StickyNotificationBanner() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [parsedContent, setParsedContent] = useState<string>("");
  const [isDismissed, setIsDismissed] = useState(false);
  const [isScrolledHidden, setIsScrolledHidden] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);

  

  // Update CSS variable with current banner height so header can offset
  const updateBannerHeightVar = () => {
    const shouldShowBanner = !!notification && !isDismissed;
    const height = shouldShowBanner ? measuredHeight : 0;
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--banner-height", `${height}px`);
    }
  };


  
  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await fetch("/api/announcements/fetch?page=home&single=true", { cache: "no-store" });
        if (!res.ok) {
          console.error("Failed to fetch notification", res);
          return;
        }
        const json = await res.json();
        console.log("Successfully fetched notification", json);
        setNotification(json.notification ?? null);
      } catch (e) {
        // noop
      }
    };
    fetchNotification();
  }, []);
  // Add this new useEffect right after the notification fetch effect
  useEffect(() => {
    if (notification && contentRef.current) {
      // Temporarily make the banner visible but transparent to measure it
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentRef.current.outerHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);
      
      const height = tempDiv.offsetHeight;
      setMeasuredHeight(height);
      
      // Immediately reserve the space
      document.documentElement.style.setProperty("--banner-height", `${height}px`);
      
      document.body.removeChild(tempDiv);
    }
  }, [notification]);
  // Parse markdown content when notification changes
  useEffect(() => {
    const parseMarkdown = async () => {
      if (notification?.message) {
        try {
          const html = await markdownToHtml(notification.message);
          setParsedContent(html);
        } catch (error) {
          console.error("Error parsing markdown:", error);
          // Fallback to plain text
          setParsedContent(notification.message);
        }
      } else {
        setParsedContent("");
      }
    };

    parseMarkdown();
  }, [notification?.message]);

  useEffect(() => {
    updateBannerHeightVar();
  }, [notification, isDismissed, measuredHeight]); // Remove isScrolledHidden from dependencies
  useEffect(() => {
    const onResize = () => {
      if (contentRef.current) {
        setMeasuredHeight(contentRef.current.offsetHeight);
      }
      updateBannerHeightVar();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Hide banner when navbar would become sticky (mirrors header threshold >= 80)
  useEffect(() => {
    if (!notification || isDismissed) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const STICKY_THRESHOLD = 80; // keep in sync with Header logic
        const shouldHide = window.scrollY >= STICKY_THRESHOLD;
        setIsScrolledHidden(shouldHide);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // set initial state based on current scroll position
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [notification, isDismissed]);

  // Measure content height when notification loads
  // Replace the existing measurement useEffect with this:
  useEffect(() => {
    if (!notification) {
      document.documentElement.style.setProperty("--banner-height", "0px");
      return;
    }
    
    const measure = () => {
      if (contentRef.current) {
        const height = contentRef.current.offsetHeight;
        setMeasuredHeight(height);
        // Update the CSS variable with the measured height
        if (!isDismissed) {
          document.documentElement.style.setProperty("--banner-height", `${height}px`);
        }
      }
    };
    
    measure();
    const t = setTimeout(measure, 100); // Slightly longer delay for fonts
    return () => clearTimeout(t);
  }, [notification, isDismissed]);

  if (!notification) return null;

  const isOpen = !isDismissed && !isScrolledHidden;
  const shouldReserveSpace = !isDismissed; // Reserve space even when scrolled hidden
  return (
    <div
      ref={wrapperRef}
      className="w-full fixed top-0 left-0 z-50"
      aria-hidden={!isOpen}
    >
      <div
      style={{
        maxHeight: isOpen ? measuredHeight : 0,
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "translateY(0)" : "translateY(-8px)",
        transition: "max-height 250ms ease, opacity 200ms ease, transform 200ms ease",
        overflow: "hidden",
      }}
      >
        <div ref={contentRef} className="bg-orange-400 text-white py-2">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 laptop-lg:px-8">
            <div 
              className="text-sm prose prose-invert prose-sm max-w-none [&>*]:my-0 [&>p]:inline [&>strong]:font-semibold [&>em]:italic"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
            <button
              className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-white/20 transition"
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
