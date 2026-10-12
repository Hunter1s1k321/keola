# 🌸 Keola - Romantic Website

Website romantis yang immersive dengan desain minimalis elegant, gradient pink soft, dan animasi yang memukau.

## 📋 Fitur Utama

✨ **Desain Romantis**
- Gradient pink light base yang lembut dan menenangkan
- Tipografi elegant dengan Playfair Display & Lora
- Animasi floating particles yang immersive

🎨 **Visual Design**
- Hero section dengan 2 foto Keola side-by-side
- Gallery section dengan hover effects
- Smooth transitions dan micro-interactions
- Responsive design untuk semua device

🎭 **Interaktivitas**
- Smooth scroll navigation
- Parallax effect dengan mouse movement
- Fade-in animations saat scroll
- Navbar yang berubah saat scroll

## 📁 Struktur Folder

```
keolahtml/
├── index.html          # Main HTML file
├── styles.css          # Styling dengan gradient & animasi
├── script.js           # JavaScript untuk interaktivitas
├── README.md           # File ini
└── assets/
    ├── keola1.jpg      # Foto pertama Keola
    └── keola2.jpg      # Foto kedua Keola
```

## 🚀 Cara Menggunakan

### 1. Setup Awal
```bash
# Pastikan Anda di folder keolahtml
cd c:\Users\marve\Documents\keolahtml

# Copy atau pindahkan file gambar ke folder assets/
# - keola1.jpg → assets/keola1.jpg
# - keola2.jpg → assets/keola2.jpg
```

### 2. Preview Website
Buka file `index.html` dengan double-click atau klik kanan → Open with → Browser pilihan

**Browser yang disarankan:**
- Google Chrome (terbaru)
- Firefox
- Edge
- Safari

### 3. Optimasi Gambar (Opsional tapi Disarankan)

Untuk performa lebih baik, kompres gambar menggunakan tools:
- **Online:** TinyPNG, ImageOptim
- **Ukuran ideal:** 
  - keola1.jpg & keola2.jpg: ~100-200KB setiap file
  - Resolution: 800x400px minimum (untuk hero section)

### 4. Customization

**Mengubah Warna Gradient:**
Edit `styles.css`, ubah nilai pada `:root`:
```css
--primary-pink: #FFB6D9;      /* Pink utama */
--light-pink: #FFC0CB;        /* Pink terang */
--soft-pink: #FFD4E5;         /* Pink soft */
--dark-pink: #FF69B4;         /* Pink gelap */
```

**Mengubah Teks:**
Edit `index.html`, ganti konten di:
- `.title` → Judul utama
- `.subtitle` → Subtitle
- `.description` → Deskripsi

**Menambah Foto:**
Tambah di folder `assets/` dan referensikan di HTML:
```html
<img src="assets/nama-foto.jpg" alt="Deskripsi">
```

## 🎨 Warna Palette

| Elemen | Kode | Deskripsi |
|--------|------|-----------|
| Primary Pink | #FFB6D9 | Warna utama gradient |
| Light Pink | #FFC0CB | Pink terang |
| Soft Pink | #FFD4E5 | Pink sangat soft |
| Dark Pink | #FF69B4 | Aksen pink tua |
| Cream | #FFF8F5 | Background putih soft |

## 💫 Animasi & Effects

- **Gradient Shift** - Background bergeser halus setiap 15 detik
- **Float Particles** - Partikel pink terapung turun setiap 20-28 detik
- **Hover Scale** - Gambar membesar saat dihover
- **Fade-in Scroll** - Elemen muncul saat di-scroll
- **Parallax** - Partikel bergerak mengikuti mouse

## 🔧 Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full Support |
| Firefox | ✅ Full Support |
| Safari | ✅ Full Support |
| Edge | ✅ Full Support |
| IE 11 | ⚠️ Limited |

## 📱 Responsive

Website responsive di:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1023px)
- Mobile (480px - 767px)
- Small Mobile (<480px)

## 🎯 Tips Penggunaan

1. **Untuk Foto Terbaik:**
   - Gunakan foto dengan pencahayaan soft/warm
   - Aspect ratio: 1:1 atau landscape
   - Format: JPG (terkompresi), PNG (transparan)

2. **Performance:**
   - Pastikan gambar sudah dikompresi
   - Gunakan format WebP untuk browser modern
   - Clear browser cache jika ada perubahan

3. **SEO (Jika dihosting online):**
   - Tambah meta tags di `<head>`
   - Optimalkan alt text pada gambar
   - Gunakan structured data (schema.org)

## 📞 Support

Untuk pertanyaan atau saran:
- Periksa browser console (F12) untuk error messages
- Pastikan path gambar sudah benar
- Verify file tidak corrupted

## 📄 License

Website ini dibuat sebagai konsep romantis personal. Bebas untuk dikustomisasi.

---

**✨ Made with Love** | Last Updated: January 2026
