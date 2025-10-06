import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { Navbar } from "./_components/landing/_components/Navbar";
import Footer from "./_components/landing/_components/Footer";
import { SiteSettingsProvider } from "~/contexts/SiteSettingsContext";
import { getServerSiteSettings } from "~/lib/server-site-settings";
import { ToastProvider } from "~/lib/toast";

export const metadata: Metadata = {
  title: "LootZone",
  description: "LootZone Digital Products and Gaming store",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Fetch initial site settings on the server for better SEO and performance
  const initialSettings = await getServerSiteSettings();

  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&family=Rubik:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Boldonse&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn("min-h-screen flex flex-col")}>
        <TRPCReactProvider>
          <SiteSettingsProvider initialSettings={initialSettings}>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <ToastProvider />
            <Footer />
          </SiteSettingsProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
