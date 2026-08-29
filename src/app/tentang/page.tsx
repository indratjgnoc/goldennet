import {
  Box,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Tentang Kami | Golden Net',
  description:
    'Mengenal Golden Net dan PT GNet sebagai penyedia layanan internet.',
};

const values = [
  {
    icon: SpeedRoundedIcon,
    title: 'Koneksi Berkualitas',
    description:
      'Kami berkomitmen memberikan koneksi internet yang stabil dan sesuai kebutuhan pelanggan.',
  },
  {
    icon: SupportAgentRoundedIcon,
    title: 'Pelayanan Responsif',
    description:
      'Customer support menjadi bagian penting dalam menjaga pengalaman pelanggan.',
  },
  {
    icon: PublicRoundedIcon,
    title: 'Perluasan Jaringan',
    description:
      'Golden Net terus mengembangkan jangkauan jaringan agar semakin dekat dengan pelanggan.',
  },
];

const commitments = [
  'Memberikan layanan internet yang stabil',
  'Mengutamakan kebutuhan pelanggan',
  'Mengembangkan infrastruktur jaringan',
  'Meningkatkan kualitas pelayanan',
  'Memberikan dukungan teknis secara profesional',
];

export default function TentangPage() {
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
              md: 13,
            },
            background:
              'radial-gradient(circle at 50% 0%, rgba(34,197,94,0.11), transparent 45%)',
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                maxWidth: 850,
              }}
            >
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
                TENTANG GOLDEN NET
              </Typography>

              <Typography
                component="h1"
                sx={{
                  mt: 2,
                  fontWeight: 900,
                  letterSpacing: '-0.055em',
                  lineHeight: 1.03,
                  fontSize: {
                    xs: '2.5rem',
                    sm: '3.6rem',
                    md: '5.2rem',
                  },
                }}
              >
                Menghubungkan
                <br />

                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                  }}
                >
                  lebih banyak kemungkinan.
                </Box>
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 3,
                  maxWidth: 700,
                  lineHeight: 1.85,
                  fontSize: {
                    xs: '0.95rem',
                    sm: '1rem',
                    md: '1.08rem',
                  },
                }}
              >
                Golden Net hadir sebagai penyedia layanan
                internet yang berkomitmen menghadirkan
                konektivitas yang cepat, stabil, dan dapat
                diandalkan untuk masyarakat, rumah,
                bisnis, serta berbagai kebutuhan digital.
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* COMPANY INTRO */}
        <Box
          component="section"
          sx={{
            py: {
              xs: 7,
              sm: 9,
              md: 12,
            },
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1.1fr 0.9fr',
                },
                gap: {
                  xs: 5,
                  md: 10,
                },
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography
                  component="span"
                  color="primary.main"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    fontSize: '0.7rem',
                  }}
                >
                  PT GNET
                </Typography>

                <Typography
                  component="h2"
                  sx={{
                    mt: 1.5,
                    fontWeight: 900,
                    letterSpacing: '-0.045em',
                    lineHeight: 1.1,
                    fontSize: {
                      xs: '2rem',
                      sm: '2.7rem',
                      md: '3.5rem',
                    },
                  }}
                >
                  Berawal dari Biaro,
                  <br />

                  <Box
                    component="span"
                    sx={{
                      color: 'primary.main',
                    }}
                  >
                    berkembang lebih luas.
                  </Box>
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 2.5,
                    lineHeight: 1.85,
                    maxWidth: 680,
                    fontSize: {
                      xs: '0.9rem',
                      md: '0.98rem',
                    },
                  }}
                >
                  Pusat operasional Golden Net berada di
                  Biaro, Bukittinggi. Dari pusat tersebut,
                  jaringan dan pelayanan dikembangkan untuk
                  menjangkau area layanan lainnya.
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 2,
                    lineHeight: 1.85,
                    maxWidth: 680,
                    fontSize: {
                      xs: '0.9rem',
                      md: '0.98rem',
                    },
                  }}
                >
                  Dengan dukungan infrastruktur jaringan
                  dan tim teknis, Golden Net berupaya
                  memberikan pengalaman internet yang
                  semakin baik bagi pelanggan.
                </Typography>
              </Box>

              {/* VISUAL CARD */}
              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    minHeight: {
                      xs: 280,
                      sm: 340,
                      md: 420,
                    },
                    borderRadius: {
                      xs: 4,
                      md: 5,
                    },
                    overflow: 'hidden',
                    border:
                      '1px solid rgba(34,197,94,0.15)',
                    background:
                      'radial-gradient(circle at 50% 40%, rgba(34,197,94,0.2), transparent 35%), #0B120D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      width: {
                        xs: 180,
                        md: 280,
                      },
                      height: {
                        xs: 180,
                        md: 280,
                      },
                      border:
                        '1px solid rgba(34,197,94,0.18)',
                      borderRadius: '50%',
                    }}
                  />

                  <Box
                    sx={{
                      position: 'absolute',
                      width: {
                        xs: 260,
                        md: 400,
                      },
                      height: {
                        xs: 260,
                        md: 400,
                      },
                      border:
                        '1px solid rgba(34,197,94,0.08)',
                      borderRadius: '50%',
                    }}
                  />

                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 2,
                      textAlign: 'center',
                    }}
                  >
                    <WifiRoundedIcon
                      sx={{
                        color: 'primary.main',
                        fontSize: {
                          xs: 58,
                          md: 78,
                        },
                      }}
                    />

                    <Typography
                      component="div"
                      sx={{
                        mt: 1,
                        fontWeight: 900,
                        fontSize: {
                          xs: '1.5rem',
                          md: '2rem',
                        },
                      }}
                    >
                      GOLDEN NET
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        fontSize: '0.8rem',
                      }}
                    >
                      Biaro • Bukittinggi
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        <Divider
          sx={{
            borderColor:
              'rgba(255,255,255,0.06)',
          }}
        />

        {/* VALUES */}
        <Box
          component="section"
          sx={{
            py: {
              xs: 7,
              sm: 9,
              md: 12,
            },
            backgroundColor: '#0B0F0C',
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                maxWidth: 700,
                mb: {
                  xs: 5,
                  md: 7,
                },
              }}
            >
              <Typography
                component="span"
                color="primary.main"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  fontSize: '0.7rem',
                }}
              >
                NILAI KAMI
              </Typography>

              <Typography
                component="h2"
                sx={{
                  mt: 1.5,
                  fontWeight: 900,
                  letterSpacing: '-0.045em',
                  fontSize: {
                    xs: '2rem',
                    sm: '2.7rem',
                    md: '3.5rem',
                  },
                }}
              >
                Lebih dari sekadar
                <br />
                koneksi internet.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(3, minmax(0, 1fr))',
                },
                gap: {
                  xs: 2,
                  sm: 2.5,
                  md: 3,
                },
              }}
            >
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <Box
                    key={value.title}
                    sx={{
                      minWidth: 0,
                      p: {
                        xs: 2.5,
                        sm: 3,
                        md: 3.5,
                      },
                      border:
                        '1px solid rgba(255,255,255,0.07)',
                      borderRadius: {
                        xs: 3,
                        md: 4,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2.5,
                        color: 'primary.main',
                        backgroundColor:
                          'rgba(34,197,94,0.1)',
                      }}
                    >
                      <Icon />
                    </Box>

                    <Typography
                      component="div"
                      sx={{
                        mt: 3,
                        fontWeight: 800,
                        fontSize: '1.05rem',
                      }}
                    >
                      {value.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 1,
                        lineHeight: 1.75,
                        fontSize: '0.86rem',
                      }}
                    >
                      {value.description}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Container>
        </Box>

        {/* COMMITMENT */}
        <Box
          component="section"
          sx={{
            py: {
              xs: 7,
              sm: 9,
              md: 12,
            },
          }}
        >
          <Container maxWidth="md">
            <Box
              sx={{
                textAlign: {
                  xs: 'left',
                  md: 'center',
                },
              }}
            >
              <Typography
                component="span"
                color="primary.main"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  fontSize: '0.7rem',
                }}
              >
                KOMITMEN GOLDEN NET
              </Typography>

              <Typography
                component="h2"
                sx={{
                  mt: 1.5,
                  fontWeight: 900,
                  letterSpacing: '-0.045em',
                  lineHeight: 1.1,
                  fontSize: {
                    xs: '2rem',
                    sm: '2.7rem',
                    md: '3.5rem',
                  },
                }}
              >
                Kami terus bergerak
                <br />

                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                  }}
                >
                  menjadi lebih baik.
                </Box>
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 2.5,
                  lineHeight: 1.8,
                  fontSize: {
                    xs: '0.9rem',
                    sm: '1rem',
                  },
                }}
              >
                Komitmen kami tidak berhenti pada
                penyediaan koneksi. Kami ingin membangun
                layanan yang dapat dipercaya dan terus
                berkembang bersama pelanggan.
              </Typography>
            </Box>

            <Stack
              component="div"
              spacing={1.5}
              sx={{
                mt: 5,
                maxWidth: 620,
                mx: {
                  xs: 0,
                  md: 'auto',
                },
              }}
            >
              {commitments.map((item) => (
                <Box
                  key={item}
                  component="div"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <CheckCircleRoundedIcon
                    sx={{
                      color: 'primary.main',
                      fontSize: 21,
                      flexShrink: 0,
                    }}
                  />

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: {
                        xs: '0.86rem',
                        sm: '0.9rem',
                      },
                    }}
                  >
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Container>
        </Box>
      </Box>

      <Footer />
    </>
  );
}