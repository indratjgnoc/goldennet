'use client';

import Link from 'next/link';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import type { InternetPackage } from '@/data/packages';

interface PackageCardProps {
  packageData: InternetPackage;
}

export default function PackageCard({
  packageData,
}: PackageCardProps) {
  const formattedPrice = new Intl.NumberFormat(
    'id-ID',
  ).format(packageData.price);

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'visible',
        borderRadius: {
          xs: 3,
          md: 4,
        },
        border: packageData.popular
          ? '1px solid rgba(34,197,94,0.45)'
          : '1px solid rgba(255,255,255,0.08)',
        background: packageData.popular
          ? 'linear-gradient(145deg, rgba(34,197,94,0.09), rgba(255,255,255,0.02))'
          : 'rgba(255,255,255,0.02)',
        transition:
          'transform .25s ease, border-color .25s ease',

        '&:hover': {
          transform: {
            xs: 'none',
            md: 'translateY(-6px)',
          },
          borderColor: 'rgba(34,197,94,0.4)',
        },
      }}
    >
      {packageData.popular && (
        <Chip
          label="PALING POPULER"
          size="small"
          sx={{
            position: 'absolute',
            top: -13,
            left: {
              xs: 20,
              sm: 24,
            },
            color: '#07100A',
            backgroundColor: 'primary.main',
            fontWeight: 900,
            fontSize: '0.62rem',
            letterSpacing: '0.05em',
          }}
        />
      )}

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
        <Typography
          color="text.secondary"
          sx={{
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          {packageData.name}
        </Typography>

        <Stack
          direction="row"
          spacing={0.7}
          sx={{
            mt: 1.5,
            alignItems: 'baseline',
          }}
        >
          <Typography
            component="span"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.05em',
              fontSize: {
                xs: '3rem',
                sm: '3.3rem',
              },
              lineHeight: 1,
            }}
          >
            {packageData.speed}
          </Typography>

          <Typography
            component="span"
            color="primary.main"
            sx={{
              fontWeight: 800,
            }}
          >
            Mbps
          </Typography>
        </Stack>

        <Typography
          component="div"
          sx={{
            mt: 2,
            fontSize: {
              xs: '1.15rem',
              sm: '1.2rem',
            },
            fontWeight: 800,
          }}
        >
          Rp {formattedPrice}
          <Typography
            component="span"
            color="text.secondary"
            sx={{
              ml: 0.5,
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            /bulan
          </Typography>
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 1.5,
            minHeight: {
              xs: 'auto',
              sm: 70,
            },
            fontSize: '0.84rem',
            lineHeight: 1.7,
          }}
        >
          {packageData.description}
        </Typography>

        <Divider
          sx={{
            my: 3,
            borderColor:
              'rgba(255,255,255,0.07)',
          }}
        />

        <Stack spacing={1.4}>
          {packageData.features.map((feature) => (
            <Box
              key={feature}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              <CheckCircleRoundedIcon
                sx={{
                  color: 'primary.main',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              />

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: '0.8rem',
                }}
              >
                {feature}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Button
          component={Link}
          href={`/daftar?paket=${packageData.id}`}
          fullWidth
          variant={
            packageData.popular
              ? 'contained'
              : 'outlined'
          }
          endIcon={
            <ArrowForwardRoundedIcon />
          }
          sx={{
            mt: 4,
            minHeight: 48,
            fontWeight: 800,
            borderRadius: 2.5,
          }}
        >
          Pilih Paket
        </Button>
      </CardContent>
    </Card>
  );
}