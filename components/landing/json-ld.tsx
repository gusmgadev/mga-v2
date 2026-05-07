import { theme } from "@/lib/theme"

export default function JsonLd() {
  const { site, contact, footer, services, logo } = theme

  const data = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    name:        site.name,
    description: footer.description,
    url:         site.url,
    telephone:   contact.phone,
    email:       contact.email,
    foundingDate: "2004",
    image:  `${site.url}${site.ogImage}`,
    logo:   `${site.url}${logo.path}`,
    priceRange: "$$",

    address: {
      "@type":         "PostalAddress",
      streetAddress:   "24 de Marzo 925",
      addressLocality: "Rada Tilly",
      addressRegion:   "Chubut",
      postalCode:      "9001",
      addressCountry:  "AR",
    },

    geo: {
      "@type":    "GeoCoordinates",
      latitude:   -45.9298,
      longitude:  -67.5547,
    },

    sameAs: [
      footer.social.instagram,
      footer.social.facebook,
      footer.social.linkedin,
    ].filter(Boolean),

    contactPoint: {
      "@type":       "ContactPoint",
      telephone:     contact.phone,
      contactType:   "customer service",
      contactOption: "TollFree",
      areaServed:    "AR",
      availableLanguage: "Spanish",
    },

    areaServed: [
      { "@type": "City", name: "Rada Tilly" },
      { "@type": "City", name: "Comodoro Rivadavia" },
      { "@type": "State", name: "Chubut" },
    ],

    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name:    services.title,
      itemListElement: services.items.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type":      "Service",
          name:         service.title,
          description:  service.description,
        },
      })),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
