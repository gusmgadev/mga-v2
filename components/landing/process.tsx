"use client"

import { useState } from "react"
import { theme } from "@/lib/theme"

const stepDetails = [
  "Establecemos con vos tus necesidades reales y nos adaptamos a lo que necesita tu empresa, comercio o emprendimiento",
  "Diseñamos una propuesta personalizada que se ajusta a tus requerimientos específicos y presupuesto disponible",
  "Desarrollamos tu solución con las mejores tecnologías, manteniendo altos estándares de calidad",
  "Entregamos tu proyecto funcionando y te acompañamos para que aproveches al máximo tu nueva herramienta digital",
]

export default function Process() {
  const { process: processData } = theme
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  return (
    <section
      id="process"
      className="pt-10 pb-20 px-6 md:px-12"
      style={{
        background: `linear-gradient(135deg, #0D1B5E 0%, #1A237E 50%, #42A5F5 100%)`,
        scrollMarginTop: "180px"
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "#fff" }}
          >
            {processData.title}
          </h2>
          <p
            className="text-xl max-w-2xl mx-auto animated-gradient-text"
            style={{ color: "#fff" }}
          >
            {processData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processData.steps.map((step, idx) => (
            <div
              key={idx}
              className="relative"
              onMouseEnter={() => setHoveredStep(idx)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <div
                className="relative p-6 rounded-xl cursor-pointer hover:scale-105"
                style={{
                  backgroundColor: hoveredStep === idx ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  border: `2px solid ${hoveredStep === idx ? "#2979FF" : "rgba(255,255,255,0.2)"}`,
                  transition: "all 0.3s ease"
                }}
              >
                <div
                  className="text-4xl font-bold mb-3"
                  style={{ color: hoveredStep === idx ? "#2979FF" : "#fff", opacity: hoveredStep === idx ? 1 : 0.4 }}
                >
                  {step.number}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#fff" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {step.description}
                </p>
                {idx < processData.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-white/30" />
                )}
              </div>

              {hoveredStep === idx && (
                <div
                  className="absolute z-10 mt-2 p-4 rounded-xl"
                  style={{
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    animation: "fadeIn 0.3s ease"
                  }}
                >
                  <p className="text-sm" style={{ color: theme.colors.text }}>
                    {stepDetails[idx]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/#contact"
            className="inline-block px-8 py-3 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "2px solid rgba(255,255,255,0.5)",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.22)"
              e.currentTarget.style.borderColor = "#2979FF"
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)"
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"
            }}
          >
            ¿Tenés una idea para tu negocio? Escribinos
          </a>
        </div>
      </div>
    </section>
  )
}
