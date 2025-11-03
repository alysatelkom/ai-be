# Uncertainty Budget Calculator

Aplikasi web untuk menghitung budget ketidakpastian pengukuran, dibangun dengan Next.js, TypeScript, dan Prisma.

## 🎯 Fitur Utama

### 1. **Autentikasi**
- Halaman Login dengan email dan password
- Halaman Registrasi untuk membuat akun baru
- Session management menggunakan NextAuth.js

### 2. **Database Instrumen**
- Kelola instrumen pengukuran (tambah, edit, hapus)
- Informasi lengkap:
  - Nama Instrumen
  - Merek (Brand)
  - Tipe/Model
  - Serial Number
  - Besaran Ukur (Measurement Quantities)
  - Rentang Ukur (Measurement Range)
  - CMC (Calibration and Measurement Capability)
  - Drift
  - Ketidakpastian Kalibrasi

### 3. **Kalkulator Budget Ketidakpastian**
- Workflow interaktif:
  1. Pilih Instrumen
  2. Pilih Besaran Ukur
  3. Pilih Rentang Ukur
  4. Tampilkan Kalkulator
- Komponen Default:
  - Sertifikat Kalibrasi Standar
  - Drift
  - Resolusi / Readability
  - Repeatability
- Fitur:
  - Tambah/hapus komponen ketidakpastian
  - Edit satuan dan nilai ketidakpastian
  - Pilih distribusi (Normal, Rectangular, Type A)
  - Perhitungan otomatis:
    - Ui, Ci, UiCi
    - (UiCi)², (UiCi)⁴/ni
    - Combined Standard Uncertainty (uc)
    - Effective Degrees of Freedom (veff)
    - Expanded Uncertainty (U)

### 4. **Tema Gelap/Terang**
- Toggle tema menggunakan next-themes
- Persisten di seluruh sesi

### 5. **Bahasa Indonesia**
- Semua UI menggunakan bahasa Indonesia
- Pesan error dalam bahasa Indonesia

## 🛠️ Teknologi

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** SQLite dengan Prisma ORM
- **Authentication:** NextAuth.js
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## 📦 Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd ai-be
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

4. Generate Prisma Client dan buat database:
```bash
npx prisma generate
npx prisma db push
```

5. Jalankan development server:
```bash
npm run dev
```

6. Buka browser di `http://localhost:3000`

## 🗄️ Database Schema

### User
- id, email, name, password
- Relations: instruments[], templates[]

### Instrument
- id, name, brand, type, serialNumber
- Relations: measurementQuantities[]

### MeasurementQuantity
- id, name
- Relations: instrument, ranges[]

### MeasurementRange
- id, minRange, maxRange, unit
- cmc, drift, calibrationUncertainty
- Relations: measurementQuantity, templates[]

### Template
- id, name
- Relations: user, measurementRange, components[]

### TemplateComponent
- id, name, unit, uncertainty
- distribution, divisor, ni, order
- Relations: template

## 📝 Penggunaan

### Menambah Instrumen

1. Login ke aplikasi
2. Navigasi ke "Database Instrumen"
3. Klik "Tambah Instrumen"
4. Isi form dengan data instrumen:
   - Informasi dasar (nama, merek, tipe, serial number)
   - Besaran ukur dan rentang ukur
   - CMC, drift, dan ketidakpastian kalibrasi
5. Klik "Simpan"

### Menggunakan Kalkulator

1. Navigasi ke "Kalkulator Budget Ketidakpastian"
2. Pilih instrumen dari dropdown
3. Pilih besaran ukur
4. Pilih rentang ukur
5. Klik "Tampilkan Kalkulator"
6. Review atau edit komponen ketidakpastian
7. Tambah komponen baru jika diperlukan
8. Lihat hasil perhitungan di bagian bawah

### Rumus Perhitungan

- **Ui** = U / Divisor
- **Ci** = 1 (selalu)
- **UiCi** = Ui × Ci
- **(UiCi)²** = (UiCi)²
- **(UiCi)⁴/ni** = (UiCi)⁴ / ni

**Hasil Akhir:**
- **uc** = √(Σ(UiCi)²)
- **veff** = uc⁴ / √(Σ((UiCi)⁴/ni))
- **k** = 2
- **U** = k × uc

## 🎨 Struktur Kode

```
ai-be/
├── app/
│   ├── api/
│   │   ├── auth/[nextauth]/     # NextAuth API routes
│   │   ├── register/            # Registration endpoint
│   │   └── instruments/         # Instruments CRUD API
│   ├── dashboard/
│   │   ├── calculator/          # Calculator page
│   │   ├── instruments/         # Instruments management
│   │   └── layout.tsx           # Dashboard layout
│   ├── login/                   # Login page
│   ├── register/                # Register page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home (redirect)
│   ├── providers.tsx            # App providers
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard-nav.tsx        # Dashboard navigation
│   ├── instrument-dialog.tsx    # Instrument add/edit dialog
│   └── theme-toggle.tsx         # Theme toggle button
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma client
│   └── utils.ts                 # Utility functions
├── prisma/
│   └── schema.prisma            # Database schema
└── types/
    └── next-auth.d.ts           # NextAuth type definitions
```

## 🚀 Deploy

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di Vercel
3. Set environment variables
4. Deploy

### Manual

```bash
npm run build
npm start
```

## 📋 TODO (Future Enhancements)

- [ ] Template management (save/load templates)
- [ ] Export to PDF
- [ ] Multiple measurement quantities per instrument
- [ ] Batch import instruments from CSV
- [ ] User management (admin panel)
- [ ] Audit log
- [ ] Chart visualization

## 📄 Lisensi

MIT

## 👨‍💻 Developer

Developed with ❤️ using Claude Code
