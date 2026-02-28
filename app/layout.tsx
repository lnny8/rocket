import type {Metadata} from "next"
import {Geist_Mono} from "next/font/google"
import "./globals.css"
import localFont from "next/font/local"


const geistpixel = localFont({
  src: "/geistpixel.ttf"
})

export const metadata: Metadata = {
  title: "NEO Terminal Feed",
  description: "ASCII-styled near-Earth asteroid telemetry dashboard powered by NASA data.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistpixel.className} bg-[var(--bg)] font-mono text-[var(--fg)] antialiased`}>{children}</body>
    </html>
  )
}
