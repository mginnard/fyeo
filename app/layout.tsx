import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { getAllFlags } from "@/lib/fyeo/sdk";
import { FyeoProvider } from "@/lib/fyeo/client";
import { ThemeProvider } from "./(fyeo)/fyeo/ThemeProvider";
import { Sidebar } from "./(fyeo)/fyeo/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "fyeo — Feature Flags",
  description: "Open-source feature flag platform for Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let flags: Record<string, unknown>;
  try {
    flags = getAllFlags();
  } catch {
    flags = {};
  }
  return (
    <html lang="en" className={`h-full ${inter.variable} ${sourceCodePro.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('fyeo-theme');if(t==='light')document.documentElement.classList.remove('dark');else document.documentElement.classList.add('dark');})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased h-full min-h-screen overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <FyeoProvider flags={flags}>
            <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-950">
              <Sidebar />
              <main className="flex-1 min-h-0 overflow-auto">
                {children}
              </main>
            </div>
          </FyeoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
