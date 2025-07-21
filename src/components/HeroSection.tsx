"use client"

import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center p-4 text-center">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/placeholder.svg?height=800&width=1200')`,
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
          Buat Oleh-Oleh Digital Wisatamu!
        </h1>
        <p className="text-base md:text-lg text-white/90 mb-8 leading-relaxed">
          Abadikan momenmu di Coban Talun dalam bingkai eksklusif.
        </p>
        <Button
          size="lg"
          className="bg-[#74A57F] hover:bg-[#5d8a68] text-white rounded-2xl px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-200 w-full sm:w-auto"
          onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}
        >
          Mulai Sekarang
        </Button>
      </div>
    </section>
  )
}
