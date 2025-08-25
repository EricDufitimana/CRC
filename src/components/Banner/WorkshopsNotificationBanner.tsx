"use client";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, X } from "lucide-react";

type Notification = {
  id: number | string;
  message: string;
  end_time?: string | null;
};

type WorkshopPageKey =
  | "ey_workshops"
  | "s4_workshops"
  | "senior_5_group_a_b_workshops"
  | "senior_5_customer_care"
  | "senior_6_group_a_b_workshops"
  | "senior_6_group_c_workshops"
  | "senior_6_group_d";

interface Props {
  page: WorkshopPageKey;
  theme?: "green" | "blue" | "orange";
}

export default function WorkshopsNotificationBanner({ page, theme = "green" }: Props) {
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
        if (!active) return;
        setNotification(json.notification ?? null);
      } catch {}
    };
    fetchNotification();
    return () => {
      active = false;
    };
  }, [page]);

  const timeLeft = useMemo(() => {
    if (!notification?.end_time) return null;
    const end = new Date(notification.end_time).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  }, [notification?.end_time]);

  if (!notification || dismissed) return null;

  const accent =
    theme === "orange"
      ? {
          ring: "ring-orange-200/70",
          bg: "from-orange-50 via-white to-orange-50",
          border: "border-orange-100",
          dot: "bg-orange-500",
          text: "text-orange-900",
          subtle: "text-orange-700",
        }
      : theme === "blue"
      ? {
          ring: "ring-blue-200/70",
          bg: "from-blue-50 via-white to-blue-50",
          border: "border-blue-100",
          dot: "bg-blue-500",
          text: "text-blue-900",
          subtle: "text-blue-700",
        }
      : {
          ring: "ring-green-200/70",
          bg: "from-green-50 via-white to-green-50",
          border: "border-green-100",
          dot: "bg-green-500",
          text: "text-green-900",
          subtle: "text-green-700",
        };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border ${accent.border} shadow-sm ring-1 ${accent.ring} bg-gradient-to-r ${accent.bg}`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Title row with icons */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${accent.dot}`} />
            <span className={`text-sm font-semibold ${accent.subtle}`}>Workshop Notice</span>
          </div>

          {/* Divider dot on larger screens */}
          <span className="hidden sm:inline h-1 w-1 rounded-full bg-gray-300/60" />

          {/* Countdown if available */}
          {timeLeft && (
            <div className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 text-xs text-gray-800 ring-1 ring-gray-200">
              <Clock className="h-3.5 w-3.5" />
              <span>{timeLeft}</span>
            </div>
          )}

          {/* Dismiss */}
          <button
            aria-label="Dismiss workshop notification"
            onClick={() => setDismissed(true)}
            className="ml-auto inline-flex items-center justify-center rounded-md p-1.5 text-gray-600 hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message */}
        <div className="mt-2">
          <p className={`text-sm leading-relaxed ${accent.text}`}>{notification.message}</p>
        </div>
      </div>
    </div>
  );
}

