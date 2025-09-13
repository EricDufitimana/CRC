"use client";
import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";

type Notification = {
  id: number | string;
  message: string;
};

type PageKey = "previous_events" | "upcoming_events";

interface Props {
  page: PageKey;
}

export default function EventsNotificationBanner({ page }: Props) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchNotification = async () => {
      try {
        const res = await fetch(`/api/announcements/fetch?page=${page}&single=true`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        console.log("EventsNotificationBanner", json);
        if (!active) return;
        setNotification(json.notification ?? null);
      } catch {}
    };
    fetchNotification();
    return () => {
      active = false;
    };
  }, [page]);

  if (!notification || dismissed) return null;

  const isUpcoming = page === "upcoming_events";
  const accent = isUpcoming
    ? {
        ring: "ring-orange-200",
        bg: "bg-gradient-to-r from-orange-50 to-white",
        icon: "text-orange-600 bg-orange-100",
        text: "text-orange-900",
        hover: "hover:bg-orange-100/70",
      }
    : {
        ring: "ring-green-200",
        bg: "bg-gradient-to-r from-green-50 to-white",
        icon: "text-green-600 bg-green-100",
        text: "text-green-900",
        hover: "hover:bg-green-100/70",
      };

  return (
    <div className="container mx-auto px-4 -mt-6 mb-6">
      <div
        className={`relative overflow-hidden rounded-2xl border border-gray-100 ${accent.bg} ${accent.text} shadow-sm ring-1 ${accent.ring}`}
      >
        <div className="flex items-start gap-4 p-5">
          <div className={`mt-0.5 shrink-0 rounded-xl p-2 ${accent.icon}`}>
            <Megaphone className="h-5 w-5" />
          </div>
          <p className="text-sm leading-relaxed">
            {notification.message}
          </p>
          <button
            aria-label="Dismiss notification"
            onClick={() => setDismissed(true)}
            className={`ml-auto shrink-0 rounded-md p-1.5 ${accent.hover}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

