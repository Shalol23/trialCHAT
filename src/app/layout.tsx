import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource/dm-serif-display/400.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {default: "Conjunctiva — Small signals. Bigger possibilities.", template: "%s · Conjunctiva"},
  description: "Explore research comparing YOLOv8 and RGB/HSV color features for noninvasive anemia screening, with an interactive educational demonstration.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader/><main id="main" className="route-main">{children}</main><SiteFooter/></body></html>;
}
