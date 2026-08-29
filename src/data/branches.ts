export interface Branch {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  isHeadOffice?: boolean;
}

export const branches: Branch[] = [
  {
    id: 1,
    name: 'Golden Net Biaro',
    city: 'Bukittinggi',
    address: 'Biaro, Bukittinggi, Sumatera Barat',
    phone: '-',
    isHeadOffice: true,
  },

  {
    id: 2,
    name: 'Golden Net Cabang 2',
    city: 'Sumatera Barat',
    address: 'Alamat cabang akan diperbarui.',
    phone: '-',
  },

  {
    id: 3,
    name: 'Golden Net Cabang 3',
    city: 'Sumatera Barat',
    address: 'Alamat cabang akan diperbarui.',
    phone: '-',
  },
];