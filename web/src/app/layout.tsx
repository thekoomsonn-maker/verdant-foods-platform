import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { BagProvider } from "@/components/site/bag";
import { SmoothScroll } from "@/components/motion";
import { ToastProvider } from "@/components/toast";

const jakarta = localFont({ src: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2", variable: "--font-jakarta", weight: "200 800", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Verdant Foods · Fresh from the farm, traced to your table", template: "%s · Verdant Foods" },
  description: "Vegetables and fruit from smallholder farmers in Northern Ghana. Every crate is checked, weighed and traced from the farm to your door.",
  icons: { icon: "/brand/logo-green.png" },
};
export const viewport: Viewport = { themeColor: "#024639" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="antialiased">
        <ToastProvider>
          <BagProvider>
            <SmoothScroll />
            {children}
          </BagProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
