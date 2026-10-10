import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource/dm-serif-display/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conjunctiva — A closer look at anemia",
  description: "Explore research comparing YOLOv8 and RGB/HSV color features for noninvasive anemia screening, with an interactive educational demonstration.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
