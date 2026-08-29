import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';

import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';

import type { Branch } from '@/data/branches';

interface BranchCardProps {
  branch: Branch;
}

export default function BranchCard({
  branch,
}: BranchCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
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
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2.5,
            sm: 3,
          },
          '&:last-child': {
            pb: {
              xs: 2.5,
              sm: 3,
            },
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              flexShrink: 0,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              backgroundColor:
                'rgba(34,197,94,0.1)',
            }}
          >
            <BusinessRoundedIcon />
          </Box>

          <Chip
            label={
              branch.status === 'active'
                ? 'Aktif'
                : 'Segera Hadir'
            }
            size="small"
            sx={{
              color:
                branch.status === 'active'
                  ? 'primary.main'
                  : 'text.secondary',
              backgroundColor:
                branch.status === 'active'
                  ? 'rgba(34,197,94,0.1)'
                  : 'rgba(255,255,255,0.06)',
              fontWeight: 700,
            }}
          />
        </Stack>

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
          {branch.name}
        </Typography>

        {branch.isHeadOffice && (
          <Typography
            color="primary.main"
            sx={{
              mt: 0.7,
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            HEAD OFFICE
          </Typography>
        )}

        <Stack
          spacing={1.5}
          sx={{
            mt: 2.5,
          }}
        >
          <Stack
            direction="row"
            spacing={1.2}
            sx={{
              alignItems: 'flex-start',
            }}
          >
            <LocationOnRoundedIcon
              sx={{
                color: 'primary.main',
                fontSize: 20,
                flexShrink: 0,
              }}
            />

            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {branch.city}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.3,
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                }}
              >
                {branch.address}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1.2}
            sx={{
              alignItems: 'center',
            }}
          >
            <PhoneRoundedIcon
              sx={{
                color: 'primary.main',
                fontSize: 19,
                flexShrink: 0,
              }}
            />

            <Typography
              color="text.secondary"
              sx={{
                fontSize: '0.82rem',
              }}
            >
              {branch.phone}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}