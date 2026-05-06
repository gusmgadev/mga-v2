import Navbar from "@/components/landing/navbar"
import MovingBanner from "@/components/landing/moving-banner"
import Hero from "@/components/landing/hero"
import Services from "@/components/landing/services"
import Process from "@/components/landing/process"
import Clients from "@/components/landing/clients"
import Footer from "@/components/landing/footer"

export default function Home() {
  return (
    <>
      <MovingBanner />
      <Navbar />
      <main className="pt-[136px]">
        <Hero />
        <Services />
        <Process />
        <Clients />
      </main>
      <Footer />
    </>
  )
}