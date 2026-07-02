import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteNav from "@/components/shared/SiteNav";
import SiteFooter from "@/components/shared/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "Frankfurter Polo Club",
    template: "%s · Frankfurter Polo Club",
  },
  description:
    "Frankfurter Polo Club e.V. — bookings, polo lessons, live tournament streaming, club shop and news. Est. 1902, Frankfurt am Main.",
  openGraph: {
    title: "Frankfurter Polo Club",
    description:
      "Facility bookings, polo lessons, live event streaming and the club shop of Frankfurter Polo Club e.V., Frankfurt am Main.",
    locale: "de_DE",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b3626",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
