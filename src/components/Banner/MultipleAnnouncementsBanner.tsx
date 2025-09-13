"use client";
import { useEffect, useState } from "react";
import { X, Bell, Clock, Calendar } from "lucide-react";
import MarkdownIt from 'markdown-it';

type Notification = {
  id: string;
  message: string;
  end_time: string | null;
  created_at: string;
  page: string;
};

type PageKey = 
  | "home" 
  | "templates" 
  | "crp" 
  | "english_language_learning" 
  | "internships" 
  | "new_opportunities"
  | "recurring_opportunities"
  | "previous_events" 
  | "upcoming_events"
  | "workshops_ey"
  | "workshops_s4";

interface Props {
  page: PageKey;
  theme?: "green" | "orange" | "blue" | "amber";
  maxAnnouncements?: number;
  containerWidth?: string;
}

export default function MultipleAnnouncementsBanner({ 
  page, 
  theme = "green", 
  maxAnnouncements = 3,
  containerWidth = "w-[1100px]"
}: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Initialize MarkdownIt instance with enhanced link handling
  const md = new MarkdownIt({
    linkify: true,
    breaks: true,
    html: true, // Allow HTML tags in markdown
    typographer: true // Enable smart quotes and other typography
  });

  // Configure link rendering to open in new tab and add theme-specific styling
  const configureMdLinks = (currentTheme: string) => {
    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      const token = tokens[idx];
      const href = token.attrGet('href');
      
      // Add target="_blank" and rel="noopener noreferrer" for external links
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener noreferrer');
      
      // Add theme-specific classes for styling
      const linkClasses = currentTheme === 'orange' ? 'text-orange-700 hover:text-orange-800' :
                         currentTheme === 'blue' ? 'text-blue-700 hover:text-blue-800' :
                         currentTheme === 'amber' ? 'text-amber-700 hover:text-amber-800' :
                         'text-green-700 hover:text-green-800'; // default green
      
      const existingClass = token.attrGet('class') || '';
      token.attrSet('class', `${existingClass} ${linkClasses} font-medium underline hover:no-underline transition-all duration-200`.trim());
      
      return self.renderToken(tokens, idx, options);
    };
  };

  // Configure markdown links with current theme
  configureMdLinks(theme);

  useEffect(() => {
    let active = true;
    const fetchNotifications = async () => {
      try {
        // Fetch multiple announcements (not single)
        const res = await fetch(`/api/announcements/fetch?page=${page}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const json = await res.json();
        
        console.log(`🔍 MultipleAnnouncementsBanner API response for page "${page}":`, json);
        console.log(`📊 Total announcements received:`, Array.isArray(json) ? json.length : 0);
        
        if (!active) return;
        
        // Handle both old format (json.announcements) and new format (direct array)
        const rawNotifications = Array.isArray(json) ? json : (json.announcements || []);
        
        // Filter active announcements and limit to maxAnnouncements
        const activeNotifications = rawNotifications
          .filter((notif: Notification) => {
            // Handle null end_time (never expires) or future end_time
            if (!notif.end_time) {
              console.log(`⏰ Announcement ${notif.id}: endTime=null (never expires), isActive=true`);
              return true; // Never expires
            }
            
            const endTime = new Date(notif.end_time);
            const now = new Date();
            const isActive = endTime > now;
            console.log(`⏰ Announcement ${notif.id}: endTime=${notif.end_time}, isActive=${isActive}`);
            return isActive; // Only show non-expired announcements
          })
          .slice(0, maxAnnouncements);
        
        console.log(`✅ Active announcements after filtering:`, activeNotifications.length);
        console.log(`📋 Active announcements:`, activeNotifications);
        
        setNotifications(activeNotifications);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setLoading(false);
      }
    };
    
    fetchNotifications();
    return () => {
      active = false;
    };
  }, [page, maxAnnouncements]);

  const dismissNotification = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };

  const visibleNotifications = notifications.filter(notif => !dismissedIds.has(notif.id));

  const getTimeRemaining = (endTime: string | null) => {
    // Handle null end_time (never expires)
    if (!endTime) return null;
    
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getThemeClasses = () => {
    switch (theme) {
      case "orange":
        return {
          container: "border-orange-200 bg-gradient-to-r from-orange-50 to-white",
          icon: "text-orange-600 bg-orange-100",
          text: "text-orange-900",
          timeText: "text-orange-700",
          dismissButton: "text-orange-700/80 hover:bg-orange-100 hover:text-orange-800",
          ring: "ring-orange-200",
          linkColor: "text-orange-700 hover:text-orange-800"
        };
      case "blue":
        return {
          container: "border-blue-200 bg-gradient-to-r from-blue-50 to-white",
          icon: "text-blue-600 bg-blue-100",
          text: "text-blue-900",
          timeText: "text-blue-700",
          dismissButton: "text-blue-700/80 hover:bg-blue-100 hover:text-blue-800",
          ring: "ring-blue-200",
          linkColor: "text-blue-700 hover:text-blue-800"
        };
      case "amber":
        return {
          container: "border-amber-200 bg-gradient-to-r from-amber-50 to-white",
          icon: "text-amber-600 bg-amber-100",
          text: "text-amber-900",
          timeText: "text-amber-700",
          dismissButton: "text-amber-700/80 hover:bg-amber-100 hover:text-amber-800",
          ring: "ring-amber-200",
          linkColor: "text-amber-700 hover:text-amber-800"
        };
      default: // green
        return {
          container: "border-green-200 bg-gradient-to-r from-green-50 to-white",
          icon: "text-green-600 bg-green-100",
          text: "text-green-900",
          timeText: "text-green-700",
          dismissButton: "text-green-700/80 hover:bg-green-100 hover:text-green-800",
          ring: "ring-green-200",
          linkColor: "text-green-700 hover:text-green-800"
        };
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center">
        <div className={`${containerWidth} px-4`}>
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (visibleNotifications.length === 0) {
    return null;
  }

  const themeClasses = getThemeClasses();

  return (
    <div className="w-full flex justify-center">
      <div className={`${containerWidth} px-4 space-y-3`}>
        {visibleNotifications.map((notification, index) => {
          const timeRemaining = getTimeRemaining(notification.end_time);
          const createdDate = new Date(notification.created_at).toLocaleDateString();
          
          return (
            <div
              key={notification.id}
              className={`relative overflow-hidden rounded-xl border ${themeClasses.container} shadow-sm ring-1 ${themeClasses.ring} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start gap-3 p-4">
                <div className={`mt-0.5 shrink-0 rounded-md ${themeClasses.icon} p-2`}>
                  <Bell className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Announcement content */}
                  <div 
                    className={`text-sm leading-relaxed ${themeClasses.text} prose prose-sm max-w-none announcement-content`}
                    dangerouslySetInnerHTML={{ 
                      __html: md.render(notification.message) 
                    }}
                  />
                  
                  {/* Metadata */}
                  <div className={`flex flex-wrap items-center gap-4 mt-2 text-xs ${themeClasses.timeText}`}>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Posted {createdDate}</span>
                    </div>
                    {timeRemaining && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{timeRemaining}</span>
                      </div>
                    )}
                    {visibleNotifications.length > 1 && (
                      <div className="ml-auto text-xs opacity-60">
                        {index + 1} of {visibleNotifications.length}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  aria-label="Dismiss notification"
                  onClick={() => dismissNotification(notification.id)}
                  className={`ml-auto shrink-0 rounded-md p-1.5 ${themeClasses.dismissButton} transition-colors`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        
        {/* Show summary if there are more announcements */}
        {notifications.length > maxAnnouncements && (
          <div className={`text-center py-2 text-xs ${themeClasses.timeText}`}>
            Showing {Math.min(maxAnnouncements, visibleNotifications.length)} of {notifications.length} announcements
          </div>
        )}
      </div>
    </div>
  );
}
