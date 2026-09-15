"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Snackbar,
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
  AddOutlined,
  ArrowBackOutlined,
  CloseOutlined,
  DeleteOutlined,
  Inventory2Outlined,
  RefreshOutlined,
  RemoveCircleOutlineOutlined,
  SearchOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

type Technician = {
  id: number;
  name: string;
};

type InventoryItem = {
  id: number;
  code: string;
  name: string;
  unit: string;
  stock: string | number;
};

type StockOutItem = {
  id: number;
  itemId: number;
  quantity: string | number;
  item?: InventoryItem;
};

type StockOutTransaction = {
  id: number;
  transactionCode: string;
  transactionDate: string;
  purpose: string | null;
  notes: string | null;
  issuedBy?: {
    id: number;
    name: string;
  };
  technician?: Technician | null;
  items: StockOutItem[];
};

type FormItem = {
  itemId: number | "";
  quantity: string;
};

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
};

const emptyFormItem: FormItem = {
  itemId: "",
  quantity: "",
};

function formatNumber(value: string | number) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(number);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function StockOutPage() {
  const [transactions, setTransactions] = useState<StockOutTransaction[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState<StockOutTransaction | null>(null);

  const [technicianId, setTechnicianId] = useState<number | "">("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [formItems, setFormItems] = useState<FormItem[]>([
    { ...emptyFormItem },
  ]);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const totalQuantity = useMemo(() => {
    return formItems.reduce((sum, row) => {
      return sum + Number(row.quantity || 0);
    }, 0);
  }, [formItems]);

  const activeItemIds = useMemo(() => {
    return formItems
      .map((row) => row.itemId)
      .filter((id): id is number => id !== "");
  }, [formItems]);

  async function loadTransactions() {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `/api/inventory/stock-out?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil transaksi.");
      }

      setTransactions(result.data ?? []);
      setTotal(result.pagination?.total ?? 0);
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Gagal mengambil transaksi.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadFormData() {
    try {
      const [technicianResponse, itemResponse] = await Promise.all([
        fetch("/api/users?role=TEKNISI&status=ACTIVE", {
          cache: "no-store",
        }),
        fetch("/api/inventory/items?limit=100", {
          cache: "no-store",
        }),
      ]);

      const technicianResult = await technicianResponse.json();
      const itemResult = await itemResponse.json();

      if (technicianResponse.ok) {
        setTechnicians(
          (technicianResult.data ?? []).map(
            (user: { id: number; name: string }) => ({
              id: user.id,
              name: user.name,
            }),
          ),
        );
      }

      if (itemResponse.ok) {
        setInventoryItems(itemResult.data ?? []);
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Gagal memuat data teknisi atau barang.",
        severity: "error",
      });
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchTransactions() {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page + 1),
          limit: String(rowsPerPage),
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const response = await fetch(
          `/api/inventory/stock-out?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal mengambil transaksi.");
        }

        if (!cancelled) {
          setTransactions(result.data ?? []);
          setTotal(result.pagination?.total ?? 0);
        }
      } catch (error) {
        if (!cancelled) {
          setSnackbar({
            open: true,
            message:
              error instanceof Error
                ? error.message
                : "Gagal mengambil transaksi.",
            severity: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTransactions();

    return () => {
      cancelled = true;
    };
  }, [page, rowsPerPage, search]);

  useEffect(() => {
    let cancelled = false;

    async function fetchFormData() {
      try {
        const [technicianResponse, itemResponse] = await Promise.all([
          fetch("/api/users?role=TEKNISI&status=ACTIVE", {
            cache: "no-store",
          }),
          fetch("/api/inventory/items?limit=100", {
            cache: "no-store",
          }),
        ]);

        const technicianResult = await technicianResponse.json();

        const itemResult = await itemResponse.json();

        if (cancelled) {
          return;
        }

        if (technicianResponse.ok) {
          setTechnicians(
            (technicianResult.data ?? []).map(
              (user: { id: number; name: string }) => ({
                id: user.id,
                name: user.name,
              }),
            ),
          );
        }

        if (itemResponse.ok) {
          setInventoryItems(itemResult.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setSnackbar({
            open: true,
            message: "Gagal memuat data teknisi atau barang.",
            severity: "error",
          });
        }
      }
    }

    fetchFormData();

    return () => {
      cancelled = true;
    };
  }, []);

  function openCreateDialog() {
    setTechnicianId("");
    setPurpose("");
    setNotes("");
    setFormItems([{ ...emptyFormItem }]);
    setCreateOpen(true);
  }

  function closeCreateDialog() {
    if (!formLoading) {
      setCreateOpen(false);
    }
  }

  function addItemRow() {
    setFormItems((current) => [
      ...current,
      {
        ...emptyFormItem,
      },
    ]);
  }

  function removeItemRow(index: number) {
    setFormItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((_, rowIndex) => rowIndex !== index);
    });
  }

  function updateItemRow(
    index: number,
    field: keyof FormItem,
    value: number | string,
  ) {
    setFormItems((current) =>
      current.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }

        return {
          ...row,
          [field]: value,
        };
      }),
    );
  }

  function getAvailableStock(itemId: number | "") {
    if (itemId === "") {
      return 0;
    }

    const item = inventoryItems.find((entry) => entry.id === itemId);

    return item ? Number(item.stock) : 0;
  }

  function validateForm() {
    if (formItems.length === 0) {
      return "Minimal satu barang harus dipilih.";
    }

    if (purpose.trim().length === 0) {
      return "Tujuan pengeluaran barang wajib diisi.";
    }

    const ids = new Set<number>();

    for (const row of formItems) {
      if (row.itemId === "") {
        return "Semua baris harus memiliki barang.";
      }

      if (ids.has(row.itemId)) {
        return "Barang yang sama tidak boleh dimasukkan dua kali.";
      }

      ids.add(row.itemId);

      const quantity = Number(row.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return "Quantity setiap barang harus lebih dari 0.";
      }

      const stock = getAvailableStock(row.itemId);

      if (quantity > stock) {
        const item = inventoryItems.find((entry) => entry.id === row.itemId);

        return `Stok ${item?.name ?? "barang"} tidak mencukupi. Stok tersedia ${formatNumber(
          stock,
        )}.`;
      }
    }

    return null;
  }

  async function handleSubmit() {
    const validationError = validateForm();

    if (validationError) {
      setSnackbar({
        open: true,
        message: validationError,
        severity: "error",
      });

      return;
    }

    setFormLoading(true);

    try {
      const response = await fetch("/api/inventory/stock-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          technicianId: technicianId === "" ? null : technicianId,
          purpose: purpose.trim(),
          notes: notes.trim() || null,
          items: formItems.map((row) => ({
            itemId: row.itemId,
            quantity: Number(row.quantity),
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menyimpan transaksi barang keluar.",
        );
      }

      setCreateOpen(false);

      setSnackbar({
        open: true,
        message: "Transaksi barang keluar berhasil dibuat.",
        severity: "success",
      });

      await loadTransactions();
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : "Gagal menyimpan transaksi.",
        severity: "error",
      });
    } finally {
      setFormLoading(false);
    }
  }

  async function handleRefresh() {
    await Promise.all([loadTransactions(), loadFormData()]);
  }

  function openDetail(transaction: StockOutTransaction) {
    setSelectedTransaction(transaction);
    setDetailOpen(true);
  }

  const availableItemOptions = (currentItemId: number | "") => {
    return inventoryItems.filter(
      (item) => item.id === currentItemId || !activeItemIds.includes(item.id),
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(0,230,118,0.08), transparent 30%), #020617",
        color: "#fff",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="xl">
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
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
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, rgba(0,230,118,.20), rgba(0,230,118,.05))",
                  border: "1px solid rgba(0,230,118,.25)",
                }}
              >
                <RemoveCircleOutlineOutlined
                  sx={{
                    color: "#00e676",
                    fontSize: 25,
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
                  Barang Keluar
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,.55)",
                    mt: 0.5,
                  }}
                >
                  Catat pengeluaran barang untuk teknisi dan operasional.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={handleRefresh}
              sx={{
                borderColor: "rgba(255,255,255,.12)",
                color: "#fff",
                borderRadius: 2.5,
                textTransform: "none",
                "&:hover": {
                  borderColor: "rgba(0,230,118,.45)",
                  background: "rgba(0,230,118,.05)",
                },
              }}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={openCreateDialog}
              sx={{
                background: "#00e676",
                color: "#001b0d",
                fontWeight: 800,
                borderRadius: 2.5,
                textTransform: "none",
                px: 2.5,
                "&:hover": {
                  background: "#00c965",
                },
              }}
            >
              Barang Keluar
            </Button>
          </Box>
        </Box>

        {/* SUMMARY */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: "rgba(15,23,42,.72)",
              border: "1px solid rgba(255,255,255,.07)",
              color: "#fff",
              backdropFilter: "blur(14px)",
            }}
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,.48)",
                fontSize: 13,
                mb: 1,
              }}
            >
              Transaksi Ditampilkan
            </Typography>

            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {formatNumber(transactions.length)}
            </Typography>
          </Paper>

          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: "rgba(15,23,42,.72)",
              border: "1px solid rgba(255,255,255,.07)",
              color: "#fff",
              backdropFilter: "blur(14px)",
            }}
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,.48)",
                fontSize: 13,
                mb: 1,
              }}
            >
              Total Transaksi
            </Typography>

            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {formatNumber(total)}
            </Typography>
          </Paper>

          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: "rgba(15,23,42,.72)",
              border: "1px solid rgba(255,255,255,.07)",
              color: "#fff",
              backdropFilter: "blur(14px)",
            }}
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,.48)",
                fontSize: 13,
                mb: 1,
              }}
            >
              Item Keluar di Halaman
            </Typography>

            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {formatNumber(
                transactions.reduce(
                  (sum, transaction) =>
                    sum +
                    transaction.items.reduce(
                      (itemSum, item) => itemSum + Number(item.quantity || 0),
                      0,
                    ),
                  0,
                ),
              )}
            </Typography>
          </Paper>
        </Box>

        {/* TABLE CARD */}
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background: "rgba(15,23,42,.78)",
            border: "1px solid rgba(255,255,255,.07)",
            color: "#fff",
            backdropFilter: "blur(14px)",
          }}
        >
          {/* SEARCH */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Cari kode transaksi, teknisi, atau tujuan..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              sx={{
                maxWidth: 600,
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  borderRadius: 2,
                  background: "rgba(2,6,23,.55)",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,.10)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(0,230,118,.30)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00e676",
                  },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchOutlined
                      sx={{
                        mr: 1,
                        color: "rgba(255,255,255,.40)",
                      }}
                    />
                  ),
                },
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "Transaksi",
                    "Tanggal",
                    "Teknisi",
                    "Tujuan",
                    "Item",
                    "Dibuat Oleh",
                    "",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        color: "rgba(255,255,255,.48)",
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                        borderBottom: "1px solid rgba(255,255,255,.07)",
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
                      colSpan={7}
                      align="center"
                      sx={{
                        py: 8,
                        borderBottom: "none",
                      }}
                    >
                      <CircularProgress size={28} sx={{ color: "#00e676" }} />
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{
                        py: 8,
                        borderBottom: "none",
                      }}
                    >
                      <Inventory2Outlined
                        sx={{
                          fontSize: 46,
                          color: "rgba(255,255,255,.15)",
                          mb: 1,
                        }}
                      />

                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "rgba(255,255,255,.65)",
                        }}
                      >
                        Belum ada transaksi barang keluar
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "rgba(255,255,255,.38)",
                          mt: 0.5,
                        }}
                      >
                        Buat transaksi pertama untuk mencatat pengeluaran
                        barang.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      hover
                      sx={{
                        "&:hover": {
                          background: "rgba(0,230,118,.025)",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "#fff",
                          borderBottom: "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: 14,
                          }}
                        >
                          {transaction.transactionCode}
                        </Typography>

                        <Typography
                          sx={{
                            color: "rgba(255,255,255,.35)",
                            fontSize: 12,
                            mt: 0.3,
                          }}
                        >
                          ID #{transaction.id}
                        </Typography>
                      </TableCell>

                      <TableCell
                        sx={{
                          color: "rgba(255,255,255,.70)",
                          borderBottom: "1px solid rgba(255,255,255,.05)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(transaction.transactionDate)}
                      </TableCell>

                      <TableCell
                        sx={{
                          color: "#fff",
                          borderBottom: "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        {transaction.technician ? (
                          <Chip
                            label={transaction.technician.name}
                            size="small"
                            sx={{
                              background: "rgba(0,230,118,.10)",
                              color: "#00e676",
                              border: "1px solid rgba(0,230,118,.18)",
                              fontWeight: 700,
                            }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              color: "rgba(255,255,255,.35)",
                              fontSize: 13,
                            }}
                          >
                            Tidak ditentukan
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell
                        sx={{
                          color: "rgba(255,255,255,.70)",
                          maxWidth: 260,
                          borderBottom: "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        <Typography
                          noWrap
                          sx={{
                            fontSize: 13,
                          }}
                        >
                          {transaction.purpose || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell
                        sx={{
                          borderBottom: "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        <Chip
                          label={`${transaction.items.length} item`}
                          size="small"
                          sx={{
                            color: "#fff",
                            background: "rgba(255,255,255,.07)",
                            border: "1px solid rgba(255,255,255,.08)",
                          }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          color: "rgba(255,255,255,.65)",
                          borderBottom: "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        {transaction.issuedBy?.name || "-"}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          borderBottom: "1px solid rgba(255,255,255,.05)",
                        }}
                      >
                        <IconButton
                          onClick={() => openDetail(transaction)}
                          sx={{
                            color: "rgba(255,255,255,.55)",
                            "&:hover": {
                              color: "#00e676",
                              background: "rgba(0,230,118,.08)",
                            },
                          }}
                        >
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{
              color: "rgba(255,255,255,.65)",
              borderTop: "1px solid rgba(255,255,255,.06)",
              "& .MuiTablePagination-selectIcon": {
                color: "rgba(255,255,255,.5)",
              },
              "& .MuiIconButton-root": {
                color: "rgba(255,255,255,.65)",
              },
            }}
          />
        </Paper>
      </Container>

      {/* CREATE DIALOG */}
      <Dialog
        open={createOpen}
        onClose={closeCreateDialog}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              background: "#0f172a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 3,
              backgroundImage: "none",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 800,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <RemoveCircleOutlineOutlined sx={{ color: "#00e676" }} />

            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 20,
                }}
              >
                Barang Keluar
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.40)",
                  fontWeight: 400,
                }}
              >
                Kurangi stok secara aman dan tercatat.
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={closeCreateDialog}
            disabled={formLoading}
            sx={{
              color: "rgba(255,255,255,.45)",
            }}
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 2,
              mb: 3,
            }}
          >
            <Autocomplete
              options={technicians}
              value={
                technicians.find(
                  (technician) => technician.id === technicianId,
                ) ?? null
              }
              onChange={(_, value) => {
                setTechnicianId(value?.id ?? "");
              }}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Teknisi"
                  placeholder="Pilih teknisi"
                />
              )}
              sx={darkFieldSx}
            />

            <TextField
              fullWidth
              label="Tujuan Pengeluaran"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="Contoh: Instalasi pelanggan"
              sx={darkFieldSx}
            />
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              background: "rgba(0,230,118,.045)",
              border: "1px solid rgba(0,230,118,.10)",
              mb: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Detail Barang
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,.38)",
                    fontSize: 12,
                  }}
                >
                  Pastikan quantity tidak melebihi stok.
                </Typography>
              </Box>

              <Button
                size="small"
                startIcon={<AddOutlined />}
                onClick={addItemRow}
                sx={{
                  color: "#00e676",
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                Tambah Item
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {formItems.map((row, index) => {
                const currentItem =
                  row.itemId === ""
                    ? null
                    : inventoryItems.find((item) => item.id === row.itemId);

                const availableStock = getAvailableStock(row.itemId);

                const quantity = Number(row.quantity || 0);

                const insufficient =
                  row.itemId !== "" && quantity > availableStock;

                return (
                  <Box
                    key={index}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "minmax(0, 1fr) 150px 44px",
                      },
                      gap: 1,
                      alignItems: "start",
                    }}
                  >
                    <Autocomplete
                      options={availableItemOptions(row.itemId)}
                      value={currentItem}
                      onChange={(_, value) => {
                        updateItemRow(index, "itemId", value?.id ?? "");
                      }}
                      getOptionLabel={(option) =>
                        `${option.code} — ${option.name}`
                      }
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      renderOption={(props, option) => (
                        <Box
                          component="li"
                          {...props}
                          key={option.id}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start !important",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {option.name}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "rgba(255,255,255,.45)",
                            }}
                          >
                            {option.code} • Stok {formatNumber(option.stock)}{" "}
                            {option.unit}
                          </Typography>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={`Barang ${index + 1}`}
                          placeholder="Pilih barang"
                        />
                      )}
                      sx={darkFieldSx}
                    />

                    <TextField
                      fullWidth
                      label="Quantity"
                      value={row.quantity}
                      onChange={(event) => {
                        const value = event.target.value;

                        if (value === "" || /^\d*([.]\d{0,2})?$/.test(value)) {
                          updateItemRow(index, "quantity", value);
                        }
                      }}
                      error={insufficient}
                      helperText={
                        currentItem
                          ? `Tersedia: ${formatNumber(
                              availableStock,
                            )} ${currentItem.unit}`
                          : "Masukkan quantity"
                      }
                      slotProps={{
                        htmlInput: {
                          inputMode: "decimal",
                          min: 0,
                          step: 0.01,
                        },
                      }}
                      sx={darkFieldSx}
                    />

                    <IconButton
                      onClick={() => removeItemRow(index)}
                      disabled={formItems.length === 1}
                      sx={{
                        mt: { xs: 0, sm: 1 },
                        color:
                          formItems.length === 1
                            ? "rgba(255,255,255,.15)"
                            : "#ff5c7a",
                        background: "rgba(255,255,255,.03)",
                        borderRadius: 2,
                      }}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* TOTAL */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderRadius: 2.5,
              background: "rgba(2,6,23,.65)",
              border: "1px solid rgba(255,255,255,.07)",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,.48)",
              }}
            >
              Total Quantity
            </Typography>

            <Typography
              sx={{
                fontWeight: 900,
                fontSize: 22,
                color: "#00e676",
              }}
            >
              {formatNumber(totalQuantity)}
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Catatan"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Tambahkan catatan jika diperlukan..."
            sx={darkFieldSx}
          />
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={closeCreateDialog}
            disabled={formLoading}
            sx={{
              color: "rgba(255,255,255,.55)",
              textTransform: "none",
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={formLoading}
            startIcon={
              formLoading ? (
                <CircularProgress size={17} sx={{ color: "#001b0d" }} />
              ) : (
                <RemoveCircleOutlineOutlined />
              )
            }
            sx={{
              background: "#00e676",
              color: "#001b0d",
              fontWeight: 800,
              borderRadius: 2,
              textTransform: "none",
              px: 2.5,
              "&:hover": {
                background: "#00c965",
              },
            }}
          >
            {formLoading ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              background: "#0f172a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 3,
              backgroundImage: "none",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              Detail Barang Keluar
            </Typography>

            <Typography
              sx={{
                color: "#00e676",
                fontSize: 13,
                mt: 0.5,
                fontWeight: 700,
              }}
            >
              {selectedTransaction?.transactionCode}
            </Typography>
          </Box>

          <IconButton
            onClick={() => setDetailOpen(false)}
            sx={{
              color: "rgba(255,255,255,.45)",
            }}
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedTransaction && (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <DetailInfo
                  label="Tanggal"
                  value={formatDate(selectedTransaction.transactionDate)}
                />

                <DetailInfo
                  label="Teknisi"
                  value={
                    selectedTransaction.technician?.name || "Tidak ditentukan"
                  }
                />

                <DetailInfo
                  label="Tujuan"
                  value={selectedTransaction.purpose || "-"}
                />

                <DetailInfo
                  label="Dibuat Oleh"
                  value={selectedTransaction.issuedBy?.name || "-"}
                />
              </Box>

              <Divider
                sx={{
                  borderColor: "rgba(255,255,255,.07)",
                  mb: 2,
                }}
              />

              <Typography
                sx={{
                  fontWeight: 800,
                  mb: 1.5,
                }}
              >
                Barang yang Dikeluarkan
              </Typography>

              <TableContainer
                sx={{
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 2,
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          color: "rgba(255,255,255,.45)",
                          borderBottom: "1px solid rgba(255,255,255,.07)",
                        }}
                      >
                        Barang
                      </TableCell>

                      <TableCell
                        sx={{
                          color: "rgba(255,255,255,.45)",
                          borderBottom: "1px solid rgba(255,255,255,.07)",
                        }}
                      >
                        Kode
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          color: "rgba(255,255,255,.45)",
                          borderBottom: "1px solid rgba(255,255,255,.07)",
                        }}
                      >
                        Quantity
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {selectedTransaction.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell
                          sx={{
                            color: "#fff",
                            borderBottom: "1px solid rgba(255,255,255,.05)",
                          }}
                        >
                          {item.item?.name || `Item #${item.itemId}`}
                        </TableCell>

                        <TableCell
                          sx={{
                            color: "rgba(255,255,255,.55)",
                            borderBottom: "1px solid rgba(255,255,255,.05)",
                          }}
                        >
                          {item.item?.code || "-"}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color: "#00e676",
                            fontWeight: 800,
                            borderBottom: "1px solid rgba(255,255,255,.05)",
                          }}
                        >
                          {formatNumber(item.quantity)} {item.item?.unit || ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedTransaction.notes && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    background: "rgba(255,255,255,.025)",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.38)",
                      mb: 0.5,
                    }}
                  >
                    Catatan
                  </Typography>

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.70)",
                      fontSize: 14,
                    }}
                  >
                    {selectedTransaction.notes}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDetailOpen(false)}
            startIcon={<ArrowBackOutlined />}
            sx={{
              color: "#fff",
              textTransform: "none",
            }}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={() =>
          setSnackbar((current) => ({
            ...current,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((current) => ({
              ...current,
              open: false,
            }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function DetailInfo({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 2,
        background: "rgba(255,255,255,.025)",
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          color: "rgba(255,255,255,.35)",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontWeight: 700,
          color: "rgba(255,255,255,.82)",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

const darkFieldSx = {
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,.45)",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#00e676",
  },

  "& .MuiOutlinedInput-root": {
    color: "#fff",
    background: "rgba(2,6,23,.55)",
    borderRadius: 2,

    "& fieldset": {
      borderColor: "rgba(255,255,255,.10)",
    },

    "&:hover fieldset": {
      borderColor: "rgba(0,230,118,.30)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#00e676",
    },
  },

  "& .MuiFormHelperText-root": {
    color: "rgba(255,255,255,.35)",
  },

  "& .MuiFormHelperText-root.Mui-error": {
    color: "#ff5c7a",
  },
};
