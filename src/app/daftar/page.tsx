'use client';

import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RegistrationForm from '@/components/forms/RegistrationForm';

import { internetPackages } from '@/data/packages';

export default function DaftarPage() {
  const searchParams = useSearchParams();

  const packageId = Number(
    searchParams.get('paket'),
  );

  const selectedPackage =
    internetPackages.find(
      (item) => item.id === packageId,
    );

  return (
    <>
      <Navbar />

      <Box
        component="main"
        sx={{
          overflow: 'hidden',
        }}
      >
        <Box
          component="section"
          sx={{
            py: {
              xs: 5,
              sm: 7,
              md: 9,
            },
            background:
              'radial-gradient(circle at 50% 0%, rgba(34,197,94,0.09), transparent 45%)',
          }}
        >
          <Container maxWidth="lg">
            <Link
              href="/paket"
              style={{
                textDecoration: 'none',
                width: 'fit-content',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.secondary',
                  mb: 4,

                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                <ArrowBackRoundedIcon
                  sx={{
                    fontSize: 19,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  Kembali ke paket
                </Typography>
              </Box>
            </Link>

            <Box
              sx={{
                maxWidth: 800,
              }}
            >
              <Typography
                color="primary.main"
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                }}
              >
                PENDAFTARAN PELANGGAN
              </Typography>

              <Typography
                component="h1"
                sx={{
                  mt: 1.5,
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                  fontSize: {
                    xs: '2.2rem',
                    sm: '3rem',
                    md: '4rem',
                  },
                }}
              >
                Daftar layanan
                <br />

                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                  }}
                >
                  Golden Net.
                </Box>
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 2,
                  maxWidth: 650,
                  lineHeight: 1.8,
                  fontSize: {
                    xs: '0.9rem',
                    sm: '1rem',
                  },
                }}
              >
                Lengkapi data berikut untuk mengajukan
                pemasangan layanan internet Golden Net.
              </Typography>
            </Box>
          </Container>
        </Box>

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
                  md: '0.7fr 1.3fr',
                },
                gap: {
                  xs: 3,
                  md: 4,
                },
                alignItems: 'start',
              }}
            >
              {/* SELECTED PACKAGE */}
              <Paper
                elevation={0}
                sx={{
                  p: {
                    xs: 2.5,
                    sm: 3,
                  },
                  borderRadius: {
                    xs: 3,
                    md: 4,
                  },
                  border:
                    '1px solid rgba(34,197,94,0.15)',
                  background:
                    'linear-gradient(145deg, rgba(34,197,94,0.08), rgba(255,255,255,0.02))',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1.5,
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
                    <PersonRoundedIcon />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      Paket pilihan
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: '0.75rem',
                      }}
                    >
                      Layanan yang akan diajukan
                    </Typography>
                  </Box>
                </Box>

                {selectedPackage ? (
                  <>
                    <Typography
                      sx={{
                        mt: 4,
                        fontWeight: 900,
                        fontSize: '1.35rem',
                      }}
                    >
                      {selectedPackage.name}
                    </Typography>

                    <Box
                      sx={{
                        mt: 1,
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        color="primary.main"
                        sx={{
                          fontSize: '2.5rem',
                          fontWeight: 900,
                        }}
                      >
                        {selectedPackage.speed}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          fontWeight: 700,
                        }}
                      >
                        Mbps
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        mt: 1,
                        fontWeight: 800,
                      }}
                    >
                      Rp{' '}
                      {new Intl.NumberFormat(
                        'id-ID',
                      ).format(
                        selectedPackage.price,
                      )}
                      <Typography
                        component="span"
                        color="text.secondary"
                        sx={{
                          ml: 0.5,
                          fontSize: '0.72rem',
                        }}
                      >
                        /bulan
                      </Typography>
                    </Typography>
                  </>
                ) : (
                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 4,
                      fontSize: '0.88rem',
                      lineHeight: 1.7,
                    }}
                  >
                    Belum ada paket yang dipilih.
                    Silakan kembali ke halaman paket
                    untuk memilih layanan.
                  </Typography>
                )}
              </Paper>

              {/* REGISTRATION FORM */}
              <Paper
                elevation={0}
                sx={{
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
                <Typography
                  component="h2"
                  sx={{
                    fontWeight: 900,
                    fontSize: {
                      xs: '1.4rem',
                      sm: '1.7rem',
                    },
                  }}
                >
                  Data calon pelanggan
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.7,
                    mb: 4,
                    fontSize: '0.84rem',
                    lineHeight: 1.7,
                  }}
                >
                  Masukkan data yang benar agar tim
                  Golden Net dapat menghubungi Anda.
                </Typography>

                <RegistrationForm
                  packageId={
                    selectedPackage?.id ?? null
                  }
                />
              </Paper>
            </Box>
          </Container>
        </Box>
      </Box>

      <Footer />
    </>
  );
}