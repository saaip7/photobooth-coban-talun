export default function Footer() {
  return (
    <footer className="p-4 py-8 bg-white/70">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <p className="text-[#3E3E3E] font-semibold mb-4">Kolaborasi dengan</p>
          <div className="flex justify-center items-center gap-6">
            {/* Logo placeholders */}
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-500">Logo 1</span>
            </div>
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-500">Logo 2</span>
            </div>
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-500">Logo 3</span>
            </div>
          </div>
        </div>
        <p className="text-[#3E3E3E]/70 text-sm text-center">© 2024 Coban Talun Digital Photobooth</p>
      </div>
    </footer>
  )
}
