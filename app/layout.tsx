import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Lora, Raleway } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
});

const description =
  "Linaw adapts a message to the reader's detail, wording, and delivery, then checks that critical meaning is still intact.";

export const metadata: Metadata = {
  metadataBase: new URL("https://appcon-lumiere-linawai.vercel.app"),
  title: {
    default: "Linaw AI",
    template: "%s · Linaw AI",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "Linaw AI",
    title: "Linaw AI",
    description,
  },
  twitter: {
    card: "summary",
    title: "Linaw AI",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(lora.variable, raleway.variable, "font-sans")}>
      <body className="font-ui antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <div id="main-content">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
