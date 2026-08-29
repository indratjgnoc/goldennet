'use client';

import { useState } from 'react';

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CoveragePage() {
  const [location, setLocation] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!location.trim()) {
      return;
    }

    setSearched(true);
  };

  return (
    <>
      <Navbar />

      <Box
        component="section"
        sx={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          py: 10,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 70,
                height: 70,
                mx: 'auto',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  'rgba(34,197,94,0.1)',
                color: 'primary.main',
              }}
            >
              <LocationOnRoundedIcon fontSize="large" />
            </Box>

            <Typography
              color="primary.main"
              sx={{
                mt: 3,
                fontWeight: 800,
                letterSpacing: '0.16em',
                fontSize: '0.78rem',
              }}
            >
              COVERAGE CHECK
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
              Apakah Golden Net
              tersedia di area Anda?
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 3,
                lineHeight: 1.8,
              }}
            >
              Masukkan nama daerah atau alamat untuk
              mengetahui ketersediaan jaringan Golden Net.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                mt: 5,
                maxWidth: 650,
                mx: 'auto',
              }}
            >
              <TextField
                fullWidth
                placeholder="Contoh: Biaro, Bukittinggi"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
              />

              <Button
                variant="contained"
                onClick={handleSearch}
                startIcon={<SearchRoundedIcon />}
              >
                Cek
              </Button>
            </Box>

            {searched && (
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 3,
                  border:
                    '1px solid rgba(34,197,94,0.25)',
                  backgroundColor:
                    'rgba(34,197,94,0.05)',
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  Lokasi berhasil dicari
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Pemeriksaan coverage untuk:
                  <strong> {location}</strong>
                </Typography>

                <Typography
                  color="primary.main"
                  sx={{
                    mt: 1,
                    fontSize: '0.85rem',
                  }}
                >
                  Sistem coverage API akan kita hubungkan
                  pada tahap berikutnya.
                </Typography>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}