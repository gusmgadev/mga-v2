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
  const [selectedStep, setSelectedStep] = useState<number | null>(null)

  return (
    <section
      id="process"
      className="py-20 px-6 md:px-12"
      style={{ 
        background: `linear-gradient(135deg, #0D1B5E 0%, #1A237E 50%, #42A5F5 100%)`,
        scrollMarginTop: "180px"
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
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
            >
              <div
                onClick={() => setSelectedStep(selectedStep === idx ? null : idx)}
                className="relative p-6 rounded-xl transition-all duration-300 cursor-pointer hover:scale-105"
                style={{ 
                  backgroundColor: selectedStep === idx ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)", 
                  backdropFilter: "blur(8px)", 
                  border: `2px solid ${selectedStep === idx ? "#4ade80" : "rgba(255,255,255,0.2)"}`,
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#4ade80"
                }}
                onMouseLeave={(e) => {
                  if (selectedStep !== idx) {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
                  }
                }}
              >
                <div
                  className="text-4xl font-bold mb-3"
                  style={{ color: selectedStep === idx ? "#4ade80" : "#fff", opacity: selectedStep === idx ? 1 : 0.4 }}
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
              {selectedStep === idx && (
                <div 
                  className="absolute z-10 mt-2 p-4 rounded-xl"
                  style={{ 
                    backgroundColor: "#fff", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    animation: "fadeIn 0.3s ease"
                  }}
                >
                  <div className="relative">
                    <p className="text-sm" style={{ color: theme.colors.text }}>
                      {stepDetails[idx]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}