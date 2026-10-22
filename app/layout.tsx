import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { theme } from "@/lib/theme"
import WhatsAppButton from "@/components/landing/whatsapp-button"
import AuthSessionProvider from "@/components/shared/session-provider"
import { GoogleAnalytics } from "@next/third-parties/google"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const { site } = theme

export const metadata: Metadata = {
  metadataBase: new URL(site.url),

  title: {
    default: "MGA Informática — Desarrollo Web, Sistemas de Gestión para comercios y empresas y Soporte Técnico en Comodoro Rivadavia - Rada Tilly",
    template: "%s | MGA Informática",
  },

  description:
    "Desarrollo web, tiendas online, sistemas de gestión y soporte informático para empresas y comercios en Comodoro Rivadavia y Rada Tilly, Chubut. Consultanos.",

  authors:   [{ name: "MGA Informática" }],
  creator:   "MGA Informática",
  publisher: "MGA Informática",

  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:              true,
      follow:             true,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  openGraph: {
    type:        "website",
    locale:      "es_AR",
    url:         site.url,
    siteName:    site.name,
    title:       "MGA Informática — Desarrollo Web, Sistemas de Gestión para comercios y empresas y Soporte Técnico en Comodoro Rivadavia - Rada Tilly",
    description:
      "Desarrollo web, tiendas online, sistemas de gestión y soporte informático para empresas y comercios en Comodoro Rivadavia y Rada Tilly, Chubut.",
    images: [
      {
        url:    site.ogImage,
        width:  1677,
        height: 938,
        alt:    "MGA Informática — Desarrollo Web, Sistemas de Gestión y Soporte Técnico en Chubut",
      },
    ],
  },

  twitter: {
    card:        "summary_large_image",
    title:       "MGA Informática — Desarrollo Web, Sistemas de Gestión para comercios y empresas y Soporte Técnico en Comodoro Rivadavia - Rada Tilly",
    description:
      "Desarrollo web, tiendas online, sistemas de gestión y soporte informático en Comodoro Rivadavia y Rada Tilly, Chubut.",
    images: [site.ogImage],
  },

  category: "technology",

  other: {
    "geo.region":    "AR-U",
    "geo.placename": "Rada Tilly, Chubut, Argentina",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
        <WhatsAppButton />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
