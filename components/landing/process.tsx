"use client"

import { theme } from "@/lib/theme"

export default function Process() {
  const { process: processData } = theme

  return (
    <section
      id="process"
      className="py-20 px-6 md:px-12 rounded-2xl border shadow-md"
      style={{ 
        backgroundColor: "#E5E5E3",
        scrollMarginTop: "180px"
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: theme.colors.text }}
          >
            {processData.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme.colors.textMuted }}
          >
            {processData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processData.steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-xl"
              style={{ backgroundColor: "#fff", boxShadow: theme.shadows.sm }}
            >
              <div
                className="text-4xl font-bold mb-3"
                style={{ color: theme.colors.primary, opacity: 0.3 }}
              >
                {step.number}
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: theme.colors.text }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm"
                style={{ color: theme.colors.textMuted }}
              >
                {step.description}
              </p>
              {idx < processData.steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5" style={{ backgroundColor: theme.colors.border }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}