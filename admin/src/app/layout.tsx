import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const osans = localFont({
  src: [
    { path: "../../public/fonts/OSans-Light.ttf",   weight: "300", style: "normal" },
    { path: "../../public/fonts/OSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/OSans-Medium.ttf",  weight: "500", style: "normal" },
    { path: "../../public/fonts/OSans-Bold.ttf",    weight: "700", style: "normal" },
  ],
  variable: "--font-osans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TAERI Admin",
  description: "TAERI Admin Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${osans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
