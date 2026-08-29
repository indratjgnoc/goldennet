import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  icon: typeof SpeedRoundedIcon;
}

export const services: ServiceItem[] = [
  {
    id: 1,
    title: 'Internet Rumah',
    description:
      'Koneksi internet cepat dan stabil untuk keluarga, streaming, belajar, dan kebutuhan sehari-hari.',
    icon: HomeRoundedIcon,
  },
  {
    id: 2,
    title: 'Internet Bisnis',
    description:
      'Solusi konektivitas untuk mendukung operasional bisnis dan produktivitas perusahaan.',
    icon: BusinessRoundedIcon,
  },
  {
    id: 3,
    title: 'High Speed Internet',
    description:
      'Nikmati koneksi berkecepatan tinggi untuk kebutuhan digital yang semakin berkembang.',
    icon: SpeedRoundedIcon,
  },
  {
    id: 4,
    title: 'Technical Support',
    description:
      'Tim support siap membantu menangani kebutuhan dan kendala konektivitas pelanggan.',
    icon: SupportAgentRoundedIcon,
  },
];