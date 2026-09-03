"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/crp", label: "Dashboard" },
  { href: "/crp/colleges", label: "Colleges" },
  { href: "/crp/essays", label: "Essays" },
  { href: "/crp/deadlines", label: "Deadlines" },
  { href: "/crp/recommendations", label: "Recommendations" },
  { href: "/crp/todo", label: "To-Do" },
];

export function CrpTopNav({ initials = "" }: { initials?: string }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/crp" ? pathname === "/crp" : pathname.startsWith(href);

  return (
    <header className="crp-topnav">
      <Link href="/crp" className="crp-brand">
        <span className="mark">C</span>CRP
      </Link>
      <nav className="crp-nav">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : ""}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="crp-actions">
        <Link href="/dashboard/student" className="crp-switch">
          Student Dashboard <span className="arw">→</span>
        </Link>
        <div className="crp-avatar">{initials || "S"}</div>
      </div>
    </header>
  );
}
