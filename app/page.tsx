import Navbar from "@/components/landing/navbar"
import MovingBanner from "@/components/landing/moving-banner"
import Hero from "@/components/landing/hero"
import Services from "@/components/landing/services"
import Process from "@/components/landing/process"
import SistemasZoologic from "@/components/landing/sistemas-zoologic"
import Clients from "@/components/landing/clients"
import Noticias from "@/components/landing/noticias"
import Contact from "@/components/landing/contact"
import Footer from "@/components/landing/footer"
import JsonLd from "@/components/landing/json-ld"
import { supabaseAdmin } from "@/services/supabase-admin"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [{ data: clientes }, { data: noticias }] = await Promise.all([
    supabaseAdmin
      .from('clientes')
      .select('id, name, rubro, phone, address, imagen, pagina_web')
      .eq('mostrar_en_landing', true)
      .eq('active', true)
      .order('name'),
    supabaseAdmin
      .from('noticias')
      .select('id, titulo, resumen, imagen_card, created_at')
      .eq('publicada', true)
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(6),
  ])

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
        <Noticias noticias={noticias ?? []} />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
