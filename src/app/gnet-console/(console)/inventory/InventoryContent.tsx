"use client";

import {
  AddBoxOutlined,
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  AssessmentOutlined,
  CategoryOutlined,
  EngineeringOutlined,
  Inventory2Outlined,
  LocalShippingOutlined,
  RefreshOutlined,
  RemoveCircleOutlined,
  WarningAmberOutlined,
  WarehouseOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

type CurrentUser = {
  id: number;
  name: string;
  username: string;
  role: string;
};

type Props = {
  user: CurrentUser;
  initialStats: InventoryStats | null;
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

export default function InventoryContent({ user, initialStats }: Props) {
  const router = useRouter();

  const [stats, setStats] = useState<InventoryStats | null>(initialStats);

  const [loading, setLoading] = useState(initialStats === null);

  const [error, setError] = useState("");

  async function loadSummary() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/inventory/summary", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result: SummaryResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Gagal mengambil data inventory.");
      }

      setStats(result.data.stats);
    } catch (err) {
      console.error("LOAD INVENTORY SUMMARY ERROR:", err);

      setError(
        err instanceof Error ? err.message : "Gagal mengambil data inventory.",
      );
    } finally {
      setLoading(false);
    }
  }

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
      icon: <EngineeringOutlined />,
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
        background:
          "radial-gradient(circle at top right, rgba(0,230,118,0.09), transparent 28%), #020617",
        color: "#fff",

        px: {
          xs: 2,
          sm: 3,
          md: 4,
        },

        pt: {
          xs: 3,
          sm: 3,
          md: 4,
        },

        pb: {
          xs: 5,
          md: 6,
        },

        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1600,
          mx: "auto",
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            mb: 4,
            pt: 1,
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
                gap: 1.5,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(0,230,118,0.20), rgba(0,230,118,0.04))",
                  border: "1px solid rgba(0,230,118,0.20)",
                  boxShadow: "0 10px 30px rgba(0,230,118,0.08)",
                  color: "#00e676",
                }}
              >
                <WarehouseOutlined />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: 25,
                      md: 30,
                    },
                    fontWeight: 800,
                    letterSpacing: "-0.6px",
                  }}
                >
                  Inventory
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.42)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Warehouse Management
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.52)",
                fontSize: 14,
                maxWidth: 760,
              }}
            >
              Pusat pengelolaan perangkat WiFi, material instalasi, transaksi
              gudang, supplier, stok, dan pemasangan Fiandra Net.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Chip
              label={`${user.username} • ${user.role}`}
              size="small"
              sx={{
                color: "#00e676",
                background: "rgba(0,230,118,0.07)",
                border: "1px solid rgba(0,230,118,0.14)",
                fontWeight: 700,
              }}
            />

            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={loadSummary}
              disabled={loading}
              sx={{
                minHeight: 42,
                borderRadius: 2.5,
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
              {loading ? "Memuat..." : "Refresh"}
            </Button>
          </Box>
        </Box>

        {/* ERROR */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2.5,
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
              minHeight: 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
              }}
            >
              <CircularProgress
                size={34}
                sx={{
                  color: "#00e676",
                  mb: 2,
                }}
              />

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                }}
              >
                Memuat data inventory...
              </Typography>
            </Box>
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
                    background:
                      "linear-gradient(145deg, rgba(15,23,42,0.72), rgba(2,6,23,0.82))",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 12px 35px rgba(0,0,0,0.16)",
                    transition: "all .25s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      borderColor: card.warning
                        ? "rgba(255,193,7,0.35)"
                        : "rgba(0,230,118,0.30)",
                      boxShadow: card.warning
                        ? "0 15px 40px rgba(255,193,7,0.07)"
                        : "0 15px 40px rgba(0,230,118,0.07)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2.5,
                      "&:last-child": {
                        pb: 2.5,
                      },
                    }}
                  >
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
                          sx={{
                            color: "rgba(255,255,255,0.50)",
                            fontSize: 13,
                            mb: 1,
                          }}
                        >
                          {card.title}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: {
                              xs: 30,
                              md: 34,
                            },
                            fontWeight: 800,
                            lineHeight: 1,
                            mb: 1,
                          }}
                        >
                          {card.value}
                        </Typography>

                        <Typography
                          sx={{
                            color: card.warning
                              ? "#fbbf24"
                              : "rgba(255,255,255,0.38)",
                            fontSize: 12,
                          }}
                        >
                          {card.subtitle}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: card.warning ? "#fbbf24" : "#00e676",
                          background: card.warning
                            ? "rgba(255,193,7,0.09)"
                            : "rgba(0,230,118,0.08)",
                          flexShrink: 0,
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
                borderRadius: 3,
                background:
                  "linear-gradient(135deg, rgba(255,193,7,0.07), rgba(255,193,7,0.025))",
                border: "1px solid rgba(255,193,7,0.20)",
                boxShadow: "0 10px 35px rgba(0,0,0,0.12)",
              }}
            >
              <CardContent
                sx={{
                  p: 2.5,
                  "&:last-child": {
                    pb: 2.5,
                  },
                }}
              >
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
                        color: "#fbbf24",
                        background: "rgba(255,193,7,0.10)",
                        flexShrink: 0,
                      }}
                    >
                      <WarningAmberOutlined />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: 15,
                          mb: 0.3,
                        }}
                      >
                        Perhatian Stok
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.45)",
                          fontSize: 13,
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
                      background: "#16c766",
                      color: "#02140a",
                      "&:hover": {
                        background: "#00e676",
                      },
                    }}
                  >
                    Periksa Stok
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* MODULE HEADER */}
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 800,
                  mb: 0.5,
                }}
              >
                Modul Inventory
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.42)",
                  fontSize: 13,
                }}
              >
                Akses seluruh fitur pengelolaan inventory Fiandra Net.
              </Typography>
            </Box>

            {/* MODULES */}
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
                    background:
                      "linear-gradient(145deg, rgba(15,23,42,0.72), rgba(2,6,23,0.82))",
                    border: "1px solid rgba(255,255,255,0.07)",
                    transition: "all .25s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      borderColor: "rgba(0,230,118,0.30)",
                      boxShadow: "0 15px 40px rgba(0,230,118,0.06)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2.5,
                      "&:last-child": {
                        pb: 2.5,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          minWidth: 48,
                          borderRadius: 2.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,0.48)",
                          background: "rgba(255,255,255,0.045)",
                          transition: "all .25s ease",
                        }}
                      >
                        {item.icon}
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: 15,
                            mb: 0.3,
                          }}
                        >
                          {item.title}
                        </Typography>

                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.40)",
                            fontSize: 12,
                            lineHeight: 1.5,
                          }}
                        >
                          {item.description}
                        </Typography>
                      </Box>

                      <ArrowForward
                        sx={{
                          color: "rgba(255,255,255,0.30)",
                          fontSize: 21,
                          flexShrink: 0,
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
                background:
                  "linear-gradient(145deg, rgba(15,23,42,0.62), rgba(2,6,23,0.78))",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <CardContent
                sx={{
                  p: 2.5,
                  "&:last-child": {
                    pb: 2.5,
                  },
                }}
              >
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
                    sx={{
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    Ringkasan Sistem
                  </Typography>
                </Box>

                <Divider
                  sx={{
                    mb: 2,
                    borderColor: "rgba(255,255,255,0.07)",
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
                    sx={{
                      color: "rgba(255,255,255,0.60)",
                      borderColor: "rgba(255,255,255,0.10)",
                      "& .MuiChip-icon": {
                        color: "#00e676",
                      },
                    }}
                  />

                  <Chip
                    icon={<CategoryOutlined />}
                    label={`${stats?.activeCategories ?? 0} Kategori Aktif`}
                    variant="outlined"
                    sx={{
                      color: "rgba(255,255,255,0.60)",
                      borderColor: "rgba(255,255,255,0.10)",
                      "& .MuiChip-icon": {
                        color: "#00e676",
                      },
                    }}
                  />

                  <Chip
                    icon={<LocalShippingOutlined />}
                    label={`${stats?.activeSuppliers ?? 0} Supplier Aktif`}
                    variant="outlined"
                    sx={{
                      color: "rgba(255,255,255,0.60)",
                      borderColor: "rgba(255,255,255,0.10)",
                      "& .MuiChip-icon": {
                        color: "#00e676",
                      },
                    }}
                  />

                  <Chip
                    icon={<EngineeringOutlined />}
                    label={`${stats?.totalInstallations ?? 0} Pemasangan`}
                    variant="outlined"
                    sx={{
                      color: "rgba(255,255,255,0.60)",
                      borderColor: "rgba(255,255,255,0.10)",
                      "& .MuiChip-icon": {
                        color: "#00e676",
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </Box>
  );
}
