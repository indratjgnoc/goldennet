import {
  Box,
  Container,
  Typography,
} from '@mui/material';

import ServicesSection from '@/components/home/ServicesSection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Layanan | Golden Net',
  description:
    'Layanan internet Golden Net untuk rumah, bisnis, dan kebutuhan profesional.',
};

export default function LayananPage() {
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
          backgroundColor: '#080B09',
        }}
      >
        <Container maxWidth="xl">
          <Typography
            component="span"
            sx={{
              color: 'primary.main',
              fontWeight: 800,
              letterSpacing: '0.16em',
              fontSize: '0.78rem',
            }}
          >
            GOLDEN NET SERVICES
          </Typography>

          <Typography
            variant="h1"
            sx={{
              mt: 2,
              maxWidth: 850,
              fontSize: {
                xs: '2.8rem',
                md: '5rem',
              },
            }}
          >
            Solusi internet untuk setiap kebutuhan.
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 3,
              maxWidth: 700,
              lineHeight: 1.8,
              fontSize: '1.1rem',
            }}
          >
            Dari koneksi rumah hingga kebutuhan bisnis,
            Golden Net menyediakan layanan konektivitas yang
            dirancang untuk memberikan pengalaman internet yang
            cepat dan stabil.
          </Typography>
        </Container>
      </Box>

      <ServicesSection />

      <Footer />
    </>
  );
}