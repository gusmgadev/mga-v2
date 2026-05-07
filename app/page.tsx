import Navbar from "@/components/landing/navbar"
import MovingBanner from "@/components/landing/moving-banner"
import Hero from "@/components/landing/hero"
import Services from "@/components/landing/services"
import Process from "@/components/landing/process"
import Clients from "@/components/landing/clients"
import Contact from "@/components/landing/contact"
import Footer from "@/components/landing/footer"
import JsonLd from "@/components/landing/json-ld"

export default function Home() {
  return (
    <>
      <JsonLd />
      <MovingBanner />
      <Navbar />
      <main className="pt-[136px]">
        <Hero />
        <Services />
        <Process />
        <Clients />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
