import {
  Box,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';

import LinkButton from '@/components/ui/LinkButton';

export default function CoverageCTA() {
  return (
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
            position: 'relative',
            overflow: 'hidden',
            borderRadius: {
              xs: 3,
              sm: 4,
              md: 5,
            },
            p: {
              xs: 3,
              sm: 5,
              md: 7,
              lg: 9,
            },
            border:
              '1px solid rgba(34,197,94,0.15)',
            background:
              'radial-gradient(circle at 90% 20%, rgba(34,197,94,0.16), transparent 35%), #0B120D',
          }}
        >
          {/* DECORATION */}
          <Box
            sx={{
              position: 'absolute',
              width: {
                xs: 180,
                md: 360,
              },
              height: {
                xs: 180,
                md: 360,
              },
              borderRadius: '50%',
              border:
                '1px solid rgba(34,197,94,0.1)',
              right: {
                xs: '-100px',
                md: '-130px',
              },
              top: {
                xs: '-70px',
                md: '-120px',
              },
              pointerEvents: 'none',
            }}
          />

          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              maxWidth: 800,
            }}
          >
            {/* ICON */}
            <Box
              sx={{
                width: {
                  xs: 48,
                  md: 56,
                },
                height: {
                  xs: 48,
                  md: 56,
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2.5,
                backgroundColor:
                  'rgba(34,197,94,0.1)',
                color: 'primary.main',
              }}
            >
              <LocationOnRoundedIcon
                sx={{
                  fontSize: {
                    xs: 25,
                    md: 30,
                  },
                }}
              />
            </Box>

            <Typography
              component="span"
              color="primary.main"
              sx={{
                mt: 3,
                display: 'block',
                fontWeight: 800,
                letterSpacing: '0.14em',
                fontSize: {
                  xs: '0.65rem',
                  sm: '0.75rem',
                },
              }}
            >
              CEK COVERAGE
            </Typography>

            <Typography
              component="h2"
              sx={{
                mt: 1.5,
                fontWeight: 900,
                letterSpacing: '-0.045em',
                lineHeight: 1.05,
                fontSize: {
                  xs: '2rem',
                  sm: '2.8rem',
                  md: '4rem',
                },
              }}
            >
              Cari tahu apakah
              <br />

              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                }}
              >
                Golden Net tersedia.
              </Box>
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 2.5,
                maxWidth: 650,
                lineHeight: 1.8,
                fontSize: {
                  xs: '0.9rem',
                  sm: '1rem',
                },
              }}
            >
              Periksa ketersediaan jaringan Golden Net
              berdasarkan lokasi Anda sebelum melakukan
              pemasangan.
            </Typography>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.5}
              sx={{
                mt: 4,
                width: '100%',
                maxWidth: 500,
              }}
            >
              <LinkButton
                href="/coverage"
                variant="contained"
                size="large"
                endIcon={
                  <ArrowForwardRoundedIcon />
                }
                fullWidth
                sx={{
                  minHeight: 52,
                  width: {
                    xs: '100%',
                    sm: 'auto',
                  },
                }}
              >
                Cek Coverage
              </LinkButton>

              <LinkButton
                href="/cabang"
                variant="outlined"
                size="large"
                fullWidth
                sx={{
                  minHeight: 52,
                  width: {
                    xs: '100%',
                    sm: 'auto',
                  },
                  borderColor:
                    'rgba(255,255,255,0.16)',
                }}
              >
                Lihat Cabang
              </LinkButton>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}