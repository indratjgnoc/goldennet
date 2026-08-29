export interface InternetPackage {
  id: number;
  name: string;
  speed: number;
  price: number;
  description: string;
  popular?: boolean;
  features: string[];
}

export const internetPackages: InternetPackage[] = [
  {
    id: 1,
    name: 'Golden Home 10',
    speed: 10,
    price: 150000,
    description:
      'Pilihan ekonomis untuk kebutuhan internet dasar di rumah.',
    features: [
      'Kecepatan hingga 10 Mbps',
      'Cocok untuk browsing',
      'Social media',
      'Customer support',
    ],
  },
  {
    id: 2,
    name: 'Golden Home 20',
    speed: 20,
    price: 200000,
    description:
      'Koneksi lebih cepat untuk keluarga dengan aktivitas digital yang lebih tinggi.',
    features: [
      'Kecepatan hingga 20 Mbps',
      'Streaming HD',
      'Belajar dan bekerja',
      'Customer support',
    ],
    popular: true,
  },
  {
    id: 3,
    name: 'Golden Home 30',
    speed: 30,
    price: 250000,
    description:
      'Performa tinggi untuk keluarga dengan banyak perangkat.',
    features: [
      'Kecepatan hingga 30 Mbps',
      'Streaming',
      'Gaming',
      'Banyak perangkat',
    ],
  },
  {
    id: 4,
    name: 'Golden Home 50',
    speed: 50,
    price: 350000,
    description:
      'Koneksi berkecepatan tinggi untuk kebutuhan rumah yang intensif.',
    features: [
      'Kecepatan hingga 50 Mbps',
      'Streaming 4K',
      'Gaming',
      'Work from home',
    ],
  },
];