"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  CheckCircleOutlined,
  ErrorOutlined,
  Inventory2Outlined,
  SearchOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

type InventoryItem = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  } | null;
  unit: string;
  stock: string | number;
  minimumStock: string | number;
  purchasePrice: string | number;
  location?: string | null;
  isActive: boolean;
};

type StockStatus = "AMAN" | "MENIPIS" | "HABIS";

function numberFormat(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function getStockStatus(
  stock: string | number,
  minimumStock: string | number,
): StockStatus {
  const current = Number(stock || 0);
  const minimum = Number(minimumStock || 0);

  if (current <= 0) {
    return "HABIS";
  }

  if (current <= minimum) {
    return "MENIPIS";
  }

  return "AMAN";
}

function StatusChip({
  status,
}: {
  status: StockStatus;
}) {
  if (status === "HABIS") {
    return (
      <Chip
        icon={<ErrorOutlined sx={{ fontSize: 16 }} />}
        label="Habis"
        size="small"
        sx={{
          color: "#ff5c7a",
          background: "rgba(255,92,122,.09)",
          border: "1px solid rgba(255,92,122,.18)",
          fontWeight: 700,
        }}
      />
    );
  }

  if (status === "MENIPIS") {
    return (
      <Chip
        icon={<WarningAmberOutlined sx={{ fontSize: 16 }} />}
        label="Menipis"
        size="small"
        sx={{
          color: "#ffd54f",
          background: "rgba(255,213,79,.08)",
          border: "1px solid rgba(255,213,79,.18)",
          fontWeight: 700,
        }}
      />
    );
  }

  return (
    <Chip
      icon={<CheckCircleOutlined sx={{ fontSize: 16 }} />}
      label="Aman"
      size="small"
      sx={{
        color: "#00e676",
        background: "rgba(0,230,118,.08)",
        border: "1px solid rgba(0,230,118,.18)",
        fontWeight: 700,
      }}
    />
  );
}

export default function StockPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | StockStatus
  >("ALL");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      setLoading(true);

      try {
        const response = await fetch(
          "/api/inventory/items?limit=1000",
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil data stok.",
          );
        }

        if (!cancelled) {
          setItems(result.data ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Stock load error:", error);
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        item.category?.name
          ?.toLowerCase()
          .includes(keyword);

      const status = getStockStatus(
        item.stock,
        item.minimumStock,
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const safeCount = useMemo(
    () =>
      items.filter(
        (item) =>
          getStockStatus(
            item.stock,
            item.minimumStock,
          ) === "AMAN",
      ).length,
    [items],
  );

  const lowCount = useMemo(
    () =>
      items.filter(
        (item) =>
          getStockStatus(
            item.stock,
            item.minimumStock,
          ) === "MENIPIS",
      ).length,
    [items],
  );

  const emptyCount = useMemo(
    () =>
      items.filter(
        (item) =>
          getStockStatus(
            item.stock,
            item.minimumStock,
          ) === "HABIS",
      ).length,
    [items],
  );

  const paginatedItems = useMemo(() => {
    const start = page * rowsPerPage;

    return filteredItems.slice(
      start,
      start + rowsPerPage,
    );
  }, [filteredItems, page, rowsPerPage]);

  function handleSearch(
    value: string,
  ) {
    setSearch(value);
    setPage(0);
  }

  function handleStatus(
    value: "ALL" | StockStatus,
  ) {
    setStatusFilter(value);
    setPage(0);
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(0,230,118,0.08), transparent 30%), #020617",
        color: "#fff",
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
            display: "flex",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            justifyContent: "space-between",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(0,230,118,.20), rgba(0,230,118,.04))",
                  border:
                    "1px solid rgba(0,230,118,.20)",
                }}
              >
                <Inventory2Outlined
                  sx={{
                    color: "#00e676",
                    fontSize: 26,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Stok
                </Typography>

                <Typography
                  sx={{
                    color:
                      "rgba(255,255,255,.50)",
                    mt: 0.5,
                  }}
                >
                  Pantau ketersediaan perangkat dan
                  material secara realtime.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                color:
                  "rgba(255,255,255,.35)",
              }}
            >
              {items.length} jenis barang
            </Typography>
          </Box>
        </Box>

        {/* SUMMARY */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <StockSummaryCard
            icon={<CheckCircleOutlined />}
            title="Stok Aman"
            value={safeCount}
            description="Persediaan di atas minimum"
            iconColor="#00e676"
          />

          <StockSummaryCard
            icon={<WarningAmberOutlined />}
            title="Stok Menipis"
            value={lowCount}
            description="Perlu segera diperhatikan"
            iconColor="#ffd54f"
          />

          <StockSummaryCard
            icon={<ErrorOutlined />}
            title="Stok Habis"
            value={emptyCount}
            description="Barang tidak tersedia"
            iconColor="#ff5c7a"
          />
        </Box>

        {/* MAIN CARD */}
        <Paper
          sx={{
            background:
              "rgba(15,23,42,.78)",
            border:
              "1px solid rgba(255,255,255,.07)",
            borderRadius: 3,
            overflow: "hidden",
            backdropFilter: "blur(14px)",
          }}
        >
          {/* FILTER */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: {
                xs: "column",
                md: "row",
              },
              gap: 1.5,
              justifyContent:
                "space-between",
              borderBottom:
                "1px solid rgba(255,255,255,.06)",
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Cari kode, nama barang, atau kategori..."
              value={search}
              onChange={(event) =>
                handleSearch(
                  event.target.value,
                )
              }
              sx={{
                maxWidth: {
                  xs: "100%",
                  md: 520,
                },
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  borderRadius: 2,
                  background:
                    "rgba(2,6,23,.55)",
                  "& fieldset": {
                    borderColor:
                      "rgba(255,255,255,.10)",
                  },
                  "&:hover fieldset": {
                    borderColor:
                      "rgba(0,230,118,.30)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00e676",
                  },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined
                        sx={{
                          color:
                            "rgba(255,255,255,.35)",
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Select
              size="small"
              value={statusFilter}
              onChange={(event) =>
                handleStatus(
                  event.target.value as
                    | "ALL"
                    | StockStatus,
                )
              }
              sx={{
                minWidth: 170,
                color: "#fff",
                borderRadius: 2,
                background:
                  "rgba(2,6,23,.55)",
                "& .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor:
                      "rgba(255,255,255,.10)",
                  },
                "&:hover .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor:
                      "rgba(0,230,118,.30)",
                  },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#00e676",
                  },
                "& .MuiSelect-icon": {
                  color:
                    "rgba(255,255,255,.45)",
                },
              }}
              slotProps={{
                input: {
                  sx: {
                    background: "#0f172a",
                    color: "#fff",
                    border:
                      "1px solid rgba(255,255,255,.08)",
                  },
                },
              }}
            >
              <MenuItem value="ALL">
                Semua Status
              </MenuItem>

              <MenuItem value="AMAN">
                Stok Aman
              </MenuItem>

              <MenuItem value="MENIPIS">
                Stok Menipis
              </MenuItem>

              <MenuItem value="HABIS">
                Stok Habis
              </MenuItem>
            </Select>
          </Box>

          {/* TABLE */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "Barang",
                    "Kategori",
                    "Stok",
                    "Minimum",
                    "Status",
                    "Lokasi",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        color:
                          "rgba(255,255,255,.42)",
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform:
                          "uppercase",
                        letterSpacing: ".05em",
                        borderBottom:
                          "1px solid rgba(255,255,255,.07)",
                        py: 2,
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{
                        py: 9,
                        borderBottom: "none",
                      }}
                    >
                      <CircularProgress
                        size={28}
                        sx={{
                          color: "#00e676",
                        }}
                      />

                      <Typography
                        sx={{
                          mt: 1.5,
                          color:
                            "rgba(255,255,255,.40)",
                          fontSize: 13,
                        }}
                      >
                        Memuat data stok...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{
                        py: 9,
                        borderBottom: "none",
                      }}
                    >
                      <Inventory2Outlined
                        sx={{
                          fontSize: 48,
                          color:
                            "rgba(255,255,255,.12)",
                        }}
                      />

                      <Typography
                        sx={{
                          mt: 1,
                          fontWeight: 700,
                          color:
                            "rgba(255,255,255,.60)",
                        }}
                      >
                        Data stok tidak ditemukan
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: 13,
                          color:
                            "rgba(255,255,255,.32)",
                        }}
                      >
                        Coba ubah kata pencarian
                        atau filter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map(
                    (item) => {
                      const status =
                        getStockStatus(
                          item.stock,
                          item.minimumStock,
                        );

                      return (
                        <TableRow
                          key={item.id}
                          hover
                          sx={{
                            "&:hover": {
                              background:
                                "rgba(0,230,118,.025)",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              borderBottom:
                                "1px solid rgba(255,255,255,.05)",
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: 14,
                              }}
                            >
                              {item.name}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.35,
                                color:
                                  "rgba(255,255,255,.32)",
                                fontSize: 11,
                              }}
                            >
                              {item.code}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              color:
                                "rgba(255,255,255,.60)",
                              borderBottom:
                                "1px solid rgba(255,255,255,.05)",
                            }}
                          >
                            {item.category?.name ||
                              "-"}
                          </TableCell>

                          <TableCell
                            sx={{
                              borderBottom:
                                "1px solid rgba(255,255,255,.05)",
                            }}
                          >
                            <Typography
                              sx={{
                                color:
                                  status === "HABIS"
                                    ? "#ff5c7a"
                                    : status ===
                                      "MENIPIS"
                                      ? "#ffd54f"
                                      : "#00e676",
                                fontWeight: 900,
                                fontSize: 15,
                              }}
                            >
                              {numberFormat(
                                item.stock,
                              )}{" "}
                              <Box
                                component="span"
                                sx={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color:
                                    "rgba(255,255,255,.35)",
                                }}
                              >
                                {item.unit}
                              </Box>
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              color:
                                "rgba(255,255,255,.55)",
                              borderBottom:
                                "1px solid rgba(255,255,255,.05)",
                            }}
                          >
                            {numberFormat(
                              item.minimumStock,
                            )}{" "}
                            {item.unit}
                          </TableCell>

                          <TableCell
                            sx={{
                              borderBottom:
                                "1px solid rgba(255,255,255,.05)",
                            }}
                          >
                            <StatusChip
                              status={status}
                            />
                          </TableCell>

                          <TableCell
                            sx={{
                              color:
                                "rgba(255,255,255,.50)",
                              borderBottom:
                                "1px solid rgba(255,255,255,.05)",
                            }}
                          >
                            {item.location || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredItems.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) =>
              setPage(newPage)
            }
            onRowsPerPageChange={(event) => {
              setRowsPerPage(
                Number(event.target.value),
              );
              setPage(0);
            }}
            rowsPerPageOptions={[
              10,
              25,
              50,
            ]}
            sx={{
              color:
                "rgba(255,255,255,.60)",
              borderTop:
                "1px solid rgba(255,255,255,.06)",
              "& .MuiIconButton-root": {
                color:
                  "rgba(255,255,255,.60)",
              },
              "& .MuiTablePagination-selectIcon":
                {
                  color:
                    "rgba(255,255,255,.45)",
                },
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
}

function StockSummaryCard({
  icon,
  title,
  value,
  description,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  iconColor: string;
}) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        background:
          "rgba(15,23,42,.72)",
        border:
          "1px solid rgba(255,255,255,.07)",
        color: "#fff",
        backdropFilter: "blur(14px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 13,
              color:
                "rgba(255,255,255,.45)",
              mb: 1,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: 30,
              lineHeight: 1,
              fontWeight: 900,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color:
                "rgba(255,255,255,.30)",
              mt: 1,
            }}
          >
            {description}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: iconColor,
            background: `${iconColor}12`,
            border: `1px solid ${iconColor}25`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}