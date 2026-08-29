import {
  Box,
  Container,
  Typography,
} from '@mui/material';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BranchCard from '@/components/cards/BranchCard';

import { branches } from '@/data/branches';

export const metadata = {
  title: 'Cabang | Golden Net',
  description:
    'Informasi pusat dan cabang layanan Golden Net.',
};

export default function CabangPage() {
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
              'radial-gradient(circle at 50% 0%, rgba(34,197,94,0.1), transparent 42%)',
          }}
        >
          <Container maxWidth="lg">
            <Typography
              component="span"
              color="primary.main"
              sx={{
                fontWeight: 800,
                letterSpacing: '0.16em',
                fontSize: {
                  xs: '0.65rem',
                  sm: '0.75rem',
                },
              }}
            >
              JARINGAN GOLDEN NET
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
              Terhubung lebih
              <br />

              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                }}
              >
                dekat dengan Anda.
              </Box>
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 3,
                maxWidth: 680,
                lineHeight: 1.8,
                fontSize: {
                  xs: '0.95rem',
                  sm: '1rem',
                },
              }}
            >
              Golden Net berpusat di Biaro, Bukittinggi
              dan terus mengembangkan jaringan layanan
              untuk menjangkau lebih banyak pelanggan.
            </Typography>
          </Container>
        </Box>

        {/* BRANCHES */}
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
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: {
                  xs: 2,
                  sm: 2.5,
                  md: 3,
                },
              }}
            >
              {branches.map((branch) => (
                <Box
                  key={branch.id}
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <BranchCard branch={branch} />
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      </Box>

      <Footer />
    </>
  );
}