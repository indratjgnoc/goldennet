import {
  Box,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import PackageCard from '@/components/cards/PackageCard';
import LinkButton from '@/components/ui/LinkButton';

import { internetPackages } from '@/data/packages';

export default function PackagesSection() {
  return (
    <Box
      component="section"
      sx={{
        py: {
          xs: 8,
          sm: 10,
          md: 14,
        },
      }}
    >
      <Container maxWidth="xl">
        {/* HEADER */}
        <Stack
          component="div"
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={{
            xs: 3,
            md: 4,
          }}
          sx={{
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              md: 'flex-end',
            },
            mb: {
              xs: 5,
              md: 7,
            },
          }}
        >
          <Box
            sx={{
              maxWidth: 700,
            }}
          >
            <Typography
              component="span"
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
              PILIHAN PAKET
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
              Internet sesuai
              <br />

              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                }}
              >
                kebutuhan Anda.
              </Box>
            </Typography>
          </Box>

          <LinkButton
            href="/paket"
            variant="outlined"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              width: {
                xs: '100%',
                sm: 'auto',
              },
              minHeight: 48,
              flexShrink: 0,
            }}
          >
            Lihat Semua Paket
          </LinkButton>
        </Stack>

        {/* PACKAGE GRID */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },
          }}
        >
          {internetPackages
            .slice(0, 3)
            .map((item) => (
              <Box
                key={item.id}
                sx={{
                  minWidth: 0,
                  width: '100%',
                }}
              >
                <PackageCard
                  packageData={item}
                />
              </Box>
            ))}
        </Box>
      </Container>
    </Box>
  );
}