import {
  Box,
  Container,
  Typography,
} from '@mui/material';

import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

const services = [
  {
    icon: HomeRoundedIcon,
    title: 'Internet Rumah',
    description:
      'Koneksi internet stabil untuk kebutuhan keluarga, streaming, belajar, bekerja, dan aktivitas sehari-hari.',
  },
  {
    icon: BusinessRoundedIcon,
    title: 'Internet Bisnis',
    description:
      'Solusi koneksi untuk kantor, toko, usaha, dan kebutuhan operasional bisnis yang membutuhkan koneksi stabil.',
  },
  {
    icon: SpeedRoundedIcon,
    title: 'High Speed Internet',
    description:
      'Nikmati akses internet berkecepatan tinggi dengan koneksi yang nyaman untuk berbagai kebutuhan digital.',
  },
  {
    icon: SupportAgentRoundedIcon,
    title: 'Customer Support',
    description:
      'Tim support siap membantu kebutuhan pelanggan dan menangani kendala layanan internet.',
  },
];

export default function ServicesSection() {
  return (
    <Box
      component="section"
      sx={{
        py: {
          xs: 8,
          sm: 10,
          md: 14,
        },
        backgroundColor: '#0B0F0C',
      }}
    >
      <Container maxWidth="xl">
        {/* HEADER */}
        <Box
          sx={{
            maxWidth: 720,
            mb: {
              xs: 5,
              md: 7,
            },
          }}
        >
          <Typography
            color="primary.main"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.15em',
              fontSize: {
                xs: '0.65rem',
                sm: '0.75rem',
              },
            }}
          >
            LAYANAN GOLDEN NET
          </Typography>

          <Typography
            component="h2"
            sx={{
              mt: 1.5,
              fontWeight: 900,
              letterSpacing: '-0.045em',
              lineHeight: 1.08,
              fontSize: {
                xs: '2rem',
                sm: '2.7rem',
                md: '3.6rem',
              },
            }}
          >
            Dibangun untuk
            <br />

            <Box
              component="span"
              sx={{
                color: 'primary.main',
              }}
            >
              koneksi tanpa kompromi.
            </Box>
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 2.5,
              maxWidth: 620,
              lineHeight: 1.8,
              fontSize: {
                xs: '0.92rem',
                sm: '1rem',
              },
            }}
          >
            Golden Net menyediakan layanan konektivitas
            yang dirancang untuk kebutuhan rumah,
            bisnis, dan aktivitas digital masyarakat.
          </Typography>
        </Box>

        {/* SERVICES */}
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
              lg: 3,
            },
          }}
        >
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <Box
                key={service.title}
                sx={{
                  minWidth: 0,
                  p: {
                    xs: 2.5,
                    sm: 3,
                  },
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
                      md: 'translateY(-5px)',
                    },
                    borderColor:
                      'rgba(34,197,94,0.25)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: {
                      xs: 48,
                      md: 54,
                    },
                    height: {
                      xs: 48,
                      md: 54,
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2.5,
                    backgroundColor:
                      'rgba(34,197,94,0.09)',
                    color: 'primary.main',
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: {
                        xs: 25,
                        md: 28,
                      },
                    }}
                  />
                </Box>

                <Typography
                  component="h3"
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
                    mt: 1,
                    lineHeight: 1.7,
                    fontSize: {
                      xs: '0.84rem',
                      md: '0.9rem',
                    },
                  }}
                >
                  {service.description}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}