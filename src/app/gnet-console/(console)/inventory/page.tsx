'use client';

import {
  AddBoxOutlined,
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  AssessmentOutlined,
  BuildOutlined,
  CategoryOutlined,
  EngineeringOutlined,
  Inventory2Outlined,
  LocalShippingOutlined,
  RefreshOutlined,
  RemoveCircleOutlined,
  WarningAmberOutlined,
  WarehouseOutlined,
} from '@mui/icons-material';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from '@mui/material';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type InventoryStats = {
  totalItems: number;
  activeItems: number;
  totalCategories: number;
  activeCategories: number;
  totalSuppliers: number;
  activeSuppliers: number;
  totalStockIns: number;
  totalStockOuts: number;
  totalInstallations: number;
  lowStockItems: number;
  outOfStockItems: number;
};

type RecentTransaction = {
  id: number;
  transactionCode: string;
  transactionDate: string;
  itemCount: number;
};

type RecentStockIn = RecentTransaction & {
  supplier: {
    id: number;
    name: string;
    code: string;
  };
  receivedBy: {
    id: number;
    name: string;
  };
};

type RecentStockOut = RecentTransaction & {
  purpose: string | null;
  issuedBy: {
    id: number;
    name: string;
  };
  technician: {
    id: number;
    name: string;
  } | null;
};

type RecentInstallation = {
  id: number;
  installationCode: string;
  installationDate: string;
  customer: {
    id: number;
    name: string;
  };
  technician: {
    id: number;
    name: string;
  };
  itemCount: number;
};

type RecentData = {
  stockIns: RecentStockIn[];
  stockOuts: RecentStockOut[];
  installations: RecentInstallation[];
};

type SummaryResponse = {
  success: boolean;
  message?: string;
  data?: {
    stats: InventoryStats;
    recent: RecentData;
  };
};

const formatDate = (date: string) => {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  } catch {
    return '-';
  }
};

