'use client';

import {
  Box,
  Chip,
  Typography,
} from '@mui/material';

import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';

import type { Branch } from '@/data/branches';

interface BranchCardProps {
  branch: Branch;
}

export default function BranchCard({
  branch,
}: BranchCardProps) {
  return (
    <Box
      sx={{
        p: 3.5,
        borderRadius: 4,
        border: branch.isHeadOffice
          ? '1px solid rgba(34,197,94,0.4)'
          : '1px solid rgba(255,255,255,0.07)',
        backgroundColor: 'rgba(255,255,255,0.02)',
        transition: '0.3s ease',

        '&:hover': {
          transform: 'translateY(-5px)',
          borderColor: 'primary.main',
        },
      }}
    >
      {branch.isHeadOffice && (
        <Chip
          label="KANTOR PUSAT"
          color="primary"
          size="small"
          sx={{
            mb: 3,
            fontWeight: 800,
            fontSize: '0.65rem',
          }}
        />
      )}

      <Typography
        variant="h5"
        sx={{ fontWeight: 800 }}
      >
        {branch.name}
      </Typography>

      <Typography
        color="primary.main"
        sx={{ mt: 0.5, fontWeight: 700 }}
      >
        {branch.city}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          mt: 3,
        }}
      >
        <LocationOnRoundedIcon
          sx={{
            color: 'primary.main',
            fontSize: 21,
          }}
        />

        <Typography
          color="text.secondary"
          sx={{ lineHeight: 1.7 }}
        >
          {branch.address}
        </Typography>
      </Box>

      {branch.phone !== '-' && (
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            mt: 2,
          }}
        >
          <PhoneRoundedIcon
            sx={{
              color: 'primary.main',
              fontSize: 20,
            }}
          />

          <Typography color="text.secondary">
            {branch.phone}
          </Typography>
        </Box>
      )}
    </Box>
  );
}