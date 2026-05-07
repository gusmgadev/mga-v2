"use client"

import { useState } from "react"
import { theme } from "@/lib/theme"
import { Phone, Mail, MapPin, Send } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al enviar")
      setSubmitted(true)
      setFormData({ name: "", email: "", phone: "", message: "" })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al enviar. Intentá de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <section
      id="contact"
      className="py-20 px-6 md:px-12 rounded-2xl border shadow-md"
      style={{
        backgroundColor: theme.colors.background,
        scrollMarginTop: "180px",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: theme.colors.text }}
          >
            {theme.contact.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme.colors.textMuted }}
          >
            {theme.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3
              className="text-lg font-semibold mb-6"
              style={{ color: theme.colors.text }}
            >
              Información de contacto
            </h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${theme.colors.primary}15` }}
                >
                  <Phone size={18} style={{ color: theme.colors.primary }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                    Teléfono
                  </p>
                  <a
                    href={`tel:${theme.contact.phone}`}
                    className="font-medium"
                    style={{ color: theme.colors.text }}
                  >
                    {theme.contact.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${theme.colors.primary}15` }}
                >
                  <Mail size={18} style={{ color: theme.colors.primary }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                    Email
                  </p>
                  <a
                    href={`mailto:${theme.contact.email}`}
                    className="font-medium"
                    style={{ color: theme.colors.text }}
                  >
                    {theme.contact.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${theme.colors.primary}15` }}
                >
                  <MapPin size={18} style={{ color: theme.colors.primary }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                    Dirección
                  </p>
                  <span className="font-medium" style={{ color: theme.colors.text }}>
                    {theme.contact.address}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            {submitted ? (
              <div
                className="p-8 rounded-xl text-center"
                style={{
                  backgroundColor: `${theme.colors.success}15`,
                  border: `1px solid ${theme.colors.success}`,
                }}
              >
                <p
                  className="text-lg font-semibold mb-2"
                  style={{ color: theme.colors.success }}
                >
                  ¡Mensaje enviado!
                </p>
                <p style={{ color: theme.colors.textMuted }}>
                  Te responderemos a la brevedad.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center gap-3">
                  <label
                    className="w-24 text-sm font-medium flex-shrink-0"
                    style={{ color: theme.colors.text }}
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="flex-1 px-2 py-1.5 rounded-lg border outline-none transition-colors"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: "#fff",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = theme.colors.primary)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = theme.colors.border)
                    }
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label
                    className="w-24 text-sm font-medium flex-shrink-0"
                    style={{ color: theme.colors.text }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="flex-1 px-2 py-1.5 rounded-lg border outline-none transition-colors"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: "#fff",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = theme.colors.primary)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = theme.colors.border)
                    }
                    placeholder="juan@email.com"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label
                    className="w-24 text-sm font-medium flex-shrink-0"
                    style={{ color: theme.colors.text }}
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="flex-1 px-2 py-1.5 rounded-lg border outline-none transition-colors"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: "#fff",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = theme.colors.primary)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = theme.colors.border)
                    }
                    placeholder="+54 297 000-0000"
                  />
                </div>
                <div className="flex items-start gap-3">
                  <label
                    className="w-24 text-sm font-medium flex-shrink-0 pt-1.5"
                    style={{ color: theme.colors.text }}
                  >
                    Mensaje
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="flex-1 px-2 py-1.5 rounded-lg border outline-none transition-colors resize-none"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: "#fff",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = theme.colors.primary)
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = theme.colors.border)
                    }
                    placeholder="Contanos en qué podemos ayudarte..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: "#fff",
                  }}
                >
                  <Send size={18} />
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                </button>
                {errorMsg && (
                  <p className="text-sm text-center" style={{ color: theme.colors.error }}>
                    {errorMsg}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
