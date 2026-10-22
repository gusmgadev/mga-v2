import type { Metadata } from "next"
import Navbar from "@/components/landing/navbar"
import MovingBanner from "@/components/landing/moving-banner"
import Hero from "@/components/landing/hero"
import Services from "@/components/landing/services"
import Process from "@/components/landing/process"
import SistemasZoologic from "@/components/landing/sistemas-zoologic"
import Clients from "@/components/landing/clients"
import Contact from "@/components/landing/contact"
import Footer from "@/components/landing/footer"
import JsonLd from "@/components/landing/json-ld"
import { supabaseAdmin } from "@/services/supabase-admin"
import { theme } from "@/lib/theme"

export const revalidate = 300

export const metadata: Metadata = {
  alternates: { canonical: theme.site.url },
}

export default async function Home() {
  const { data: clientes } = await supabaseAdmin
    .from('clientes')
    .select('id, nombre, rubro, telefono, direccion, imagen, pagina_web')
    .eq('mostrar_en_landing', true)
    .eq('activo', true)
    .order('nombre')

  return (
    <>
      <JsonLd />
      <MovingBanner />
      <Navbar />
      <main className="pt-[136px]">
        <Hero />
        <Services />
        <Process />
        <SistemasZoologic />
        <Clients clientes={clientes ?? []} />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
