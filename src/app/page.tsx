import {
  Box,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import NetworkCheckRoundedIcon from '@mui/icons-material/NetworkCheckRounded';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import ServicesSection from '@/components/home/ServicesSection';
import PackagesSection from '@/components/home/PackagesSection';
import CoverageCTA from '@/components/home/CoverageCTA';

import LinkButton from '@/components/ui/LinkButton';

const highlights = [
  {
    icon: SpeedRoundedIcon,
    value: 'High Speed',
    description: 'Internet cepat untuk aktivitas digital.',
  },
  {
    icon: WifiRoundedIcon,
    value: 'Stable Connection',
    description: 'Koneksi stabil untuk rumah dan bisnis.',
  },
  {
    icon: SupportAgentRoundedIcon,
    value: 'Customer Support',
    description: 'Dukungan untuk kebutuhan pelanggan.',
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <Box
        component="main"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 75% 35%, rgba(34,197,94,0.14), transparent 30%), #080B09',
        }}
      >
        {/* DECORATION */}
        <Box
          sx={{
            position: 'absolute',
            width: {
              xs: 220,
              sm: 320,
              md: 500,
            },
            height: {
              xs: 220,
              sm: 320,
              md: 500,
            },
            borderRadius: '50%',
            border:
              '1px solid rgba(34,197,94,0.08)',
            right: {
              xs: '-120px',
              md: '-180px',
            },
            top: {
              xs: '80px',
              md: '20px',
            },
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="xl">
          <Box
            sx={{
              minHeight: {
                xs: 'auto',
                md: 'calc(100vh - 78px)',
              },
              display: 'flex',
              alignItems: 'center',
              py: {
                xs: 8,
                sm: 10,
                md: 12,
              },
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 900,
              }}
            >
              {/* LABEL */}
              <Stack
                component="div"
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  mb: {
                    xs: 2.5,
                    md: 3,
                  },
                }}
              >
                <NetworkCheckRoundedIcon
                  sx={{
                    color: 'primary.main',
                    fontSize: {
                      xs: 20,
                      md: 22,
                    },
                  }}
                />

                <Typography
                  component="span"
                  color="primary.main"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    fontSize: {
                      xs: '0.68rem',
                      sm: '0.75rem',
                    },
                  }}
                >
                  GOLDEN NET • BIARO
                </Typography>
              </Stack>

              {/* TITLE */}
              <Typography
                component="h1"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.055em',
                  lineHeight: {
                    xs: 1.04,
                    md: 0.98,
                  },
                  fontSize: {
                    xs: '2.7rem',
                    sm: '3.7rem',
                    md: '5.5rem',
                    lg: '6.3rem',
                  },
                  maxWidth: {
                    xs: '100%',
                    md: 900,
                  },
                }}
              >
                Internet cepat.
                <br />
                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                  }}
                >
                  Koneksi tanpa batas.
                </Box>
              </Typography>

              {/* DESCRIPTION */}
              <Typography
                color="text.secondary"
                sx={{
                  mt: {
                    xs: 3,
                    md: 4,
                  },
                  maxWidth: 680,
                  fontSize: {
                    xs: '0.98rem',
                    sm: '1.05rem',
                    md: '1.15rem',
                  },
                  lineHeight: 1.8,
                }}
              >
                Golden Net menghadirkan layanan internet
                yang cepat, stabil, dan dapat diandalkan
                untuk rumah, bisnis, pendidikan, dan
                kebutuhan digital Anda.
              </Typography>

              {/* BUTTON */}
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1.5}
                sx={{
                  mt: {
                    xs: 4,
                    md: 5,
                  },
                  width: '100%',
                  maxWidth: {
                    xs: 420,
                    sm: 'none',
                  },
                }}
              >
                <LinkButton
                  href="/paket"
                  variant="contained"
                  size="large"
                  endIcon={
                    <ArrowForwardRoundedIcon />
                  }
                  fullWidth
                  sx={{
                    width: {
                      xs: '100%',
                      sm: 'auto',
                    },
                    minHeight: 52,
                    px: 3,
                  }}
                >
                  Lihat Paket Internet
                </LinkButton>

                <LinkButton
                  href="/coverage"
                  variant="outlined"
                  color="inherit"
                  size="large"
                  fullWidth
                  sx={{
                    width: {
                      xs: '100%',
                      sm: 'auto',
                    },
                    minHeight: 52,
                    px: 3,
                    borderColor:
                      'rgba(255,255,255,0.18)',
                  }}
                >
                  Cek Coverage
                </LinkButton>
              </Stack>

              {/* HIGHLIGHTS */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(3, 1fr)',
                  },
                  gap: {
                    xs: 1.5,
                    md: 2,
                  },
                  mt: {
                    xs: 6,
                    md: 8,
                  },
                  maxWidth: 850,
                }}
              >
                {highlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Box
                      key={item.value}
                      sx={{
                        p: {
                          xs: 2,
                          md: 2.5,
                        },
                        borderRadius: 3,
                        border:
                          '1px solid rgba(255,255,255,0.07)',
                        backgroundColor:
                          'rgba(255,255,255,0.02)',
                      }}
                    >
                      <Icon
                        sx={{
                          color: 'primary.main',
                          fontSize: 25,
                        }}
                      />

                      <Typography
                        sx={{
                          mt: 1.5,
                          fontWeight: 800,
                          fontSize: {
                            xs: '0.95rem',
                            md: '1rem',
                          },
                        }}
                      >
                        {item.value}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          fontSize: '0.82rem',
                          lineHeight: 1.6,
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* SERVICES */}
      <ServicesSection />

      {/* PACKAGES */}
      <PackagesSection />

      {/* COVERAGE */}
      <CoverageCTA />

      {/* FOOTER */}
      <Footer />
    </>
  );
}