import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "LexiFlow - Master Vocabulary",
  description: "Futuristic vocabulary practice with AI and gamification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6 overflow-y-auto h-screen bg-gradient-to-br from-[var(--background)] to-[#0a0a1a]">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
