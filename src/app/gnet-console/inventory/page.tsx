"use client";

import {
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  AssessmentOutlined,
  CategoryOutlined,
  Inventory2Outlined,
  LocalShippingOutlined,
  BuildOutlined,
  WarningAmberOutlined,
  WarehouseOutlined,
  AddBoxOutlined,
  RemoveCircleOutlined,
  EngineeringOutlined,
  RefreshOutlined,
} from "@mui/icons-material";

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
} from "@mui/material";

import {useCallback,useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

type SummaryResponse = {
  success: boolean;
  message?: string;
  data?: {
    stats: InventoryStats;
  };
};

const menuItems = [
  {
    title: "Barang",
    description: "Kelola seluruh perangkat dan material.",
    href: "/gnet-console/inventory/items",
    icon: <Inventory2Outlined />,
  },
  {
    title: "Kategori",
    description: "Atur kategori perangkat dan material.",
    href: "/gnet-console/inventory/categories",
    icon: <CategoryOutlined />,
  },
  {
    title: "Supplier",
    description: "Kelola data pemasok barang.",
    href: "/gnet-console/inventory/suppliers",
    icon: <LocalShippingOutlined />,
  },
  {
    title: "Barang Masuk",
    description: "Catat penerimaan barang dari supplier.",
    href: "/gnet-console/inventory/stock-in",
    icon: <AddBoxOutlined />,
  },
  {
    title: "Barang Keluar",
    description: "Catat pengeluaran barang untuk teknisi.",
    href: "/gnet-console/inventory/stock-out",
    icon: <RemoveCircleOutlined />,
  },
  {
    title: "Stok",
    description: "Monitor kondisi stok gudang.",
    href: "/gnet-console/inventory/stock",
    icon: <WarehouseOutlined />,
  },
  {
    title: "Pemasangan",
    description: "Lihat penggunaan material di lapangan.",
    href: "/gnet-console/inventory/installations",
    icon: <EngineeringOutlined />,
  },
];

export default function InventoryPage() {
  const router = useRouter();

  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/inventory/summary", {
        method: "GET",
        cache: "no-store",
      });

      const result: SummaryResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Gagal mengambil data inventory.");
      }

      setStats(result.data.stats);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Gagal mengambil data inventory.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchInitialSummary = async () => {
      if (cancelled) return;

      await loadSummary();
    };

    fetchInitialSummary();

    return () => {
      cancelled = true;
    };
  }, [loadSummary]);

  const statCards = [
    {
      title: "Total Barang",
      value: stats?.totalItems ?? 0,
      subtitle: `${stats?.activeItems ?? 0} barang aktif`,
      icon: <Inventory2Outlined />,
      href: "/gnet-console/inventory/items",
    },
    {
      title: "Stok Menipis",
      value: stats?.lowStockItems ?? 0,
      subtitle: "Perlu diperiksa",
      icon: <WarningAmberOutlined />,
      href: "/gnet-console/inventory/stock",
      warning: true,
    },
    {
      title: "Barang Masuk",
      value: stats?.totalStockIns ?? 0,
      subtitle: "Total transaksi",
      icon: <ArrowDownward />,
      href: "/gnet-console/inventory/stock-in",
    },
    {
      title: "Barang Keluar",
      value: stats?.totalStockOuts ?? 0,
      subtitle: "Total transaksi",
      icon: <ArrowUpward />,
      href: "/gnet-console/inventory/stock-out",
    },
    {
      title: "Pemasangan",
      value: stats?.totalInstallations ?? 0,
      subtitle: "Aktivitas lapangan",
      icon: <BuildOutlined />,
      href: "/gnet-console/inventory/installations",
    },
    {
      title: "Supplier",
      value: stats?.totalSuppliers ?? 0,
      subtitle: `${stats?.activeSuppliers ?? 0} supplier aktif`,
      icon: <LocalShippingOutlined />,
      href: "/gnet-console/inventory/suppliers",
    },
  ];

 return (
  <Box
    sx={{
      minHeight: "100vh",
      py: {
        xs: 3,
        md: 5,
      },
    }}
  >
    <Container maxWidth="xl">
      {/* HEADER */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          gap: 2,
          flexDirection: {
            xs: "column",
            md: "row",
          },
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, rgba(0,230,118,.20), rgba(0,230,118,.05))",
                border: "1px solid rgba(0,230,118,.25)",
                color: "#00e676",
              }}
            >
              <WarehouseOutlined />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Inventory
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.55)",
              maxWidth: 700,
            }}
          >
            Pusat pengelolaan perangkat WiFi, material instalasi, transaksi
            gudang, supplier, stok, dan pemasangan.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={loadSummary}
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            borderColor: "rgba(0,230,118,0.25)",
            color: "#00e676",
            "&:hover": {
              borderColor: "#00e676",
              background: "rgba(0,230,118,0.06)",
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
            borderRadius: 2,
          }}
          action={
            <Button color="inherit" size="small" onClick={loadSummary}>
              Coba Lagi
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* LOADING */}
      {loading && !stats ? (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* STATISTICS */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
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
                  cursor: "pointer",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "rgba(255,255,255,.08)",
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.015))",
                  transition: "all .25s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: card.warning
                      ? "rgba(255,193,7,.35)"
                      : "rgba(0,230,118,.35)",
                    boxShadow: card.warning
                      ? "0 12px 35px rgba(255,193,7,.08)"
                      : "0 12px 35px rgba(0,230,118,.08)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mb: 1,
                        }}
                      >
                        {card.title}
                      </Typography>

                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          lineHeight: 1,
                          mb: 1,
                        }}
                      >
                        {card.value}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          color: card.warning
                            ? "warning.main"
                            : "text.secondary",
                        }}
                      >
                        {card.subtitle}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: card.warning ? "warning.main" : "#00e676",
                        background: card.warning
                          ? "rgba(255,193,7,.10)"
                          : "rgba(0,230,118,.10)",
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* ALERT STOCK */}
          <Card
            sx={{
              mb: 4,
              borderRadius: 3,
              border: "1px solid rgba(255,193,7,.20)",
              background:
                "linear-gradient(135deg, rgba(255,193,7,.08), rgba(255,193,7,.025))",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                  justifyContent: "space-between",
                  gap: 2,
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "warning.main",
                      background: "rgba(255,193,7,.12)",
                    }}
                  >
                    <WarningAmberOutlined />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      Perhatian Stok
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {stats?.outOfStockItems ?? 0} barang habis dan{" "}
                      {stats?.lowStockItems ?? 0} barang berada pada level
                      minimum.
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => router.push("/gnet-console/inventory/stock")}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Periksa Stok
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* MODULES */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                mb: 0.5,
              }}
            >
              Modul Inventory
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              Akses fitur pengelolaan inventory Golden Net.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {menuItems.map((item) => (
              <Card
                key={item.title}
                onClick={() => router.push(item.href)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,.07)",
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,.04), rgba(255,255,255,.015))",
                  transition: "all .25s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "rgba(0,230,118,.30)",
                    "& .inventory-module-icon": {
                      background: "rgba(0,230,118,.16)",
                      color: "#00e676",
                    },
                    "& .inventory-module-arrow": {
                      transform: "translateX(4px)",
                      color: "#00e676",
                    },
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      className="inventory-module-icon"
                      sx={{
                        width: 48,
                        height: 48,
                        minWidth: 48,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "text.secondary",
                        background: "rgba(255,255,255,.05)",
                        transition: "all .25s ease",
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 800,
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mt: 0.3,
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>

                    <ArrowForward
                      className="inventory-module-arrow"
                      sx={{
                        color: "text.secondary",
                        transition: "all .25s ease",
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* SYSTEM OVERVIEW */}
          <Card
            sx={{
              mt: 4,
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,.07)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,.035), rgba(255,255,255,.01))",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <AssessmentOutlined
                  sx={{
                    color: "#00e676",
                  }}
                />

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Ringkasan Sistem
                </Typography>
              </Box>

              <Divider
                sx={{
                  mb: 2,
                  borderColor: "rgba(255,255,255,.07)",
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Chip
                  icon={<Inventory2Outlined />}
                  label={`${stats?.activeItems ?? 0} Barang Aktif`}
                  variant="outlined"
                />

                <Chip
                  icon={<CategoryOutlined />}
                  label={`${stats?.activeCategories ?? 0} Kategori Aktif`}
                  variant="outlined"
                />

                <Chip
                  icon={<LocalShippingOutlined />}
                  label={`${stats?.activeSuppliers ?? 0} Supplier Aktif`}
                  variant="outlined"
                />

                <Chip
                  icon={<EngineeringOutlined />}
                  label={`${stats?.totalInstallations ?? 0} Pemasangan`}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </>
      )}
      </Container>
    </Box>
  );
}
