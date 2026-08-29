import {
  Box,
  Container,
  Typography,
} from '@mui/material';

import PackageCard from '@/components/cards/PackageCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { internetPackages } from '@/data/packages';

export const metadata = {
  title: 'Paket Internet | Golden Net',
  description:
    'Pilihan paket internet Golden Net.',
};

export default function PaketPage() {
  return (
    <>
      <Navbar />

      <Box
        component="section"
        sx={{
          py: {
            xs: 8,
            md: 12,
          },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="span"
            sx={{
              color: 'primary.main',
              fontWeight: 800,
              letterSpacing: '0.16em',
              fontSize: '0.78rem',
            }}
          >
            INTERNET PACKAGES
          </Typography>

          <Typography
            variant="h1"
            sx={{
              mt: 2,
              fontSize: {
                xs: '2.8rem',
                md: '4.5rem',
              },
            }}
          >
            Pilih paket internet Anda.
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 3,
              lineHeight: 1.8,
            }}
          >
            Pilih kecepatan internet yang sesuai dengan
            kebutuhan rumah, keluarga, maupun aktivitas
            profesional Anda.
          </Typography>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          pb: 12,
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
            {internetPackages.map((item) => (
              <PackageCard
                key={item.id}
                packageData={item}
              />
            ))}
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}