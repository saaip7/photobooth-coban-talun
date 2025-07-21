"use client"

import { Button } from "@/components/ui/button"
import { Camera, Heart, Star, Users } from "lucide-react"

interface WelcomeStepProps {
  onNext: () => void
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#74A57F] to-[#5d8a68] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center text-white">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Camera className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Photobooth</h1>
          <h2 className="text-xl md:text-2xl font-semibold text-white/90">Coban Talun</h2>
        </div>

        {/* Description */}
        <div className="mb-8 space-y-4">
          <p className="text-lg text-white/90">
            Abadikan momen indah kamu di Coban Talun dengan template frame yang keren!
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center space-x-2 text-white/80">
              <Heart className="w-5 h-5" />
              <span className="text-sm">Template Keren</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Camera className="w-5 h-5" />
              <span className="text-sm">Kualitas HD</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Star className="w-5 h-5" />
              <span className="text-sm">Mudah Digunakan</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Users className="w-5 h-5" />
              <span className="text-sm">Solo & Group</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onNext}
          size="lg"
          className="w-full bg-white text-[#74A57F] hover:bg-white/90 font-semibold text-lg py-4 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105"
        >
          Mulai Sekarang
        </Button>

        <p className="mt-4 text-sm text-white/70">
          Gratis • Tanpa Login • Instant Download
        </p>
      </div>
    </div>
  )
}