export default function InventoryPage() {
  const router = useRouter();

  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [recent, setRecent] = useState<RecentData | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async () => {
    try {
      setError('');

      const response = await fetch('/api/inventory/summary', {
        method: 'GET',
        cache: 'no-store',
      });

      const result: SummaryResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message || 'Gagal mengambil ringkasan inventory.',
        );
      }

      setStats(result.data.stats);
      setRecent(result.data.recent);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mengambil data inventory.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSummary();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSummary]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSummary();
  };

  const statCards = [
    {
      title: 'Total Barang',
      value: stats?.totalItems ?? 0,
      subtitle: `${stats?.activeItems ?? 0} barang aktif`,
      icon: <Inventory2Outlined />,
      href: '/gnet-console/inventory/items',
    },
    {
      title: 'Stok Menipis',
      value: stats?.lowStockItems ?? 0,
      subtitle: `${stats?.outOfStockItems ?? 0} barang habis`,
      icon: <WarningAmberOutlined />,
      href: '/gnet-console/inventory/stock',
      warning: true,
    },
    {
      title: 'Barang Masuk',
      value: stats?.totalStockIns ?? 0,
      subtitle: 'Total transaksi',
      icon: <ArrowDownward />,
      href: '/gnet-console/inventory/stock-in',
    },
    {
      title: 'Barang Keluar',
      value: stats?.totalStockOuts ?? 0,
      subtitle: 'Total transaksi',
      icon: <ArrowUpward />,
      href: '/gnet-console/inventory/stock-out',
    },
    {
      title: 'Pemasangan',
      value: stats?.totalInstallations ?? 0,
      subtitle: 'Total pemasangan',
      icon: <BuildOutlined />,
      href: '/gnet-console/inventory/installations',
    },
    {
      title: 'Supplier',
      value: stats?.totalSuppliers ?? 0,
      subtitle: `${stats?.activeSuppliers ?? 0} supplier aktif`,
      icon: <LocalShippingOutlined />,
      href: '/gnet-console/inventory/suppliers',
    },
  ];

  const modules = [
    {
      title: 'Barang',
      description: 'Kelola data perangkat dan material inventory.',
      icon: <Inventory2Outlined />,
      href: '/gnet-console/inventory/items',
    },
    {
      title: 'Kategori',
      description: 'Kelompokkan perangkat dan material.',
      icon: <CategoryOutlined />,
      href: '/gnet-console/inventory/categories',
    },
    {
      title: 'Supplier',
      description: 'Kelola data pemasok barang.',
      icon: <LocalShippingOutlined />,
      href: '/gnet-console/inventory/suppliers',
    },
    {
      title: 'Barang Masuk',
      description: 'Catat penerimaan barang dari supplier.',
      icon: <AddBoxOutlined />,
      href: '/gnet-console/inventory/stock-in',
    },
    {
      title: 'Barang Keluar',
      description: 'Catat pengeluaran barang untuk teknisi.',
      icon: <RemoveCircleOutlined />,
      href: '/gnet-console/inventory/stock-out',
    },
    {
      title: 'Stok',
      description: 'Pantau kondisi stok secara keseluruhan.',
      icon: <WarehouseOutlined />,
      href: '/gnet-console/inventory/stock',
    },
    {
      title: 'Pemasangan',
      description: 'Catat penggunaan material untuk pelanggan.',
      icon: <BuildOutlined />,
      href: '/gnet-console/inventory/installations',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top right, rgba(0,230,118,0.08), transparent 30%), #020617',
        color: '#fff',
        py: { xs: 3, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        {/* HEADER */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 4,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 26, md: 32 },
                fontWeight: 800,
                letterSpacing: '-0.03em',
              }}
            >
              Inventory
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,.48)',
                mt: 0.5,
                fontSize: 14,
              }}
            >
              Manajemen perangkat, material, stok dan pemasangan Fiandra Net.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={
              refreshing ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <RefreshOutlined />
              )
            }
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              borderColor: 'rgba(0,230,118,.35)',
              color: '#00e676',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              px: 2,
              '&:hover': {
                borderColor: '#00e676',
                background: 'rgba(0,230,118,.06)',
              },
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* ERROR */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              background: 'rgba(211,47,47,.10)',
              color: '#fff',
              border: '1px solid rgba(211,47,47,.25)',
              '& .MuiAlert-icon': {
                color: '#ff5252',
              },
            }}
          >
            {error}
          </Alert>
        )}

        {/* LOADING */}
        {loading ? (
          <Box
            sx={{
              minHeight: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress sx={{ color: '#00e676' }} />
          </Box>
        ) : (
          <>
            {/* STAT CARDS */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 2,
                mb: 4,
              }}
            >
              {statCards.map((card) => (
                <Card
                  key={card.title}
                  onClick={() => router.push(card.href)}
                  sx={{
                    cursor: 'pointer',
                    background:
                      'linear-gradient(145deg, rgba(15,23,42,.92), rgba(2,6,23,.96))',
                    border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 3,
                    transition: 'all .2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: card.warning
                        ? 'rgba(255,193,7,.35)'
                        : 'rgba(0,230,118,.35)',
                      boxShadow: card.warning
                        ? '0 12px 35px rgba(255,193,7,.08)'
                        : '0 12px 35px rgba(0,230,118,.08)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            color: 'rgba(255,255,255,.45)',
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '.08em',
                          }}
                        >
                          {card.title}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 30,
                            fontWeight: 800,
                            mt: 1,
                            lineHeight: 1,
                          }}
                        >
                          {card.value}
                        </Typography>

                        <Typography
                          sx={{
                            color: 'rgba(255,255,255,.38)',
                            fontSize: 12,
                            mt: 1,
                          }}
                        >
                          {card.subtitle}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: card.warning
                            ? 'rgba(255,193,7,.10)'
                            : 'rgba(0,230,118,.08)',
                          color: card.warning ? '#ffc107' : '#00e676',
                        }}
                      >
                        {card.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* STOCK ALERT */}
            <Card
              sx={{
                mb: 4,
                background:
                  'linear-gradient(145deg, rgba(15,23,42,.92), rgba(2,6,23,.96))',
                border: '1px solid rgba(255,193,7,.12)',
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    flexDirection: { xs: 'column', md: 'row' },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,193,7,.10)',
                        color: '#ffc107',
                      }}
                    >
                      <WarningAmberOutlined />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 750,
                          fontSize: 15,
                        }}
                      >
                        Perhatian Stok
                      </Typography>

                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,.42)',
                          fontSize: 12,
                          mt: 0.3,
                        }}
                      >
                        Terdapat {stats?.lowStockItems ?? 0} barang dengan stok
                        menipis dan {stats?.outOfStockItems ?? 0} barang habis.
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    endIcon={<ArrowForward />}
                    onClick={() =>
                      router.push('/gnet-console/inventory/stock')
                    }
                    sx={{
                      color: '#ffc107',
                      textTransform: 'none',
                      fontWeight: 700,
                    }}
                  >
                    Lihat Stok
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* RECENT ACTIVITY */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontSize: 20,
                    fontWeight: 800,
                  }}
                >
                  Aktivitas Terbaru
                </Typography>

                <Typography
                  sx={{
                    color: 'rgba(255,255,255,.38)',
                    fontSize: 13,
                    mt: 0.5,
                  }}
                >
                  Ringkasan transaksi inventory dan pemasangan terbaru.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    lg: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {/* RECENT STOCK IN */}
                <Card
                  sx={{
                    background:
                      'linear-gradient(145deg, rgba(15,23,42,.92), rgba(2,6,23,.96))',
                    border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <ArrowDownward
                          sx={{
                            color: '#00e676',
                            fontSize: 20,
                          }}
                        />

                        <Typography
                          sx={{
                            fontWeight: 750,
                            fontSize: 14,
                          }}
                        >
                          Barang Masuk
                        </Typography>
                      </Box>

                      <Chip
                        label={recent?.stockIns.length ?? 0}
                        size="small"
                        sx={{
                          height: 23,
                          background: 'rgba(0,230,118,.08)',
                          color: '#00e676',
                          fontSize: 11,
                        }}
                      />
                    </Box>

                    {recent?.stockIns.length ? (
                      <Box>
                        {recent.stockIns.slice(0, 3).map((transaction, index) => (
                          <Box key={transaction.id}>
                            {index > 0 && (
                              <Divider
                                sx={{
                                  borderColor: 'rgba(255,255,255,.06)',
                                  my: 1.5,
                                }}
                              />
                            )}

                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: '#fff',
                                }}
                              >
                                {transaction.transactionCode}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 11,
                                  color: 'rgba(255,255,255,.42)',
                                  mt: 0.4,
                                }}
                              >
                                {transaction.supplier.name}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 10,
                                  color: 'rgba(255,255,255,.28)',
                                  mt: 0.5,
                                }}
                              >
                                {transaction.itemCount} item •{' '}
                                {formatDate(transaction.transactionDate)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,.3)',
                          fontSize: 12,
                          py: 2,
                        }}
                      >
                        Belum ada transaksi barang masuk.
                      </Typography>
                    )}

                    <Button
                      endIcon={<ArrowForward />}
                      onClick={() =>
                        router.push('/gnet-console/inventory/stock-in')
                      }
                      sx={{
                        mt: 1.5,
                        p: 0,
                        color: '#00e676',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Lihat semua
                    </Button>
                  </CardContent>
                </Card>

                {/* RECENT STOCK OUT */}
                <Card
                  sx={{
                    background:
                      'linear-gradient(145deg, rgba(15,23,42,.92), rgba(2,6,23,.96))',
                    border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <ArrowUpward
                          sx={{
                            color: '#ff9800',
                            fontSize: 20,
                          }}
                        />

                        <Typography
                          sx={{
                            fontWeight: 750,
                            fontSize: 14,
                          }}
                        >
                          Barang Keluar
                        </Typography>
                      </Box>

                      <Chip
                        label={recent?.stockOuts.length ?? 0}
                        size="small"
                        sx={{
                          height: 23,
                          background: 'rgba(255,152,0,.08)',
                          color: '#ff9800',
                          fontSize: 11,
                        }}
                      />
                    </Box>

                    {recent?.stockOuts.length ? (
                      <Box>
                        {recent.stockOuts
                          .slice(0, 3)
                          .map((transaction, index) => (
                            <Box key={transaction.id}>
                              {index > 0 && (
                                <Divider
                                  sx={{
                                    borderColor: 'rgba(255,255,255,.06)',
                                    my: 1.5,
                                  }}
                                />
                              )}

                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  {transaction.transactionCode}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: 'rgba(255,255,255,.42)',
                                    mt: 0.4,
                                  }}
                                >
                                  {transaction.technician?.name ||
                                    'Tanpa teknisi'}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: 10,
                                    color: 'rgba(255,255,255,.28)',
                                    mt: 0.5,
                                  }}
                                >
                                  {transaction.itemCount} item •{' '}
                                  {formatDate(transaction.transactionDate)}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,.3)',
                          fontSize: 12,
                          py: 2,
                        }}
                      >
                        Belum ada transaksi barang keluar.
                      </Typography>
                    )}

                    <Button
                      endIcon={<ArrowForward />}
                      onClick={() =>
                        router.push('/gnet-console/inventory/stock-out')
                      }
                      sx={{
                        mt: 1.5,
                        p: 0,
                        color: '#ff9800',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Lihat semua
                    </Button>
                  </CardContent>
                </Card>

                {/* RECENT INSTALLATIONS */}
                <Card
                  sx={{
                    background:
                      'linear-gradient(145deg, rgba(15,23,42,.92), rgba(2,6,23,.96))',
                    border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <EngineeringOutlined
                          sx={{
                            color: '#7c4dff',
                            fontSize: 20,
                          }}
                        />

                        <Typography
                          sx={{
                            fontWeight: 750,
                            fontSize: 14,
                          }}
                        >
                          Pemasangan
                        </Typography>
                      </Box>

                      <Chip
                        label={recent?.installations.length ?? 0}
                        size="small"
                        sx={{
                          height: 23,
                          background: 'rgba(124,77,255,.10)',
                          color: '#b388ff',
                          fontSize: 11,
                        }}
                      />
                    </Box>

                    {recent?.installations.length ? (
                      <Box>
                        {recent.installations
                          .slice(0, 3)
                          .map((installation, index) => (
                            <Box key={installation.id}>
                              {index > 0 && (
                                <Divider
                                  sx={{
                                    borderColor: 'rgba(255,255,255,.06)',
                                    my: 1.5,
                                  }}
                                />
                              )}

                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  {installation.installationCode}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: 11,
                                    color: 'rgba(255,255,255,.42)',
                                    mt: 0.4,
                                  }}
                                >
                                  {installation.customer.name}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: 10,
                                    color: 'rgba(255,255,255,.28)',
                                    mt: 0.5,
                                  }}
                                >
                                  {installation.technician.name} •{' '}
                                  {formatDate(installation.installationDate)}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                      </Box>
                    ) : (
                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,.3)',
                          fontSize: 12,
                          py: 2,
                        }}
                      >
                        Belum ada data pemasangan.
                      </Typography>
                    )}

                    <Button
                      endIcon={<ArrowForward />}
                      onClick={() =>
                        router.push('/gnet-console/inventory/installations')
                      }
                      sx={{
                        mt: 1.5,
                        p: 0,
                        color: '#b388ff',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Lihat semua
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* MODULES */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 800,
                  mb: 2,
                }}
              >
                Modul Inventory
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {modules.map((module) => (
                  <Card
                    key={module.title}
                    onClick={() => router.push(module.href)}
                    sx={{
                      cursor: 'pointer',
                      background:
                        'linear-gradient(145deg, rgba(15,23,42,.92), rgba(2,6,23,.96))',
                      border: '1px solid rgba(255,255,255,.07)',
                      borderRadius: 3,
                      transition: 'all .2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        borderColor: 'rgba(0,230,118,.30)',
                        boxShadow: '0 12px 35px rgba(0,230,118,.06)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#00e676',
                          background: 'rgba(0,230,118,.08)',
                          mb: 2,
                        }}
                      >
                        {module.icon}
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 15,
                          fontWeight: 750,
                        }}
                      >
                        {module.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,.38)',
                          fontSize: 11.5,
                          lineHeight: 1.6,
                          mt: 0.7,
                          minHeight: 38,
                        }}
                      >
                        {module.description}
                      </Typography>

                      <Button
                        endIcon={<ArrowForward />}
                        sx={{
                          mt: 1.5,
                          p: 0,
                          color: '#00e676',
                          textTransform: 'none',
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      >
                        Buka modul
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>

            {/* SYSTEM OVERVIEW */}
            <Card
              sx={{
                background:
                  'linear-gradient(145deg, rgba(15,23,42,.92), rgba(2,6,23,.96))',
                border: '1px solid rgba(255,255,255,.07)',
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                    flexDirection: { xs: 'column', md: 'row' },
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <AssessmentOutlined
                        sx={{
                          color: '#00e676',
                          fontSize: 20,
                        }}
                      />

                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: 15,
                        }}
                      >
                        System Overview
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,.38)',
                        fontSize: 11.5,
                        mt: 0.7,
                      }}
                    >
                      Status modul inventory saat ini.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Chip
                      label={`${stats?.activeItems ?? 0} Barang Aktif`}
                      size="small"
                      sx={{
                        background: 'rgba(0,230,118,.08)',
                        color: '#00e676',
                        fontSize: 11,
                      }}
                    />

                    <Chip
                      label={`${stats?.activeCategories ?? 0} Kategori Aktif`}
                      size="small"
                      sx={{
                        background: 'rgba(33,150,243,.08)',
                        color: '#64b5f6',
                        fontSize: 11,
                      }}
                    />

                    <Chip
                      label={`${stats?.activeSuppliers ?? 0} Supplier Aktif`}
                      size="small"
                      sx={{
                        background: 'rgba(124,77,255,.08)',
                        color: '#b388ff',
                        fontSize: 11,
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
}