import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { theme } from "@/lib/theme"
import WhatsAppButton from "@/components/landing/whatsapp-button"
import AuthSessionProvider from "@/components/shared/session-provider"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const { site, contact } = theme

export const metadata: Metadata = {
  metadataBase: new URL(site.url),

  title: {
    default: "MGA Informática — Servicio Técnico y Soluciones IT en Rada Tilly",
    template: "%s | MGA Informática",
  },

  description:
    "Servicio técnico, reparación de computadoras, desarrollo web y sistemas de gestión en Rada Tilly, Chubut. Más de 20 años brindando soluciones tecnológicas. " +
    contact.phone,

  keywords: [
    "servicio técnico Rada Tilly",
    "reparación computadoras Chubut",
    "mantenimiento informático Rada Tilly",
    "desarrollo web Patagonia",
    "sistemas de gestión Chubut",
    "punto de venta Rada Tilly",
    "consultoría IT Comodoro Rivadavia",
    "MGA informática",
    "mga digital Rada Tilly",
    "soporte técnico Chubut",
    "software a medida Patagonia",
  ],

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
    title:       "MGA Informática — Servicio Técnico y Soluciones IT en Rada Tilly",
    description:
      "Servicio técnico, reparación de computadoras, desarrollo web y sistemas de gestión en Rada Tilly, Chubut. Más de 20 años brindando soluciones tecnológicas en la Patagonia.",
    images: [
      {
        url:    site.ogImage,
        width:  1200,
        height: 630,
        alt:    "MGA Informática — Soluciones Tecnológicas en Rada Tilly, Chubut",
      },
    ],
  },

  twitter: {
    card:        "summary_large_image",
    title:       "MGA Informática — Servicio Técnico y Soluciones IT en Rada Tilly",
    description:
      "Servicio técnico, reparación de computadoras, desarrollo web y sistemas de gestión en Rada Tilly, Chubut.",
    images: [site.ogImage],
  },

  alternates: {
    canonical: site.url,
  },

  category: "technology",

  other: {
    "geo.region":    "AR-U",
    "geo.placename": "Rada Tilly, Chubut, Argentina",
    "geo.position":  "-45.9298;-67.5547",
    ICBM:            "-45.9298, -67.5547",
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
    </html>
  )
}
