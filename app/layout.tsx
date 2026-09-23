import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Linaw AI",
  description:
    "Clarify the format. Preserve the meaning. Personalized information with Meaning Check.",
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
      </body>
    </html>
  );
}
