import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeknoMaps · NSosyal",
  description:
    "TEKNOFEST alanındaki takımları, yarışmacıları ve atölyeleri canlı haritada keşfet; yapay zekâ eşleştirmesiyle bağlantı kur.",
};

export const viewport: Viewport = {
  themeColor: "#0F141C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-ns-bg text-slate-100">
        {children}
      </body>
    </html>
  );
}
