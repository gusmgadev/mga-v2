"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { theme } from "@/lib/theme"

export default function Navbar() {
  const navItems = theme.navbar.items
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <nav
        className="fixed top-8 left-0 right-0 z-50"
        style={{
          backgroundColor: theme.colors.background,
          borderBottom: `0.5px solid ${theme.colors.border}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="flex flex-col items-center py-3 px-4"
          style={{ backgroundColor: theme.colors.background }}
        >
          <Link href="/" className="flex items-center">
            <img
              src={theme.logo.path}
              alt={theme.site.name}
              width={theme.logo.width}
              height={theme.logo.height}
            />
          </Link>

          <div className="flex gap-4 mt-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.label === "Contacto" && pathname.includes("contact"))

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative text-sm uppercase tracking-widest px-4 py-1"
                  style={{
                    color: isActive || hoveredItem === item.label ? theme.colors.primary : "#555",
                    fontWeight: isActive || hoveredItem === item.label ? 700 : 400,
                    transition: theme.transitions.fast,
                  }}
                  onMouseEnter={() => setHoveredItem(item.label)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {item.label}
                  <span
                    className="absolute bottom-0 left-0 h-0.5 bg-[#1A237E] transition-all duration-300"
                    style={{
                      width: isActive || hoveredItem === item.label ? "100%" : "0%",
                    }}
                  />
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <button
        className="md:hidden fixed top-12 right-4 z-50 p-2"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        style={{ backgroundColor: theme.colors.background }}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 pt-28 px-6"
          style={{
            backgroundColor: theme.colors.background,
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex flex-col gap-4 mt-8">
            {navItems.map((item) => {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-lg uppercase tracking-widest py-3 border-b"
                  style={{ borderColor: theme.colors.border }}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}