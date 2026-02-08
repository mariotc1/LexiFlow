import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

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
      <body className={`${outfit.variable} font-sans antialiased min-h-screen bg-[#050505]`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <MobileNav />
          <main className="flex-1 md:ml-72 p-4 md:p-6 overflow-y-auto h-screen pt-20 md:pt-6">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
