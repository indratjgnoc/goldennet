import {
  Box,
  Container,
  Typography,
} from '@mui/material';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PackageCard from '@/components/cards/PackageCard';

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
        component="main"
        sx={{
          overflow: 'hidden',
        }}
      >
        {/* HERO */}
        <Box
          component="section"
          sx={{
            py: {
              xs: 7,
              sm: 9,
              md: 12,
            },
            background:
              'radial-gradient(circle at 50% 0%, rgba(34,197,94,0.11), transparent 45%)',
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                maxWidth: 820,
              }}
            >
              <Typography
                color="primary.main"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                }}
              >
                PAKET INTERNET
              </Typography>

              <Typography
                component="h1"
                sx={{
                  mt: 2,
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                  lineHeight: 1.04,
                  fontSize: {
                    xs: '2.5rem',
                    sm: '3.5rem',
                    md: '5rem',
                  },
                }}
              >
                Pilih kecepatan
                <br />

                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                  }}
                >
                  sesuai kebutuhan.
                </Box>
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 3,
                  maxWidth: 680,
                  lineHeight: 1.8,
                  fontSize: {
                    xs: '0.92rem',
                    sm: '1rem',
                  },
                }}
              >
                Temukan paket internet Golden Net yang
                sesuai dengan kebutuhan rumah, keluarga,
                maupun aktivitas digital Anda.
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* PACKAGES */}
        <Box
          component="section"
          sx={{
            pb: {
              xs: 8,
              sm: 10,
              md: 14,
            },
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                gap: {
                  xs: 2.5,
                  sm: 2.5,
                  md: 3,
                },
                alignItems: 'stretch',
              }}
            >
              {internetPackages.map(
                (packageData) => (
                  <PackageCard
                    key={packageData.id}
                    packageData={packageData}
                  />
                ),
              )}
            </Box>
          </Container>
        </Box>
      </Box>

      <Footer />
    </>
  );
}