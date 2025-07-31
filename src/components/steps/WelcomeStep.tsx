"use client"

import { Button } from "@/components/ui/button"
import { Camera, Heart, Star, Users } from "lucide-react"
import Image from "next/image"

interface WelcomeStepProps {
  onNext: () => void
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D324A] to-[#1A4A67] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center text-white">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm overflow-hidden">
            <Image 
              src="/icon coban talun.png" 
              alt="Coban Talun Logo" 
              width={80} 
              height={80} 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Photobooth</h1>
          <h2 className="text-xl md:text-2xl font-semibold text-white/90">Coban Talun</h2>
        </div>

        {/* Description */}
        <div className="mb-8 space-y-4">
          <p className="text-lg text-white/90">
            Buat story Instagram yang keren dengan template photobooth Coban Talun!
          </p>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-sm text-white/80">
              📱 Format Story Perfect • 1080x1920 • Siap untuk IG Stories, WhatsApp Status & TikTok
            </p>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center space-x-2 text-white/80">
              <Heart className="w-5 h-5" />
              <span className="text-sm">Story Format</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Camera className="w-5 h-5" />
              <span className="text-sm">HD Quality</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Star className="w-5 h-5" />
              <span className="text-sm">Instant Share</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <Users className="w-5 h-5" />
              <span className="text-sm">Social Ready</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onNext}
          size="lg"
          className="w-full bg-white text-[#0D324A] hover:bg-white/90 font-semibold text-lg py-4 rounded-2xl shadow-lg transition-all duration-200 hover:scale-105"
        >
          Mulai Sekarang
        </Button>

        <p className="mt-4 text-sm text-white/70">
          Gratis • Story Format • Instant Download • Social Media Ready
        </p>
      </div>
    </div>
  )
}
