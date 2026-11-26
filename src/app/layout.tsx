import type { Metadata } from "next";
import { Barlow_Condensed, Poppins } from "next/font/google";
import "./globals.css";

const body = Poppins({ variable: "--font-body", subsets: ["latin", "devanagari"], weight: ["400", "500", "600", "700"] });
const heading = Barlow_Condensed({ variable: "--font-heading", subsets: ["latin"], weight: ["600", "700", "800"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "AvenPro | Universal Sports & Talent Federation",
  description: "AvenPro (USTF): One Platform Unlimited Talent.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${body.variable} ${heading.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
