import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { LanguageProvider } from "@/lib/language-context";
import { SearchProvider } from "@/lib/search-context";
import { getTranslation } from "@/lib/translations";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - Interactive Periodic Table",
    default: "Periodic table",
  },
  description: "Interactive periodic table with detailed element information",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LanguageProvider>
            <SearchProvider>
              <Header />
              {children}
              <Analytics />
            </SearchProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
