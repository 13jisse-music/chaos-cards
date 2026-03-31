import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Chaos Cards",
  description: "Jeu de cartes multijoueur temps réel — 2 à 4 joueurs",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-[#0f0f1a] text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
