export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  features: string[];
}

export const services: Service[] = [
  {
    id: 1,
    title: 'Internet Rumah',
    description:
      'Layanan internet cepat dan stabil untuk kebutuhan keluarga, streaming, belajar, bekerja, dan aktivitas digital sehari-hari.',
    icon: 'home',
    category: 'Residential',
    features: [
      'Koneksi stabil',
      'Pilihan kecepatan beragam',
      'Support pelanggan',
      'Instalasi profesional',
    ],
  },
  {
    id: 2,
    title: 'Internet Bisnis',
    description:
      'Koneksi internet yang dirancang untuk mendukung operasional kantor, toko, usaha, dan kebutuhan bisnis.',
    icon: 'business',
    category: 'Business',
    features: [
      'Koneksi dedicated option',
      'Prioritas support',
      'Stabil untuk operasional',
      'Solusi sesuai kebutuhan',
    ],
  },
  {
    id: 3,
    title: 'Internet UMKM',
    description:
      'Solusi konektivitas terjangkau untuk mendukung UMKM menjalankan aktivitas digital dan transaksi online.',
    icon: 'storefront',
    category: 'UMKM',
    features: [
      'Harga terjangkau',
      'Koneksi stabil',
      'Mendukung transaksi online',
      'Support pelanggan',
    ],
  },
  {
    id: 4,
    title: 'Corporate Network',
    description:
      'Solusi jaringan untuk perusahaan dengan kebutuhan konektivitas yang lebih kompleks dan scalable.',
    icon: 'lan',
    category: 'Corporate',
    features: [
      'Network planning',
      'Monitoring',
      'Scalable infrastructure',
      'Technical support',
    ],
  },
];