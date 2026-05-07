"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { theme } from "@/lib/theme"
import { TrendingUp, Clock } from "lucide-react"

const mockData = [
  { label: "Ventas del mes", value: "$6.500.000", change: "+12%", positive: true },
  { label: "Pedidos activos", value: "128", change: "+8%", positive: true },
  { label: "Clientes nuevos", value: "89", change: "+15%", positive: true },
]

const mockCards = [
  { title: "Ingresos", value: "$12.500.000", icon: TrendingUp, color: "#42A5F5" },
  { title: "Pendientes", value: "23", icon: Clock, color: "#F2C230" },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % theme.hero.images.length)
    }, theme.hero.slideInterval)
    return () => clearInterval(interval)
  }, [isHovered])

  return (
    <section
      className="relative w-full"
      style={{ height: theme.hero.height }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right,
            rgba(0, 0, 0, 0.95) 0%,
            rgba(0, 0, 0, 0.95) 45%,
            rgba(0, 0, 0, 0.55) 70%,
            rgba(0, 0, 0, 0.25) 100%)`,
        }}
      />

      <div className="absolute inset-0">
        {theme.hero.images.map((img, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: `blur(${theme.hero.blurAmount}) brightness(0.4)`,
              opacity: idx === currentSlide ? 1 : 0,
              transition: `opacity ${theme.hero.slideTransition} ease`,
            }}
          />
        ))}
      </div>

      <div
        className="relative h-full"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
          padding: "0 clamp(24px, 5vw, 48px)",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          zIndex: 2,
        }}
      >
        <div className="flex flex-col">
          <span
            className="inline-flex items-center gap-2 mb-6 text-xs rounded-full uppercase tracking-wider border animate-fade-up"
            style={{
              borderColor: "rgba(255,255,255,0.30)",
              color: "#fff",
              padding: "4px 14px",
              width: "fit-content",
              animationDelay: "0s",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: theme.colors.secondary }}
            />
            {theme.hero.tag}
          </span>

          <h1
            className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-up"
            style={{
              color: "#fff",
              lineHeight: 1.2,
              fontFamily: "var(--font-poppins)",
              animationDelay: "0.1s",
            }}
          >
            {theme.hero.title}
            <br />
            <span className="animated-gradient-text">{theme.hero.titleHighlight}</span>
          </h1>

          <p
            className="text-lg mb-8 max-w-md animate-fade-up"
            style={{
              color: "rgba(255,255,255,0.65)",
              animationDelay: "0.2s",
            }}
          >
            {theme.hero.subtitle}
          </p>

          <div
            className="flex gap-3 flex-wrap animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              href={theme.hero.cta.primary.href}
              className="inline-block px-8 py-3 rounded-full font-bold transition-all hover:opacity-80"
              style={{
                border: "1px solid rgba(255,255,255,0.50)",
                color: "#fff",
                fontSize: "13px",
              }}
            >
              {theme.hero.cta.primary.text}
            </Link>
            <Link
              href={theme.hero.cta.secondary.href}
              className="inline-block px-8 py-3 rounded-full font-bold transition-all hover:opacity-80"
              style={{
                border: "1px solid rgba(255,255,255,0.50)",
                color: "#fff",
                fontSize: "13px",
              }}
            >
              {theme.hero.cta.secondary.text}
            </Link>
          </div>
        </div>

        <div
          className="hidden md:block animate-slide-in-right"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px",
            padding: "20px",
            animationDelay: "0.4s",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="flex items-center gap-1.5 mb-4 pb-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ef4444" }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22c55e" }} />
            <span className="ml-2 text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
              Panel de Gestión
            </span>
          </div>

          <div className="space-y-0">
            {mockData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2.5"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: "#fff" }}>
                    {item.value}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: item.positive
                        ? "rgba(34,197,94,0.2)"
                        : "rgba(239,68,68,0.2)",
                      color: item.positive ? "#4ade80" : "#ef4444",
                    }}
                  >
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            className="grid grid-cols-2 gap-3 mt-4"
          >
            {mockCards.map((card, idx) => (
              <div
                key={idx}
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}22` }}
                  >
                    <card.icon size={14} style={{ color: card.color }} />
                  </div>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {card.title}
                  </span>
                </div>
                <span className="text-lg font-bold" style={{ color: "#fff" }}>
                  {card.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-6 left-clamp-24px-5vw-48px flex gap-2 z-20"
        style={{ left: "clamp(24px, 5vw, 48px)" }}
      >
        {theme.hero.images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Imagen ${idx + 1}`}
            className="transition-all duration-300"
            style={{
              width: idx === currentSlide ? "24px" : "8px",
              height: "8px",
              borderRadius: "99px",
              backgroundColor:
                idx === currentSlide
                  ? theme.colors.secondary
                  : "rgba(255,255,255,0.30)",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 0.6s ease-out forwards;
        }

        .animate-slide-in-right {
          opacity: 0;
          animation: slideInRight 0.8s ease-out forwards;
          animation-delay: 0.4s;
        }

        @media (max-width: 768px) {
          section {
            height: ${theme.hero.heightMobile} !important;
          }
          .relative.h-full {
            grid-template-columns: 1fr !important;
            padding: 0 24px !important;
            align-items: center !important;
          }
        }
      `}</style>
    </section>
  )
}