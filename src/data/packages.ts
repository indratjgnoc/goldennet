export interface InternetPackage {
  id: number;
  name: string;
  speed: string;
  price: number;
  description: string;
  popular?: boolean;
  features: string[];
}

export const internetPackages: InternetPackage[] = [
  {
    id: 1,
    name: 'GNET Home 10',
    speed: '10 Mbps',
    price: 150000,
    description: 'Pilihan ekonomis untuk kebutuhan internet harian.',
    features: [
      'Unlimited Internet',
      'Fiber Optic',
      'Customer Support',
    ],
  },
  {
    id: 2,
    name: 'GNET Home 20',
    speed: '20 Mbps',
    price: 200000,
    description: 'Ideal untuk keluarga dengan aktivitas digital tinggi.',
    popular: true,
    features: [
      'Unlimited Internet',
      'Fiber Optic',
      'Customer Support',
      'Stable Connection',
    ],
  },
  {
    id: 3,
    name: 'GNET Home 50',
    speed: '50 Mbps',
    price: 350000,
    description: 'Performa tinggi untuk rumah dan kebutuhan profesional.',
    features: [
      'Unlimited Internet',
      'Fiber Optic',
      'Priority Support',
      'Stable Connection',
    ],
  },
];