'use client';
import Link from 'next/link';

import {
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';

export default function CoverageCTA() {
  return (
    <Box
      component="section"
      sx={{
        py: {
          xs: 8,
          md: 11,
        },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            p: {
              xs: 4,
              md: 7,
            },
            borderRadius: 5,
            border: '1px solid rgba(34,197,94,0.2)',
            background:
              'linear-gradient(120deg, rgba(34,197,94,0.12), rgba(255,255,255,0.025))',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: '50%',
              backgroundColor: 'rgba(34,197,94,0.12)',
              filter: 'blur(80px)',
              right: -100,
              top: -120,
            }}
          />

          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              maxWidth: 700,
            }}
          >
            <LocationOnRoundedIcon
              sx={{
                color: 'primary.main',
                fontSize: 40,
                mb: 2,
              }}
            />

            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: {
                  xs: '2rem',
                  md: '3rem',
                },
              }}
            >
              Sudah tersedia di area Anda?
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 2,
                lineHeight: 1.8,
                maxWidth: 600,
              }}
            >
              Cek ketersediaan jaringan Golden Net berdasarkan lokasi
              Anda dan temukan paket internet yang sesuai.
            </Typography>

            <Button
              component={Link}
              href="/coverage"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ mt: 4 }}
            >
              Cek Coverage Area
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}