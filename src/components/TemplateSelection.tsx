"use client"

import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

type Template = {
  id: number
  title: string
  preview: string
}

interface TemplateSelectionProps {
  templates: Template[]
  selectedTemplate: number | null
  setSelectedTemplate: (id: number) => void
}

export default function TemplateSelection({
  templates,
  selectedTemplate,
  setSelectedTemplate,
}: TemplateSelectionProps) {
  return (
    <section id="templates" className="p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg md:text-xl font-bold text-[#3E3E3E] mb-6 text-center">Pilih Template Favoritmu</h2>

        {/* Mobile view: vertical stack */}
        <div className="md:hidden space-y-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`p-4 cursor-pointer transition-all duration-200 rounded-2xl ${
                selectedTemplate === template.id
                  ? "ring-4 ring-[#74A57F] bg-white shadow-lg"
                  : "bg-white/80 hover:bg-white hover:shadow-md"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-center">
                <div className="relative flex-shrink-0 w-24 h-24">
                  <img
                    src={template.preview || "/placeholder.svg"}
                    alt={template.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2 bg-[#74A57F] rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="font-semibold text-[#3E3E3E]">{template.title}</h3>
                  <p className="text-sm text-[#3E3E3E]/70 mt-1">Tap untuk memilih template ini</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop view: horizontal scroll */}
        <div className="hidden md:flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`flex-shrink-0 w-64 p-4 cursor-pointer transition-all duration-200 snap-start rounded-2xl ${
                selectedTemplate === template.id
                  ? "ring-4 ring-[#74A57F] bg-white shadow-lg"
                  : "bg-white/80 hover:bg-white hover:shadow-md"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="relative">
                <img
                  src={template.preview || "/placeholder.svg"}
                  alt={template.title}
                  className="w-full h-32 object-cover rounded-xl mb-3"
                />
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2 bg-[#74A57F] rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-[#3E3E3E] text-center">{template.title}</h3>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
