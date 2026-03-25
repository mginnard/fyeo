"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Asterisk,
  Flag,
  Globe2,
  LayoutDashboard,
  Moon,
  ScrollText,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { ToggleSwitch } from "./ToggleSwitch";

const nav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/flags", label: "Flags", icon: Flag },
  { href: "/environments", label: "Environments", icon: Globe2 },
  { href: "/audit", label: "Audit log", icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside className="h-full w-56 shrink-0 overflow-hidden bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-white/5 flex flex-col">
      <div className="p-4">
        <Link
          href="/overview"
          className="inline-flex text-gray-900 dark:text-white rounded-lg px-1.5 py-1 -m-1 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          aria-label="fyeo"
        >
          <span className="inline-flex items-center gap-0.5">
            <Asterisk
              className="h-5 w-5 shrink-0 opacity-90"
              strokeWidth={2}
              aria-hidden
            />
            <span className="text-sm">fyeo</span>
          </span>
        </Link>
      </div>
      <nav className="p-2 flex-1 flex flex-col gap-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === href || pathname.startsWith(`${href}/`)
                ? "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-medium"
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
                <Moon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                Dark mode
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
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
