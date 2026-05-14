"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown } from "lucide-react"
import { theme, type NavItem } from "@/lib/theme"

export default function Navbar() {
  const navItems = theme.navbar.items as NavItem[]
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const submenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
        setOpenSubmenu(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleNavClick = (item: NavItem) => {
    if (item.submenu && item.submenu.length > 0) {
      setOpenSubmenu(openSubmenu === item.label ? null : item.label)
    } else if (item.scroll) {
      router.push(item.href)
    }
  }

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
        <div className="py-3 px-4" style={{ backgroundColor: theme.colors.background }}>

          {/* Fila superior: hamburguesa (mobile) | logo | spacer (mobile) */}
          <div className="flex items-center justify-between md:justify-center">
            <button
              className="md:hidden p-2 rounded"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Abrir menú"
              style={{ color: theme.colors.primary }}
            >
              {isMobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>

            <Link href="/" className="flex items-center">
              <img
                src={theme.logo.path}
                alt={theme.site.name}
                width={theme.logo.width}
                height={theme.logo.height}
              />
            </Link>

            {/* Spacer invisible para centrar el logo en mobile */}
            <div className="md:hidden w-10" />
          </div>

          {/* Links de escritorio — ocultos en mobile */}
          <div className="hidden md:flex gap-4 mt-2 justify-center">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.label === "Contacto" && pathname.includes("contact"))
              const hasSubmenu = item.submenu && item.submenu.length > 0

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasSubmenu && setHoveredItem(item.label)}
                  onMouseLeave={() => hasSubmenu && setHoveredItem(null)}
                >
                  <Link
                    href={item.href}
                    className="relative text-sm uppercase tracking-widest px-4 py-1 flex items-center gap-1"
                    style={{
                      color: isActive || hoveredItem === item.label ? (item.color ?? theme.colors.primary) : (item.color ?? "#555"),
                      fontWeight: isActive || hoveredItem === item.label ? 700 : 400,
                      fontStyle: item.italic ? "italic" : "normal",
                      transition: theme.transitions.fast,
                    }}
                    onClick={(e) => {
                      if (hasSubmenu) {
                        e.preventDefault()
                        handleNavClick(item)
                      } else if (item.scroll) {
                        router.push(item.href)
                      }
                    }}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {item.label}
                    {hasSubmenu && <ChevronDown size={14} />}
                    <span
                      className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
                      style={{
                        width: isActive || hoveredItem === item.label ? "100%" : "0%",
                        backgroundColor: theme.colors.primary,
                      }}
                    />
                  </Link>

                  {hasSubmenu && (hoveredItem === item.label || openSubmenu === item.label) && (
                    <div
                      ref={submenuRef}
                      className="absolute top-full left-0 mt-1 py-2 rounded-lg shadow-lg min-w-[180px]"
                      style={{
                        backgroundColor: theme.colors.background,
                        border: `1px solid ${theme.colors.border}`,
                      }}
                    >
                      {item.submenu?.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className="block px-4 py-2 text-sm hover:bg-gray-50"
                          style={{ color: theme.colors.text }}
                          onClick={() => {
                            setOpenSubmenu(null)
                            setHoveredItem(null)
                          }}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Menú mobile — pantalla completa */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 pt-28 px-6"
          style={{ backgroundColor: theme.colors.background }}
        >
          <div className="flex flex-col gap-4 mt-4">
            {navItems.map((item) => {
              const hasSubmenu = item.submenu && item.submenu.length > 0
              return (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className="text-lg uppercase tracking-widest py-3 border-b flex items-center justify-between"
                    style={{ borderColor: theme.colors.border, color: theme.colors.text }}
                    onClick={(e) => {
                      if (hasSubmenu) {
                        e.preventDefault()
                        setOpenSubmenu(openSubmenu === item.label ? null : item.label)
                      } else if (item.scroll) {
                        router.push(item.href)
                        setIsMobileOpen(false)
                      } else {
                        setIsMobileOpen(false)
                      }
                    }}
                  >
                    {item.label}
                    {hasSubmenu && <ChevronDown size={20} />}
                  </Link>

                  {hasSubmenu && openSubmenu === item.label && (
                    <div className="pl-6">
                      {item.submenu?.map((subItem) => (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className="block py-2 text-base border-b"
                          style={{ borderColor: theme.colors.border, color: theme.colors.text }}
                          onClick={() => setIsMobileOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
