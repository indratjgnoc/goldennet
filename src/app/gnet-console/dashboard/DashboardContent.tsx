'use client';

import {
  People,
  PersonAdd,
  Wifi,
  Inventory2,
  Business,
  PendingActions,
  TrendingUp,
  CheckCircle,
  Menu,
  NotificationsNone,
  LogoutRounded,
} from '@mui/icons-material';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';

import { useRouter } from 'next/navigation';

type User = {
  id: number;
  name: string;
  username: string;
  role: string;
};

type Statistics = {
  totalUsers: number;
  activeUsers: number;
  totalCustomers: number;
  activeCustomers: number;
  pendingRegistrations: number;
  activeSubscriptions: number;
  totalPackages: number;
  totalBranches: number;
};

type Props = {
  user: User;
  statistics: Statistics;
};

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        background:
          'linear-gradient(145deg, rgba(15,23,42,.95), rgba(2,6,23,.98))',
        border: '1px solid rgba(148,163,184,.12)',
        borderRadius: 3,
        boxShadow: '0 15px 45px rgba(0,0,0,.25)',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,230,118,.10)',
              color: '#00e676',
            }}
          >
            {icon}
          </Box>

          <Chip
            icon={<TrendingUp sx={{ fontSize: 15 }} />}
            label="Live"
            size="small"
            sx={{
              color: '#00e676',
              background: 'rgba(0,230,118,.08)',
              border: '1px solid rgba(0,230,118,.15)',
              '& .MuiChip-icon': {
                color: '#00e676',
              },
            }}
          />
        </Box>

        <Typography
          sx={{
            color: '#94a3b8',
            fontSize: 13,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: '#f8fafc',
            fontSize: 30,
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          {value.toLocaleString('id-ID')}
        </Typography>

        <Typography
          sx={{
            color: '#64748b',
            fontSize: 12,
            mt: 1,
          }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardContent({
  user,
  statistics,
}: Props) {
  const router = useRouter();

  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        router.push('/gnet-console/login');
      } else {
        alert(result.message || 'Logout gagal.');
      }
    } catch (error) {
      console.error('LOGOUT ERROR:', error);

      alert('Terjadi kesalahan saat logout.');
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top right, rgba(0,230,118,.07), transparent 30%), #020617',
        color: '#f8fafc',
        p: {
          xs: 2,
          md: 3,
          lg: 4,
        },
      }}
    >
      {/* TOP BAR */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: {
                xs: 24,
                md: 30,
              },
              fontWeight: 800,
              letterSpacing: -0.8,
            }}
          >
            Dashboard
          </Typography>

          <Typography
            sx={{
              color: '#64748b',
              mt: 0.5,
              fontSize: 14,
            }}
          >
            Monitoring & management Golden Net
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* NOTIFICATION */}
          <IconButton
            sx={{
              color: '#94a3b8',
              border: '1px solid rgba(148,163,184,.12)',
              borderRadius: 2,
            }}
          >
            <NotificationsNone />
          </IconButton>

          {/* USER */}
          <Box
            sx={{
              display: {
                xs: 'none',
                sm: 'block',
              },
              textAlign: 'right',
              ml: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {user.name}
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                color: '#00e676',
              }}
            >
              {user.role}
            </Typography>
          </Box>

          {/* LOGOUT */}
          <Button
            variant="outlined"
            startIcon={<LogoutRounded />}
            onClick={handleLogout}
            sx={{
              ml: 1,
              minWidth: {
                xs: 44,
                sm: 100,
              },
              height: 42,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              borderColor: 'rgba(148,163,184,.15)',
              color: '#94a3b8',
              transition: 'all .2s ease',

              '&:hover': {
                borderColor: 'rgba(244,67,54,.6)',
                color: '#ff5252',
                background: 'rgba(244,67,54,.08)',
              },

              '& .MuiButton-startIcon': {
                mr: {
                  xs: 0,
                  sm: 1,
                },
              },
            }}
          >
            <Box
              component="span"
              sx={{
                display: {
                  xs: 'none',
                  sm: 'inline',
                },
              }}
            >
              Logout
            </Box>
          </Button>
        </Box>
      </Box>

      {/* WELCOME */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, rgba(0,230,118,.13), rgba(15,23,42,.95) 55%)',
          border: '1px solid rgba(0,230,118,.15)',
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,
              md: 3.5,
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: {
                xs: 'flex-start',
                md: 'center',
              },
              flexDirection: {
                xs: 'column',
                md: 'row',
              },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  color: '#00e676',
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                GOLDEN NET CONTROL CENTER
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: 21,
                    md: 25,
                  },
                  fontWeight: 800,
                }}
              >
                Selamat datang, {user.name} 👋
              </Typography>

              <Typography
                sx={{
                  color: '#94a3b8',
                  fontSize: 13,
                  mt: 1,
                  maxWidth: 700,
                }}
              >
                Pantau kondisi operasional ISP dan kelola seluruh
                data Golden Net dari satu tempat.
              </Typography>
            </Box>

            <Chip
              icon={<CheckCircle />}
              label="System Online"
              sx={{
                color: '#00e676',
                background: 'rgba(0,230,118,.08)',
                border: '1px solid rgba(0,230,118,.18)',
                '& .MuiChip-icon': {
                  color: '#00e676',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* STATISTICS */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="Total User"
          value={statistics.totalUsers}
          subtitle={`${statistics.activeUsers} user aktif`}
          icon={<People />}
        />

        <StatCard
          title="Total Customer"
          value={statistics.totalCustomers}
          subtitle={`${statistics.activeCustomers} customer aktif`}
          icon={<PersonAdd />}
        />

        <StatCard
          title="Subscription Aktif"
          value={statistics.activeSubscriptions}
          subtitle="Pelanggan berlangganan"
          icon={<Wifi />}
        />

        <StatCard
          title="Registrasi Pending"
          value={statistics.pendingRegistrations}
          subtitle="Menunggu proses"
          icon={<PendingActions />}
        />
      </Box>

      {/* SECONDARY INFORMATION */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {/* PAKET */}
        <Card
          elevation={0}
          sx={{
            background: 'rgba(15,23,42,.75)',
            border: '1px solid rgba(148,163,184,.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Inventory2
              sx={{
                color: '#00e676',
                mb: 1,
              }}
            />

            <Typography
              sx={{
                color: '#94a3b8',
                fontSize: 13,
              }}
            >
              Paket Internet Aktif
            </Typography>

            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 800,
                mt: 0.5,
              }}
            >
              {statistics.totalPackages.toLocaleString('id-ID')}
            </Typography>
          </CardContent>
        </Card>

        {/* BRANCH */}
        <Card
          elevation={0}
          sx={{
            background: 'rgba(15,23,42,.75)',
            border: '1px solid rgba(148,163,184,.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Business
              sx={{
                color: '#00e676',
                mb: 1,
              }}
            />

            <Typography
              sx={{
                color: '#94a3b8',
                fontSize: 13,
              }}
            >
              Branch Aktif
            </Typography>

            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 800,
                mt: 0.5,
              }}
            >
              {statistics.totalBranches.toLocaleString('id-ID')}
            </Typography>
          </CardContent>
        </Card>

        {/* SYSTEM */}
        <Card
          elevation={0}
          sx={{
            background: 'rgba(15,23,42,.75)',
            border: '1px solid rgba(148,163,184,.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Menu
              sx={{
                color: '#00e676',
                mb: 1,
              }}
            />

            <Typography
              sx={{
                color: '#94a3b8',
                fontSize: 13,
              }}
            >
              Status Sistem
            </Typography>

            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                mt: 1,
                color: '#00e676',
              }}
            >
              Operational
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* RECENT ACTIVITY */}
      <Card
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 3,
          background: 'rgba(15,23,42,.75)',
          border: '1px solid rgba(148,163,184,.1)',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography
            sx={{
              fontSize: 17,
              fontWeight: 800,
              mb: 0.5,
            }}
          >
            Aktivitas Terbaru
          </Typography>

          <Typography
            sx={{
              color: '#64748b',
              fontSize: 13,
            }}
          >
            Data aktivitas pelanggan dan operasional akan tampil
            di bagian ini.
          </Typography>
        </CardContent>
      </Card>

      {/* FOOTER */}
      <Divider
        sx={{
          borderColor: 'rgba(148,163,184,.08)',
          my: 4,
        }}
      />

      <Typography
        sx={{
          color: '#475569',
          fontSize: 11,
          textAlign: 'center',
        }}
      >
        Golden Net ISP Management System
      </Typography>
    </Box>
  );
}