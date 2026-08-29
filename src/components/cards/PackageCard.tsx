'use client';
import Link from 'next/link';

import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import type { InternetPackage } from '@/data/packages';

interface PackageCardProps {
  packageData: InternetPackage;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID').format(price);
}

export default function PackageCard({
  packageData,
}: PackageCardProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        p: 3.5,
        borderRadius: 4,
        border: packageData.popular
          ? '1px solid rgba(34,197,94,0.55)'
          : '1px solid rgba(255,255,255,0.07)',
        background: packageData.popular
          ? 'linear-gradient(145deg, rgba(34,197,94,0.09), rgba(255,255,255,0.02))'
          : 'rgba(255,255,255,0.02)',
        height: '100%',
        transition: '0.3s ease',

        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: 'primary.main',
        },
      }}
    >
      {packageData.popular && (
        <Chip
          label="PALING POPULER"
          color="primary"
          size="small"
          sx={{
            position: 'absolute',
            top: 18,
            right: 18,
            fontWeight: 800,
            fontSize: '0.65rem',
          }}
        />
      )}

      <Typography
        color="text.secondary"
        sx={{
          fontWeight: 700,
          fontSize: '0.9rem',
        }}
      >
        {packageData.name}
      </Typography>

      <Typography
        sx={{
          fontSize: '3rem',
          fontWeight: 900,
          lineHeight: 1,
          mt: 2,
        }}
      >
        {packageData.speed}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 1,
          minHeight: 55,
          lineHeight: 1.6,
        }}
      >
        {packageData.description}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography
        color="text.secondary"
        sx={{
          fontSize: '0.85rem',
        }}
      >
        Mulai dari
      </Typography>

      <Box sx={{ mt: 0.5 }}>
        <Typography
          component="span"
          sx={{
            fontSize: '1.7rem',
            fontWeight: 900,
          }}
        >
          Rp {formatPrice(packageData.price)}
        </Typography>
        <Typography
          component="span"
          color="text.secondary"
          sx={{
            fontSize: '0.85rem',
            fontWeight: 400,
            ml: 0.5,
          }}
        >
          /bulan
        </Typography>
      </Box>

      <List sx={{ mt: 2 }}>
        {packageData.features.map((feature) => (
          <ListItem
            key={feature}
            disableGutters
            sx={{ py: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              <CheckCircleRoundedIcon
                sx={{
                  fontSize: 18,
                  color: 'primary.main',
                }}
              />
            </ListItemIcon>

            <ListItemText
              primary={feature}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: '0.9rem',
                    color: 'text.secondary',
                  },
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      <Button
        component={Link}
        href="/paket"
        fullWidth
        variant={packageData.popular ? 'contained' : 'outlined'}
        endIcon={<ArrowForwardRoundedIcon />}
        sx={{ mt: 2 }}
      >
        Lihat Detail
      </Button>
    </Box>
  );
}