"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Asterisk,
  Flag,
  Globe2,
  LayoutDashboard,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { ToggleSwitch } from "./ToggleSwitch";

const nav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/fyeo/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/fyeo", label: "Flags", icon: Flag },
  { href: "/fyeo/environments", label: "Environments", icon: Globe2 },
  { href: "/fyeo/audit", label: "Audit log", icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside className="h-full w-56 shrink-0 overflow-hidden bg-white dark:bg-gray-950 flex flex-col">
      <div className="p-4">
        <Link
          href="/fyeo/overview"
          className="inline-flex text-gray-900 dark:text-white rounded-lg p-1 -m-1 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          aria-label="fyeo"
        >
          <Asterisk className="h-7 w-7" strokeWidth={2} aria-hidden />
        </Link>
      </div>
      <nav className="p-2 flex-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === href || (href !== "/fyeo" && pathname.startsWith(href))
                ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDark ? (
              <>
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                </svg>
                Dark mode
              </>
            ) : (
              <>
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                </svg>
                Light mode
              </>
            )}
          </span>
          <ToggleSwitch
            checked={isDark}
            onChange={toggleTheme}
            label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          />
        </div>
      </div>
    </aside>
  );
}
