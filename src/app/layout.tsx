import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PageBackBar } from "@/components/back-button";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PushNotificationsBanner } from "@/components/push-notifications-banner";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { HelpFaqPanel } from "@/components/help-faq-panel";
import { BRAND } from "@/lib/copy";

export const dynamic = "force-dynamic";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.subhead,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: BRAND.name,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdf9f5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${fraunces.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--bg-deep:#fdf9f5;--text-primary:#2d3142;--text-muted:#6b7289;--accent:#d4715a}body{margin:0;background:var(--bg-deep);color:var(--text-primary);font-family:var(--font-sans),system-ui,sans-serif;-webkit-font-smoothing:antialiased}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-deep)] font-sans text-[var(--text-primary)] antialiased">
        <ThemeProvider>
          <PageBackBar />
          <DemoModeBanner />
          <PushNotificationsBanner />
          <PwaInstallBanner />
          <HelpFaqPanel />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
