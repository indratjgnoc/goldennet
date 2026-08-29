import {
  Box,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CoverageForm from '@/components/forms/CoverageForm';

export const metadata = {
  title: 'Cek Coverage | Golden Net',
  description:
    'Cek ketersediaan jaringan internet Golden Net di lokasi Anda.',
};

export default function CoveragePage() {
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
                maxWidth: 800,
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
                COVERAGE CHECK
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
                Apakah Golden Net
                <br />

                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                  }}
                >
                  tersedia di lokasi Anda?
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
                Masukkan area dan alamat pemasangan
                untuk mengetahui ketersediaan jaringan
                Golden Net.
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* FORM + INFO */}
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
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '0.9fr 1.1fr',
                },
                gap: {
                  xs: 3,
                  md: 5,
                },
                alignItems: 'stretch',
              }}
            >
              {/* FORM */}
              <Box
                sx={{
                  order: {
                    xs: 1,
                    md: 2,
                  },
                  p: {
                    xs: 2.5,
                    sm: 4,
                    md: 5,
                  },
                  borderRadius: {
                    xs: 3,
                    md: 4,
                  },
                  border:
                    '1px solid rgba(255,255,255,0.08)',
                  backgroundColor:
                    'rgba(255,255,255,0.02)',
                }}
              >
                <Stack
                  component="div"
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      color: 'primary.main',
                      backgroundColor:
                        'rgba(34,197,94,0.1)',
                    }}
                  >
                    <LocationOnRoundedIcon />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      Cek Ketersediaan
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: '0.78rem',
                      }}
                    >
                      Isi data lokasi Anda
                    </Typography>
                  </Box>
                </Stack>

                <CoverageForm />
              </Box>

              {/* INFO */}
              <Box
                sx={{
                  order: {
                    xs: 2,
                    md: 1,
                  },
                  p: {
                    xs: 2.5,
                    sm: 4,
                    md: 5,
                  },
                  borderRadius: {
                    xs: 3,
                    md: 4,
                  },
                  background:
                    'linear-gradient(145deg, rgba(34,197,94,0.09), rgba(255,255,255,0.02))',
                  border:
                    '1px solid rgba(34,197,94,0.12)',
                }}
              >
                <Typography
                  component="span"
                  color="primary.main"
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                  }}
                >
                  CARA KERJA
                </Typography>

                <Typography
                  component="h2"
                  sx={{
                    mt: 1.5,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    fontSize: {
                      xs: '1.8rem',
                      md: '2.5rem',
                    },
                  }}
                >
                  Hanya beberapa
                  <br />
                  langkah.
                </Typography>

                <Stack
                  spacing={3}
                  sx={{
                    mt: 4,
                  }}
                >
                  <InfoStep
                    number="01"
                    icon={<MapRoundedIcon />}
                    title="Masukkan lokasi"
                    description="Pilih area dan masukkan alamat pemasangan."
                  />

                  <InfoStep
                    number="02"
                    icon={<WifiRoundedIcon />}
                    title="Cek jaringan"
                    description="Sistem akan memeriksa ketersediaan jaringan di lokasi."
                  />

                  <InfoStep
                    number="03"
                    icon={<LocationOnRoundedIcon />}
                    title="Lanjut pemasangan"
                    description="Jika tersedia, Anda dapat melanjutkan ke pemilihan paket."
                  />
                </Stack>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>

      <Footer />
    </>
  );
}

interface InfoStepProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function InfoStep({
  number,
  icon,
  title,
  description,
}: InfoStepProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: 'flex-start' }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main',
          backgroundColor:
            'rgba(34,197,94,0.1)',
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          color="primary.main"
          sx={{
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
          }}
        >
          {number}
        </Typography>

        <Typography
          sx={{
            mt: 0.3,
            fontWeight: 800,
          }}
        >
          {title}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.5,
            fontSize: '0.82rem',
            lineHeight: 1.65,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}