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
    'Informasi kantor pusat dan cabang Golden Net.',
};

export default function CabangPage() {
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
            GOLDEN NET NETWORK
          </Typography>

          <Typography
            variant="h1"
            sx={{
              mt: 2,
              fontSize: {
                xs: '2.8rem',
                md: '5rem',
              },
            }}
          >
            Hadir lebih dekat.
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 3,
              maxWidth: 700,
              lineHeight: 1.8,
            }}
          >
            Golden Net terus memperluas jaringan untuk
            menghadirkan konektivitas yang lebih dekat dengan
            pelanggan.
          </Typography>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          py: 10,
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
            {branches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
              />
            ))}
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}