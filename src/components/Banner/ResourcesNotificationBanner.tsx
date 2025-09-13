"use client";
import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

type Notification = {
  id: number | string;
  message: string;
};

interface Props {
  page:
    | "new_opportunities"
    | "internships"
    | "english_language_learning"
    | "templates"
    | "crp"
    | "approved_opportunities";
}

export default function ResourcesNotificationBanner({ page }: Props) {
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

  if (!notification || dismissed) return null;

  return (
    <div className="w-full flex justify-center">
      <div className="w-[1100px] px-4">
        <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 shadow-sm">
          <div className="flex items-start gap-3 p-4">
            <div className="mt-0.5 shrink-0 rounded-md bg-amber-100 text-amber-700 p-2">
              <Bell className="h-4 w-4" />
            </div>
            <p className="text-sm leading-relaxed">
              {notification.message}
            </p>
            <button
              aria-label="Dismiss notification"
              onClick={() => setDismissed(true)}
              className="ml-auto shrink-0 rounded-md p-1.5 text-amber-700/80 hover:bg-amber-100 hover:text-amber-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

