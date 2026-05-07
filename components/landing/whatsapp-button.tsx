"use client"

import { theme } from "@/lib/theme"

export default function WhatsAppButton() {
  const url = `https://wa.me/${theme.contact.whatsapp}?text=Hola%20MGA%20Informática%2C%20quisiera%20hacer%20una%20consulta`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
      style={{
        width: "56px",
        height: "56px",
        backgroundColor: "#25D366",
        boxShadow: "0 4px 16px rgba(37,211,102,0.45)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="white"
        width="30"
        height="30"
      >
        <path d="M16.003 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.347.629 4.64 1.824 6.656L2.667 29.333l6.88-1.787A13.277 13.277 0 0 0 16.003 29.333C23.36 29.333 29.333 23.36 29.333 16S23.36 2.667 16.003 2.667zm0 24.267a11.01 11.01 0 0 1-5.613-1.547l-.4-.24-4.08 1.067 1.08-3.96-.267-.413A10.987 10.987 0 0 1 5.04 16c0-6.04 4.923-10.947 10.963-10.947S27 9.96 27 16s-4.96 10.934-10.997 10.934zm6.013-8.2c-.333-.167-1.947-.96-2.24-1.067-.307-.107-.52-.16-.747.16-.213.32-.84 1.067-1.04 1.28-.187.213-.387.24-.72.08-.333-.16-1.413-.52-2.68-1.653-.987-.88-1.667-1.973-1.853-2.307-.187-.32-.013-.493.147-.653.147-.14.333-.373.493-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.747-1.8-1.027-2.467-.267-.64-.547-.547-.747-.56h-.64c-.213 0-.56.08-.853.4s-1.12 1.093-1.12 2.667 1.147 3.093 1.307 3.307c.16.213 2.24 3.44 5.44 4.827.76.333 1.36.52 1.813.667.76.24 1.453.2 2 .12.613-.093 1.88-.773 2.147-1.52.267-.747.267-1.387.187-1.52-.08-.12-.293-.2-.627-.36z"/>
      </svg>
    </a>
  )
}
