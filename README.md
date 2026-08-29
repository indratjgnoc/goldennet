🌐 Golden Net

Golden Net — Internet Solution for Everyone

Golden Net adalah aplikasi web untuk mendukung layanan jaringan internet, dengan fokus pada pengalaman pengguna yang sederhana, cepat, dan informatif.

Aplikasi ini menyediakan fitur pengecekan ketersediaan coverage jaringan berdasarkan area dan alamat pelanggan.

✨ Features

🌐 Coverage Check
Mengecek ketersediaan jaringan Golden Net berdasarkan area dan alamat.

📝 Form Validation
Validasi input menggunakan Formik dan Yup.

🎨 Modern UI
Antarmuka dibangun menggunakan Material UI dengan desain yang responsif.

⚡ Next.js API
Backend API menggunakan API Routes dari Next.js.

📖 Swagger Documentation
Dokumentasi API tersedia menggunakan Swagger.

📱 Responsive Design
Dapat digunakan pada desktop maupun perangkat mobile.

🛠️ Tech Stack
Technology	Usage
Next.js	Web framework
TypeScript	Type-safe development
Material UI	User interface
Formik	Form management
Yup	Form validation
Swagger	API documentation
📡 Coverage API

Endpoint untuk melakukan pengecekan coverage:

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


Note: Sistem coverage pada tahap pengembangan masih menggunakan data sementara dan dapat dikembangkan lebih lanjut menggunakan data jaringan aktual.

📚 API Documentation

API Golden Net menggunakan Swagger sebagai dokumentasi endpoint.

Swagger membantu developer untuk:

melihat endpoint yang tersedia;
memahami request dan response;
melakukan pengujian API;
memahami struktur data API.
🚀 Getting Started
1. Clone Repository
git clone https://github.com/indratjgnoc/goldennet.git

2. Masuk ke Project
cd goldennet

3. Install Dependencies
npm install

4. Jalankan Development Server
npm run dev


Aplikasi dapat diakses melalui:

http://localhost:3000

🏗️ Production

Build aplikasi:

npm run build


Jalankan production server:

npm start

🔎 Code Quality

Jalankan linting untuk memeriksa kualitas kode:

npm run lint

📂 Project Structure
goldennet/
│
├── public/
│
├── src/
│   └── app/
│       ├── api/
│       │   └── coverage/
│       │       └── route.ts
│       │
│       └── ...
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md

🗺️ Roadmap
 Next.js application
 TypeScript
 Material UI
 Formik
 Yup validation
 Coverage API
 Swagger documentation
 Database integration
 Real coverage validation
 ODP / ODC integration
 Coverage mapping
 Customer service features
🔐 Security

Project ini tidak menyimpan credential atau secret secara langsung di source code.

Untuk konfigurasi yang bersifat rahasia, gunakan environment variable dan jangan memasukkannya ke repository.

📌 Project Status

🚧 Under Development

Golden Net masih dalam tahap pengembangan dan akan terus dikembangkan untuk mendukung kebutuhan layanan jaringan internet.

🔗 Repository

GitHub:
https://github.com/indratjgnoc/goldennet

<div align="center">
🌐 Golden Net

Connecting People. Connecting Future.

Made with ❤️ using Next.js

</div>
