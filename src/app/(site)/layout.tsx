import { Suspense } from "react";
import { Announcement } from "@/components/Announcement";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Announcement />
      <Suspense fallback={<div className="h-17 border-b-4 border-brand" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
