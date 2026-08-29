Golden Net

Golden Net adalah aplikasi web untuk menyediakan informasi dan layanan terkait jaringan internet, termasuk fitur pengecekan ketersediaan coverage berdasarkan area dan alamat.

🚀 Tech Stack

Project ini dibangun menggunakan:

Next.js — Framework React untuk pengembangan aplikasi web.
TypeScript — Untuk type safety dan maintainability.
Material UI (MUI) — Library komponen UI untuk membangun interface yang responsif.
Formik — Untuk pengelolaan form dan proses submit.
Yup — Untuk validasi data pada form.
Swagger — Untuk dokumentasi dan pengujian API.
✨ Features
Pengecekan ketersediaan jaringan berdasarkan area.
Input alamat pelanggan.
Validasi form menggunakan Formik dan Yup.
Responsive user interface menggunakan Material UI.
REST API menggunakan Next.js API Routes.
Dokumentasi API menggunakan Swagger.
Struktur project menggunakan TypeScript.
📡 Coverage API

Golden Net menyediakan endpoint untuk melakukan pengecekan coverage:

POST /api/coverage

Request
{
  "area": "Biaro",
  "address": "Jl. Contoh No. 123, Biaro"
}

Response
{
  "success": true,
  "data": {
    "available": true,
    "area": "Biaro",
    "address": "Jl. Contoh No. 123, Biaro",
    "message": "Jaringan Golden Net tersedia di area tersebut."
  }
}


Status coverage pada versi saat ini masih menggunakan data area sementara dan dapat dikembangkan lebih lanjut menggunakan data jaringan aktual.

📚 API Documentation

Dokumentasi API menggunakan Swagger untuk menjelaskan endpoint, request, response, dan status code.

Dokumentasi dapat digunakan selama development untuk memeriksa dan menguji API yang tersedia.

📁 Project Structure

Struktur project secara umum:

goldennet/
├── public/
├── src/
│   └── app/
│       ├── api/
│       │   └── coverage/
│       │       └── route.ts
│       └── ...
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md

🛠️ Installation

Clone repository:

git clone https://github.com/indratjgnoc/goldennet.git


Masuk ke directory project:

cd goldennet


Install dependencies:

npm install

▶️ Development

Jalankan development server:

npm run dev


Kemudian buka:

http://localhost:3000

🏗️ Production Build

Untuk membuat production build:

npm run build


Menjalankan aplikasi dalam mode production:

npm start

🔍 Linting

Untuk memeriksa kualitas dan konsistensi kode:

npm run lint

📌 Development Status

Project masih dalam tahap pengembangan.

Completed
 Next.js setup
 TypeScript
 Material UI
 Formik
 Yup validation
 Coverage API
 Swagger documentation
Planned
 Database integration
 Real-time coverage checking
 ODP/ODC network data integration
 Network coverage mapping
 Additional customer features
📄 License

This project is intended for development and operational purposes of Golden Net.
