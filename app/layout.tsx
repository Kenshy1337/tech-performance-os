import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { AppProviders } from "./providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vector | Prime Score Performance OS",
    template: "%s | Vector",
  },
  description:
    "Vector is a premium Tech Performance OS: one Prime Score for Brain, Build, Body, and Recovery.",
  openGraph: {
    title: "Vector | Prime Score Performance OS",
    description:
      "One score, four domains, and a cinematic workflow for consistent execution.",
    url: siteUrl,
    siteName: "Vector",
    images: [
      {
        url: "/screens/og-vector.jpg",
        width: 1200,
        height: 630,
        alt: "Vector landing preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vector | Prime Score Performance OS",
    description:
      "A premium system for Brain, Build, Body, and Recovery with one deterministic Prime Score.",
    images: ["/screens/og-vector.jpg"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#090b12" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${display.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <AppProviders>
          {children}
          <Analytics />
        </AppProviders>
      </body>
    </html>
  )
}
