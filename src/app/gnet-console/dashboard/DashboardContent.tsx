'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import RouterRoundedIcon from '@mui/icons-material/RouterRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useRouter } from 'next/navigation';

type DashboardUser = {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: string;
  status: string;
  lastLoginAt: Date | null;
};

const statistics = [
  {
    title: 'Total Pelanggan',
    value: '0',
    description: 'Pelanggan terdaftar',
    icon: <PeopleAltRoundedIcon />,
  },
  {
    title: 'Pendaftaran Baru',
    value: '0',
    description: 'Menunggu diproses',
    icon: <PendingActionsRoundedIcon />,
  },
  {
    title: 'Paket Internet',
    value: '0',
    description: 'Paket aktif',
    icon: <WifiRoundedIcon />,
  },
  {
    title: 'Area Coverage',
    value: '0',
    description: 'Area aktif',
    icon: <RouterRoundedIcon />,
  },
];

export default function DashboardContent({
  user,
}: {
  user: DashboardUser;
}) {
  const router = useRouter();

  async function handleLogout() {
    try {
      const response = await fetch(
        '/api/auth/logout',
        {
          method: 'POST',
        },
      );

      const result = await response.json();

      if (result.success) {
        router.push('/gnet-console/login');
      } else {
        alert(
          result.message ||
            'Logout gagal.',
        );
      }
    } catch (error) {
      console.error(
        'LOGOUT ERROR:',
        error,
      );

      alert(
        'Terjadi kesalahan saat logout.',
      );
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={4}>

          {/* HEADER */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column',
                md: 'row',
              },
              justifyContent: 'space-between',
              alignItems: {
                xs: 'stretch',
                md: 'flex-start',
              },
              gap: 3,
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 900,
                  letterSpacing: 2,
                }}
              >
                GOLDEN NET
              </Typography>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  fontSize: {
                    xs: '2rem',
                    md: '3rem',
                  },
                }}
              >
                Operations Console
              </Typography>

              <Typography color="text.secondary">
                Monitoring dan pengelolaan
                operasional jaringan Golden Net.
              </Typography>

              {/* USER SESSION */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 1,
                }}
              >
                Login sebagai{' '}
                <strong>{user.name}</strong>{' '}
                ({user.role})
              </Typography>
            </Stack>

            {/* LOGOUT BUTTON */}
            <Button
              variant="outlined"
              startIcon={<LogoutRoundedIcon />}
              onClick={handleLogout}
              sx={{
                minWidth: 130,
                height: 44,
                borderRadius: 2.5,
                alignSelf: {
                  xs: 'flex-start',
                  md: 'flex-start',
                },
                fontWeight: 800,
                textTransform: 'none',
                borderColor:
                  'rgba(255,255,255,0.16)',
                color: 'text.secondary',
                transition:
                  'all 0.2s ease',
                '&:hover': {
                  borderColor:
                    'rgba(244,67,54,0.6)',
                  color: '#ff5252',
                  background:
                    'rgba(244,67,54,0.08)',
                  transform:
                    'translateY(-1px)',
                },
              }}
            >
              Logout
            </Button>
          </Box>

          {/* STATISTICS */}
          <Grid
            container
            spacing={2}
          >
            {statistics.map((item) => (
              <Grid
                key={item.title}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 3,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    border:
                      '1px solid rgba(255,255,255,0.08)',
                    background:
                      'rgba(255,255,255,0.025)',
                  }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                    }}
                  >
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 2.5,
                          background:
                            'rgba(46,125,50,0.14)',
                        }}
                      >
                        {item.icon}
                      </Box>

                      <Stack spacing={0.5}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {item.title}
                        </Typography>

                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 900,
                          }}
                        >
                          {item.value}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {item.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* MAIN CONTENT */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border:
                '1px solid rgba(255,255,255,0.08)',
              background:
                'rgba(255,255,255,0.025)',
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 3,
                  md: 4,
                },
              }}
            >
              <Stack spacing={1}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                  }}
                >
                  Aktivitas Terbaru
                </Typography>

                <Typography color="text.secondary">
                  Data aktivitas pelanggan dan
                  operasional akan tampil di
                  bagian ini.
                </Typography>
              </Stack>
            </CardContent>
          </Card>

        </Stack>
      </Container>
    </Box>
  );
}