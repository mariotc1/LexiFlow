import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
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
      <body className={`${outfit.variable} font-sans antialiased min-h-screen`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:ml-72 p-6 overflow-y-auto h-screen">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
