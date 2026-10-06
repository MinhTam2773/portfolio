import type { Metadata } from "next";
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import FxLayer from "@/components/fx/FxLayer";
import { BOOT_SCRIPT } from "@/components/fx/boot";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Minh Tam Nguyen — Power Platform & AI Solutions Developer",
  description: "Minh Tam Nguyen is a Software Development graduate from SAIT and Power Platform & AI Solutions Developer at Intelbyte Corp, building automation and applied AI solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className={`${geist.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans`}>
        {/* Main content above background */}
        <div className="relative z-10">
          <ConvexClientProvider>
            <Navigation />
            {children}
            <Footer />
            <ChatWidget />
          </ConvexClientProvider>
        </div>
        <FxLayer />
      </body>
    </html>
  );
}
