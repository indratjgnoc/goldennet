'use client';
import Link from 'next/link';

import {
  Box,
  Container,
  Divider,
  Grid,
  Typography,
} from '@mui/material';

import WifiRoundedIcon from '@mui/icons-material/WifiRounded';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 10,
        backgroundColor: '#080B09',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Container maxWidth="xl" sx={{ py: 7 }}>
        <Grid container spacing={5}>
          {/* BRAND */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'primary.main',
                  color: '#050505',
                }}
              >
                <WifiRoundedIcon />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                GOLDEN
                <Box component="span" sx={{ color: 'primary.main' }}>
                  NET
                </Box>
              </Typography>
            </Box>

            <Typography
              color="text.secondary"
              sx={{
                maxWidth: 460,
                lineHeight: 1.8,
              }}
            >
              Penyedia layanan internet yang menghadirkan koneksi cepat,
              stabil, dan terpercaya untuk rumah, bisnis, serta kebutuhan
              profesional.
            </Typography>
          </Grid>

          {/* NAVIGATION */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography component="div" sx={{ fontWeight: 700, mb: 2 }}>
              Navigasi
            </Typography>

            {[
              ['Home', '/'],
              ['Layanan', '/layanan'],
              ['Paket', '/paket'],
              ['Coverage', '/coverage'],
            ].map(([label, href]) => (
              <Typography
                key={href}
                component={Link}
                href={href}
                color="text.secondary"
                sx={{
                  display: 'block',
                  mb: 1.2,
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {label}
              </Typography>
            ))}
          </Grid>

          {/* COMPANY */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography component="div" sx={{ fontWeight: 700, mb: 2 }}>
              Perusahaan
            </Typography>

            {[
              ['Tentang Kami', '/tentang'],
              ['Cabang', '/cabang'],
              ['Berita', '/berita'],
              ['Kontak', '/kontak'],
            ].map(([label, href]) => (
              <Typography
                key={href}
                component={Link}
                href={href}
                color="text.secondary"
                sx={{
                  display: 'block',
                  mb: 1.2,
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {label}
              </Typography>
            ))}
          </Grid>

          {/* HEAD OFFICE */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography component="div" sx={{ fontWeight: 700, mb: 2 }}>
              Kantor Pusat
            </Typography>

            <Typography
              component="div"
              color="text.secondary"
              sx={{ lineHeight: 1.8 }}
            >
              Biaro
              <br />
              Bukittinggi, Sumatera Barat
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        <Typography
          component="div"
          color="text.secondary"
          sx={{ fontSize: '0.85rem', textAlign: 'center' }}
        >
          © {new Date().getFullYear()} Golden Net. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}