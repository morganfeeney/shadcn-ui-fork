import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"
import { Suspense } from "react"

import "./globals.css"
import "../css/controls.css"

import { QueryProvider } from "@/components/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { PendingVoteApplier } from "@/components/pending-vote-applier"
import { VoteAuthDialogHost } from "@/components/vote-auth-dialog-host"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/config"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import { HotJar } from "@/components/analytics/hot-jar"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [{ url: siteConfig.ogImage, alt: siteConfig.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <HotJar />
      <body>
        <Suspense fallback={null}>
          <QueryProvider>
            <ThemeProvider>
              <PendingVoteApplier />
              <VoteAuthDialogHost />
              <TooltipProvider>{children}</TooltipProvider>
            </ThemeProvider>
          </QueryProvider>
        </Suspense>
      </body>
      <GoogleAnalytics />
    </html>
  )
}
