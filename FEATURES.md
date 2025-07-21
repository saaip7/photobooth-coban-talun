# Photobooth Coban Talun

Web aplikasi photobooth berbasis Next.js + Tailwind CSS yang berjalan sepenuhnya di browser tanpa backend.

## Fitur yang Telah Diimplementasikan

### ✅ 1. Template Selection
- **Komponen**: `TemplateSelection.tsx`
- **Fitur**: 
  - Pilihan 3 template: 3-slot horizontal, 2-slot vertikal, single frame
  - Template preview dengan SVG
  - Responsive design untuk mobile dan desktop
  - Visual feedback saat template dipilih

### ✅ 2. Photo Upload & Camera
- **Komponen**: `PhotoUpload.tsx`
- **Fitur**:
  - Ambil foto dari kamera dengan `getUserMedia()`
  - Upload foto dari galeri
  - Maksimal 3 foto per sesi
  - Modal camera dengan preview live
  - Thumbnail preview foto yang diupload
  - Delete foto individual
  - Progress indicator

### ✅ 3. Canvas Preview & Download
- **Komponen**: `PreviewDownload.tsx`
- **Hook**: `usePhotoboothCanvas.ts`
- **Fitur**:
  - Real-time canvas preview menggunakan Fabric.js
  - Auto-placement foto ke slot yang sesuai
  - Responsive canvas sizing
  - Loading states dan error handling
  - Download hasil sebagai PNG
  - Refresh preview functionality

### ✅ 4. Canvas Utils & Template System
- **File**: `canvasUtils.ts`
- **Fitur**:
  - Template configuration dengan koordinat slot
  - Image loading dan manipulation
  - Canvas export ke PNG
  - File download functionality
  - Camera stream management

## Struktur Template

Setiap template memiliki konfigurasi:
```typescript
{
  name: string,           // Nama template
  background: string,     // Path ke file template
  photoSlots: Array<{     // Koordinat slot foto
    x: number,
    y: number, 
    width: number,
    height: number
  }>,
  canvasWidth: number,    // Lebar canvas
  canvasHeight: number    // Tinggi canvas
}
```

## Template yang Tersedia

1. **3 Slot Horizontal** (800x400px)
   - 3 slot foto horizontal
   - Cocok untuk group photo

2. **2 Slot Vertikal** (400x600px)
   - 2 slot foto vertikal
   - Cocok untuk portrait couple

3. **Single Frame** (500x400px)
   - 1 slot foto besar
   - Cocok untuk solo photo

## Teknologi

- **Framework**: Next.js 15.4.2
- **Styling**: Tailwind CSS
- **Canvas**: Fabric.js 4.6.0
- **Icons**: Lucide React
- **Language**: TypeScript

## Cara Penggunaan

1. **Pilih Template**: Scroll horizontal untuk memilih template favorit
2. **Ambil/Upload Foto**: 
   - Klik "Ambil Foto" untuk menggunakan kamera
   - Klik "Pilih dari Galeri" untuk upload file
   - Maksimal 3 foto
3. **Preview**: Otomatis muncul preview gabungan di canvas
4. **Download**: Klik tombol download untuk menyimpan hasil sebagai PNG

## Keunggulan

- ✅ **No Backend Required**: Semua proses di browser
- ✅ **Mobile Responsive**: Optimized untuk smartphone
- ✅ **Real-time Preview**: Lihat hasil langsung
- ✅ **Multiple Templates**: Variasi layout
- ✅ **High Quality Export**: Download resolusi tinggi
- ✅ **Camera Integration**: Akses kamera built-in
- ✅ **File Management**: Upload dari galeri
- ✅ **User Friendly**: Interface yang intuitif

## Performance

- Canvas di-resize otomatis untuk mobile
- Image compression untuk performa optimal
- Lazy loading template background
- Memory management dengan proper cleanup

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support (dengan permission camera)
- Mobile browsers: Full support

## Development

```bash
npm install
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`
