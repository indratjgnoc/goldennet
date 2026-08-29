export interface Branch {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  status: 'active' | 'coming-soon';
  isHeadOffice?: boolean;
}

export const branches: Branch[] = [
  {
    id: 1,
    name: 'Golden Net Biaro',
    city: 'Biaro, Bukittinggi',
    address:
      'Pusat Operasional Golden Net Biaro, Bukittinggi',
    phone: '-',
    status: 'active',
    isHeadOffice: true,
  },
  {
    id: 2,
    name: 'Golden Net Cabang 1',
    city: 'Area Layanan',
    address: 'Informasi alamat akan diperbarui.',
    phone: '-',
    status: 'active',
  },
  {
    id: 3,
    name: 'Golden Net Cabang 2',
    city: 'Area Layanan',
    address: 'Informasi alamat akan diperbarui.',
    phone: '-',
    status: 'coming-soon',
  },
];