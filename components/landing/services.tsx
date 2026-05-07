"use client"

import { theme } from "@/lib/theme"
import { Code, ShoppingCart, Briefcase, Wrench } from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  "shopping-cart": ShoppingCart,
  briefcase: Briefcase,
  tool: Wrench,
}

export default function Services() {
  const { services } = theme

  return (
    <section
      id="services"
      className="py-20 px-6 md:px-12 rounded-2xl border shadow-md"
      style={{ 
        backgroundColor: theme.colors.background,
        scrollMarginTop: "180px"
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: theme.colors.text }}
          >
            {services.title}
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: theme.colors.textMuted }}
          >
            {services.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.items.map((service, idx) => {
            const Icon = iconMap[service.icon] || Code

            return (
              <div
                key={idx}
                className="p-6 rounded-xl transition-transform hover:-translate-y-1"
                style={{
                  backgroundColor: "#fff",
                  boxShadow: theme.shadows.md,
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${theme.colors.primary}15` }}
                >
                  <span style={{ color: theme.colors.primary }}>
                    <Icon className="w-6 h-6" />
                  </span>
                </div>

                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: theme.colors.text }}
                >
                  {service.title}
                </h3>

                <p
                  className="text-sm"
                  style={{ color: theme.colors.textMuted }}
                >
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}