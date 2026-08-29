import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LanRoundedIcon from '@mui/icons-material/LanRounded';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import { services } from '@/data/services';

const iconMap = {
  home: HomeRoundedIcon,
  business: BusinessRoundedIcon,
  storefront: StorefrontRoundedIcon,
  lan: LanRoundedIcon,
};

export const metadata = {
  title: 'Layanan | Golden Net',
  description:
    'Layanan internet Golden Net untuk rumah, bisnis, UMKM, dan corporate.',
};

export default function LayananPage() {
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
            <Box
              sx={{
                maxWidth: 820,
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
                LAYANAN GOLDEN NET
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
                Solusi internet
                <br />
                <Box
                  component="span"
                  sx={{
                    color: 'primary.main',
                  }}
                >
                  untuk setiap kebutuhan.
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
                    md: '1.08rem',
                  },
                }}
              >
                Dari kebutuhan internet rumah hingga
                jaringan bisnis dan corporate, Golden Net
                menghadirkan konektivitas yang dapat
                disesuaikan dengan kebutuhan pelanggan.
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* SERVICES */}
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
                  xs: 2,
                  sm: 2.5,
                  md: 3,
                },
              }}
            >
              {services.map((service) => {
                const Icon =
                  iconMap[
                    service.icon as keyof typeof iconMap
                  ];

                return (
                  <Card
                    key={service.id}
                    elevation={0}
                    sx={{
                      height: '100%',
                      minWidth: 0,
                      borderRadius: {
                        xs: 3,
                        md: 4,
                      },
                      border:
                        '1px solid rgba(255,255,255,0.07)',
                      backgroundColor:
                        'rgba(255,255,255,0.02)',
                      transition:
                        'transform .25s ease, border-color .25s ease',

                      '&:hover': {
                        transform: {
                          xs: 'none',
                          md: 'translateY(-6px)',
                        },
                        borderColor:
                          'rgba(34,197,94,0.3)',
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: {
                          xs: 2.5,
                          sm: 3,
                          md: 3.5,
                        },
                        '&:last-child': {
                          pb: {
                            xs: 2.5,
                            sm: 3,
                            md: 3.5,
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 54,
                          height: 54,
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main',
                          backgroundColor:
                            'rgba(34,197,94,0.1)',
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: 28,
                          }}
                        />
                      </Box>

                      <Typography
                        component="h2"
                        sx={{
                          mt: 3,
                          fontWeight: 800,
                          fontSize: {
                            xs: '1.05rem',
                            md: '1.15rem',
                          },
                        }}
                      >
                        {service.title}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          mt: 1.5,
                          lineHeight: 1.75,
                          fontSize: {
                            xs: '0.84rem',
                            md: '0.9rem',
                          },
                        }}
                      >
                        {service.description}
                      </Typography>

                      <Stack
                        spacing={1}
                        sx={{
                          mt: 3,
                        }}
                      >
                        {service.features.map(
                          (feature) => (
                            <Stack
                              key={feature}
                              direction="row"
                              spacing={1}
                              sx={{
                                alignItems: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  flexShrink: 0,
                                  borderRadius: '50%',
                                  backgroundColor:
                                    'primary.main',
                                }}
                              />

                              <Typography
                                color="text.secondary"
                                sx={{
                                  fontSize:
                                    '0.82rem',
                                }}
                              >
                                {feature}
                              </Typography>
                            </Stack>
                          ),
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Container>
        </Box>
      </Box>

      <Footer />
    </>
  );
}