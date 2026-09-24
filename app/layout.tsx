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
  icons: {
    icon: "/linaw-logo-transparent.png",
    shortcut: "/linaw-logo-transparent.png",
    apple: "/linaw-logo-transparent.png",
  },
  openGraph: {
    type: "website",
    siteName: "Linaw AI",
    title: "Linaw AI",
    description,
    images: [
      {
        url: "/linaw-logo-transparent.png",
        width: 512,
        height: 512,
        alt: "Linaw AI logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Linaw AI",
    description,
    images: ["/linaw-logo-transparent.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(lora.variable, raleway.variable, "font-sans")}
    >
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
