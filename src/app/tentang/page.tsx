import {
  Box,
  Container,
  Typography,
} from '@mui/material';

import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const values = [
  {
    icon: WifiRoundedIcon,
    title: 'Reliable Connectivity',
    description:
      'Menghadirkan koneksi yang dapat diandalkan untuk kebutuhan digital pelanggan.',
  },
  {
    icon: HubRoundedIcon,
    title: 'Growing Network',
    description:
      'Mengembangkan jaringan agar semakin banyak wilayah dapat menikmati layanan Golden Net.',
  },
  {
    icon: SecurityRoundedIcon,
    title: 'Customer First',
    description:
      'Mengutamakan pengalaman dan kebutuhan pelanggan dalam setiap layanan.',
  },
];

export const metadata = {
  title: 'Tentang Golden Net',
  description:
    'Tentang Golden Net dan perjalanan membangun konektivitas.',
};

export default function TentangPage() {
  return (
    <>
      <Navbar />

      <Box
        component="section"
        sx={{
          py: {
            xs: 9,
            md: 14,
          },
        }}
      >
        <Container maxWidth="md">
          <Typography
            color="primary.main"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.16em',
              fontSize: '0.78rem',
            }}
          >
            ABOUT GOLDEN NET
          </Typography>

          <Typography
            variant="h1"
            sx={{
              mt: 2,
              fontSize: {
                xs: '2.8rem',
                md: '5rem',
              },
              lineHeight: 1,
            }}
          >
            Connecting
            <br />
            <Box
              component="span"
              sx={{ color: 'primary.main' }}
            >
              Possibilities.
            </Box>
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 4,
              lineHeight: 1.9,
              fontSize: '1.05rem',
            }}
          >
            Golden Net merupakan penyedia layanan internet
            yang berfokus menghadirkan konektivitas yang cepat,
            stabil, dan dapat diandalkan bagi masyarakat,
            keluarga, maupun dunia usaha.
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 2,
              lineHeight: 1.9,
              fontSize: '1.05rem',
            }}
          >
            Dengan pusat operasional di Biaro, Bukittinggi,
            Golden Net terus membangun dan mengembangkan
            jaringan untuk menjangkau lebih banyak pelanggan.
          </Typography>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          py: 10,
          backgroundColor: '#080B09',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {values.map((item) => {
              const Icon = item.icon;

              return (
                <Box
                  key={item.title}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border:
                      '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 40,
                      color: 'primary.main',
                    }}
                  />

                  <Typography
                    component="h3"
                    variant="h5"
                    sx={{ mt: 3, fontWeight: 800 }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 1.5,
                      lineHeight: 1.7,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}