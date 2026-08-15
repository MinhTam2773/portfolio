import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
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
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} ${outfit.variable} ${jetbrainsMono.variable}`}>
        {/* Main content above background */}
        <div className="relative z-10">
          <ConvexClientProvider>
            <Navigation />
            {children}
            <Footer />
            <ChatWidget />
          </ConvexClientProvider>
        </div>
      </body>
    </html>
  );
}
