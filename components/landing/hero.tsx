"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { theme } from "@/lib/theme"

const stats = [
  { number: "500+", label: "Equipos reparados" },
  { number: "10+", label: "Años de experiencia" },
  { number: "100%", label: "Clientes satisfechos" },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % theme.hero.images.length)
    }, theme.hero.slideInterval)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      className="relative w-full"
      style={{
        height: theme.hero.height,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        overflow: "hidden",
      }}
    >
      <div
        className="flex flex-col justify-center px-12 py-16"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
        }}
      >
        <span
          className="inline-block px-3 py-1 mb-4 text-xs rounded-full uppercase tracking-wider"
          style={{
            backgroundColor: `${theme.colors.secondary}20`,
            color: "#fff",
            width: "fit-content",
          }}
        >
          {theme.hero.tag}
        </span>

        <h1
          className="text-5xl md:text-6xl font-bold leading-tight mb-4"
          style={{ color: "#fff", lineHeight: 1.2, fontFamily: "var(--font-poppins)" }}
        >
          {theme.hero.title}
          <br />
          <span className="animated-gradient-text">{theme.hero.titleHighlight}</span>
        </h1>

        <p
          className="text-lg mb-8 max-w-md"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          {theme.hero.subtitle}
        </p>

        <Link
          href={theme.hero.cta.primary.href}
          className="inline-block px-6 py-3 rounded-lg font-semibold w-fit transition-opacity hover:opacity-90"
          style={{
            backgroundColor: "#fff",
            color: theme.colors.dark,
          }}
        >
          {theme.hero.cta.primary.text}
        </Link>
      </div>

      <div className="relative overflow-hidden">
        {theme.hero.images.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: `blur(${theme.hero.blurAmount}) brightness(0.7)`,
              opacity: idx === currentSlide ? 1 : 0,
              transition: `opacity ${theme.hero.slideTransition} ease`,
            }}
          />
        ))}

        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to left, transparent 60%, ${theme.colors.dark}40 100%)`,
          }}
        />

        <div
          className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2"
        >
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-3 text-center backdrop-blur-sm rounded-lg border"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <div className="text-xl font-bold text-white">{stat.number}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden"
      >
        {theme.hero.images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              backgroundColor:
                idx === currentSlide
                  ? theme.colors.secondary
                  : "rgba(255,255,255,0.3)",
              width: idx === currentSlide ? "16px" : "8px",
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          section > div:last-child {
            height: 50vh;
          }
        }
      `}</style>
    </section>
  )
}