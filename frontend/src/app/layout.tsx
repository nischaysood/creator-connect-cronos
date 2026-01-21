import type { Metadata } from "next";
import { Outfit, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import { ToastProvider } from "@/components/ToastProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceMono = Space_Grotesk({
  variable: "--font-space-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creator Connect | Premium AI Dashboard",
  description: "Financial coordination for creators and brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${inter.variable} ${spaceMono.variable} antialiased`}
      >
        <Web3Provider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
