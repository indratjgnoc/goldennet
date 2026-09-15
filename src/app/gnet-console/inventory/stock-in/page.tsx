"use client";

import {
  AddOutlined,
  ArrowBackOutlined,
  DeleteOutlined,
  Inventory2Outlined,
  LocalShippingOutlined,
  RefreshOutlined,
  SaveOutlined,
  SearchOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Supplier = {
  id: number;
  name: string;
  code: string;
};

type InventoryItem = {
  id: number;
  code: string;
  name: string;
  unit: string;
  stock: string;
};

type StockInItem = {
  id: number;
  itemId: number;
  quantity: string;
  unitPrice: string;
  subtotal: string;
  item: InventoryItem;
};

type StockInTransaction = {
  id: number;
  transactionCode: string;
  transactionDate: string;
  notes: string | null;
  supplier: Supplier;
  receivedBy: {
    id: number;
    name: string;
    username: string;
  };
  items: StockInItem[];
  totalAmount: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type FormItem = {
  itemId: number | null;
  quantity: string;
  unitPrice: string;
};

const emptyFormItem: FormItem = {
  itemId: null,
  quantity: "",
  unitPrice: "",
};

function formatCurrency(value: string | number) {
  const number = typeof value === "number" ? value : Number(value);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(number) ? number : 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTimeLocal(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
}

export default function StockInPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<StockInTransaction[]>([]);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(false);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [detailTransaction, setDetailTransaction] =
    useState<StockInTransaction | null>(null);

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const [transactionDate, setTransactionDate] = useState(formatDateTimeLocal());

  const [notes, setNotes] = useState("");

  const [formItems, setFormItems] = useState<FormItem[]>([
    { ...emptyFormItem },
  ]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      params.set("page", String(page));
      params.set("limit", "20");

      const response = await fetch(
        `/api/inventory/stock-in?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      const result: ApiResponse<StockInTransaction[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengambil transaksi Barang Masuk.",
        );
      }

      setTransactions(result.data ?? []);
      setTotal(result.pagination?.total ?? 0);
    } catch (err) {
      console.error("LOAD STOCK IN ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data Barang Masuk.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  const loadFormData = useCallback(async () => {
    try {
      setLoadingFormData(true);

      const [supplierResponse, itemResponse] = await Promise.all([
        fetch("/api/inventory/suppliers?status=active", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),

        fetch("/api/inventory/items?status=active&limit=100", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const supplierResult = await supplierResponse.json();

      const itemResult = await itemResponse.json();

      if (!supplierResponse.ok) {
        throw new Error(
          supplierResult.message || "Gagal mengambil data supplier.",
        );
      }

      if (!itemResponse.ok) {
        throw new Error(itemResult.message || "Gagal mengambil data barang.");
      }

      setSuppliers(supplierResult.data ?? []);

      setItems(itemResult.data ?? []);
    } catch (err) {
      console.error("LOAD STOCK IN FORM ERROR:", err);

      setError(err instanceof Error ? err.message : "Gagal memuat data form.");
    } finally {
      setLoadingFormData(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTransactions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTransactions]);

  const openCreateDialog = async () => {
    setError("");
    setSelectedSupplier(null);
    setTransactionDate(formatDateTimeLocal());
    setNotes("");
    setFormItems([{ ...emptyFormItem }]);

    setDialogOpen(true);

    if (suppliers.length === 0 || items.length === 0) {
      await loadFormData();
    }
  };

  const closeCreateDialog = () => {
    if (saving) return;

    setDialogOpen(false);
  };

  const addItemRow = () => {
    setFormItems((current) => [...current, { ...emptyFormItem }]);
  };

  const removeItemRow = (index: number) => {
    setFormItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const updateFormItem = (
    index: number,
    field: keyof FormItem,
    value: number | null | string,
  ) => {
    setFormItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const getItem = (itemId: number | null) =>
    items.find((item) => item.id === itemId) ?? null;

  const calculateRowSubtotal = (row: FormItem) => {
    const quantity = Number(row.quantity);
    const unitPrice = Number(row.unitPrice);

    if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
      return 0;
    }

    return quantity * unitPrice;
  };

  const grandTotal = useMemo(
    () =>
      formItems.reduce(
        (totalValue, row) => totalValue + calculateRowSubtotal(row),
        0,
      ),
    [formItems],
  );

  const totalQuantity = useMemo(
    () =>
      formItems.reduce((totalValue, row) => {
        const quantity = Number(row.quantity);

        return totalValue + (Number.isFinite(quantity) ? quantity : 0);
      }, 0),
    [formItems],
  );

  const validateForm = () => {
    if (!selectedSupplier) {
      return "Supplier wajib dipilih.";
    }

    if (!transactionDate) {
      return "Tanggal transaksi wajib diisi.";
    }

    if (formItems.length === 0) {
      return "Minimal harus ada satu barang.";
    }

    const usedItemIds = new Set<number>();

    for (let index = 0; index < formItems.length; index++) {
      const row = formItems[index];

      if (!row.itemId) {
        return `Barang pada baris ${index + 1} wajib dipilih.`;
      }

      if (usedItemIds.has(row.itemId)) {
        return `Barang pada baris ${index + 1} sudah dipilih sebelumnya.`;
      }

      usedItemIds.add(row.itemId);

      const quantity = Number(row.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return `Quantity pada baris ${index + 1} harus lebih dari 0.`;
      }

      const unitPrice = Number(row.unitPrice);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return `Harga beli pada baris ${index + 1} tidak valid.`;
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        supplierId: selectedSupplier?.id,
        transactionDate: new Date(transactionDate).toISOString(),
        notes: notes.trim() || null,
        items: formItems.map((row) => ({
          itemId: row.itemId,
          quantity: Number(row.quantity),
          unitPrice: Number(row.unitPrice),
        })),
      };

      const response = await fetch("/api/inventory/stock-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result: ApiResponse<StockInTransaction> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan Barang Masuk.");
      }

      setSuccess("Transaksi Barang Masuk berhasil disimpan.");

      setDialogOpen(false);

      await loadTransactions();
    } catch (err) {
      console.error("SAVE STOCK IN ERROR:", err);

      setError(
        err instanceof Error ? err.message : "Gagal menyimpan Barang Masuk.",
      );
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.max(Math.ceil(total / 20), 1);

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
            <Button
              startIcon={<ArrowBackOutlined />}
              onClick={() => router.push("/gnet-console/inventory")}
              sx={{
                mb: 1,
                color: "rgba(255,255,255,.60)",
                textTransform: "none",
              }}
            >
              Kembali ke Inventory
            </Button>

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
                    "linear-gradient(135deg, rgba(0,230,118,.20), rgba(0,230,118,.05))",
                  border: "1px solid rgba(0,230,118,.25)",
                  color: "#00e676",
                }}
              >
                <ReceiptLongOutlined />
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Barang Masuk
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,.55)",
                    mt: 0.3,
                  }}
                >
                  Catat penerimaan barang dari supplier dan tambah stok gudang.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={loadTransactions}
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                borderColor: "rgba(255,255,255,.12)",
                color: "#fff",
              }}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={openCreateDialog}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
                boxShadow: "0 8px 30px rgba(0,230,118,.18)",
              }}
            >
              Transaksi Baru
            </Button>
          </Box>
        </Box>

        {/* ERROR */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

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
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,.07)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.015))",
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,.55)",
                  mb: 1,
                }}
              >
                Total Transaksi
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                }}
              >
                {total}
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(0,230,118,.12)",
              background:
                "linear-gradient(145deg, rgba(0,230,118,.08), rgba(0,230,118,.015))",
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,.55)",
                  mb: 1,
                }}
              >
                Modul
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Inventory2Outlined
                  sx={{
                    color: "#00e676",
                  }}
                />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Penerimaan Gudang
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,.07)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,.045), rgba(255,255,255,.015))",
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,.55)",
                  mb: 1,
                }}
              >
                Status Sistem
              </Typography>

              <Chip
                label="Aktif"
                size="small"
                sx={{
                  color: "#00e676",
                  background: "rgba(0,230,118,.10)",
                  border: "1px solid rgba(0,230,118,.20)",
                  fontWeight: 700,
                }}
              />
            </CardContent>
          </Card>
        </Box>

        {/* SEARCH */}
        <Card
          sx={{
            mb: 2,
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,.07)",
            background: "rgba(255,255,255,.025)",
          }}
        >
          <CardContent>
            <TextField
              fullWidth
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nomor transaksi atau supplier..."
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  background: "rgba(0,0,0,.15)",
                },
              }}
            />
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,.07)",
            background:
              "linear-gradient(145deg, rgba(255,255,255,.04), rgba(255,255,255,.015))",
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{
              p: 0,
            }}
          >
            {loading ? (
              <Box
                sx={{
                  minHeight: 320,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
              </Box>
            ) : transactions.length === 0 ? (
              <Box
                sx={{
                  minHeight: 320,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 3,
                  textAlign: "center",
                }}
              >
                <ReceiptLongOutlined
                  sx={{
                    fontSize: 52,
                    color: "rgba(255,255,255,.20)",
                    mb: 1,
                  }}
                />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Belum ada transaksi
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,.50)",
                    mt: 0.5,
                    mb: 2,
                  }}
                >
                  Belum terdapat data Barang Masuk.
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<AddOutlined />}
                  onClick={openCreateDialog}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Buat Transaksi
                </Button>
              </Box>
            ) : (
              <>
                <TableContainer
                  sx={{
                    overflowX: "auto",
                  }}
                >
                  <Table
                    sx={{
                      minWidth: 850,
                    }}
                  >
                    <TableHead>
                      <TableRow
                        sx={{
                          "& th": {
                            borderColor: "rgba(255,255,255,.07)",
                            color: "rgba(255,255,255,.50)",
                            fontWeight: 800,
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: ".04em",
                          },
                        }}
                      >
                        <TableCell>Transaksi</TableCell>

                        <TableCell>Supplier</TableCell>

                        <TableCell>Tanggal</TableCell>

                        <TableCell>Barang</TableCell>

                        <TableCell align="right">Total</TableCell>

                        <TableCell>Petugas</TableCell>

                        <TableCell align="right">Aksi</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow
                          key={transaction.id}
                          hover
                          sx={{
                            "& td": {
                              borderColor: "rgba(255,255,255,.055)",
                            },
                            cursor: "pointer",
                          }}
                          onClick={() => setDetailTransaction(transaction)}
                        >
                          <TableCell>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: "#00e676",
                              }}
                            >
                              {transaction.transactionCode}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <LocalShippingOutlined
                                sx={{
                                  fontSize: 19,
                                  color: "rgba(255,255,255,.45)",
                                }}
                              />

                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                  }}
                                >
                                  {transaction.supplier.name}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "rgba(255,255,255,.40)",
                                  }}
                                >
                                  {transaction.supplier.code}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            {formatDate(transaction.transactionDate)}
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={`${transaction.items.length} jenis`}
                              size="small"
                              sx={{
                                background: "rgba(255,255,255,.06)",
                                color: "rgba(255,255,255,.75)",
                              }}
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontWeight: 800,
                              }}
                            >
                              {formatCurrency(transaction.totalAmount)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              {transaction.receivedBy.name}
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Button
                              size="small"
                              onClick={(event) => {
                                event.stopPropagation();

                                setDetailTransaction(transaction);
                              }}
                              sx={{
                                textTransform: "none",
                                color: "#00e676",
                                fontWeight: 700,
                              }}
                            >
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* PAGINATION */}
                <Divider
                  sx={{
                    borderColor: "rgba(255,255,255,.06)",
                  }}
                />

                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,.45)",
                    }}
                  >
                    Halaman {page} dari {totalPages}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <Button
                      size="small"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => current - 1)}
                      sx={{
                        textTransform: "none",
                      }}
                    >
                      Sebelumnya
                    </Button>

                    <Button
                      size="small"
                      disabled={page >= totalPages}
                      onClick={() => setPage((current) => current + 1)}
                      sx={{
                        textTransform: "none",
                      }}
                    >
                      Berikutnya
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* CREATE TRANSACTION DIALOG */}
      <Dialog
        open={dialogOpen}
        onClose={closeCreateDialog}
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              background: "#0b1220",
              backgroundImage: "none",
              border: "1px solid rgba(255,255,255,.08)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
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
                background: "rgba(0,230,118,.10)",
                color: "#00e676",
              }}
            >
              <AddOutlined />
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                }}
              >
                Transaksi Barang Masuk
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,.45)",
                }}
              >
                Tambahkan barang yang diterima dari supplier.
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {loadingFormData ? (
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
            <Box
              sx={{
                pt: 1,
              }}
            >
              {/* HEADER FORM */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1.5fr 1fr",
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Autocomplete
                  options={suppliers}
                  value={selectedSupplier}
                  onChange={(_event, value) => setSelectedSupplier(value)}
                  getOptionLabel={(option) => `${option.name} (${option.code})`}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Supplier"
                      placeholder="Pilih supplier"
                      required
                    />
                  )}
                />

                <TextField
                  label="Tanggal Transaksi"
                  type="datetime-local"
                  value={transactionDate}
                  onChange={(event) => setTransactionDate(event.target.value)}
                  required
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Box>

              {/* ITEMS */}
              <Card
                sx={{
                  borderRadius: 2.5,
                  border: "1px solid rgba(255,255,255,.07)",
                  background: "rgba(255,255,255,.025)",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 800,
                        }}
                      >
                        Detail Barang
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255,255,255,.45)",
                        }}
                      >
                        Tambahkan satu atau beberapa barang.
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddOutlined />}
                      onClick={addItemRow}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Tambah Barang
                    </Button>
                  </Box>

                  <TableContainer
                    sx={{
                      overflowX: "auto",
                    }}
                  >
                    <Table
                      sx={{
                        minWidth: 850,
                      }}
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>Barang</TableCell>

                          <TableCell width={140}>Quantity</TableCell>

                          <TableCell width={190}>Harga Beli</TableCell>

                          <TableCell width={190} align="right">
                            Subtotal
                          </TableCell>

                          <TableCell width={60} />
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {formItems.map((row, index) => {
                          const selectedItem = getItem(row.itemId);

                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Autocomplete
                                  options={items}
                                  value={selectedItem}
                                  onChange={(_event, value) =>
                                    updateFormItem(
                                      index,
                                      "itemId",
                                      value?.id ?? null,
                                    )
                                  }
                                  getOptionLabel={(option) =>
                                    `${option.name} — ${option.code}`
                                  }
                                  isOptionEqualToValue={(option, value) =>
                                    option.id === value.id
                                  }
                                  renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 700,
                                          }}
                                        >
                                          {option.name}
                                        </Typography>

                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "text.secondary",
                                          }}
                                        >
                                          {option.code} • Stok: {option.stock}{" "}
                                          {option.unit}
                                        </Typography>
                                      </Box>
                                    </li>
                                  )}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      placeholder="Pilih barang"
                                      size="small"
                                    />
                                  )}
                                />
                              </TableCell>

                              <TableCell>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="number"
                                  value={row.quantity}
                                  onChange={(event) =>
                                    updateFormItem(
                                      index,
                                      "quantity",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="0"
                                  slotProps={{
                                    htmlInput: {
                                      min: 0.01,
                                      step: 0.01,
                                    },
                                  }}
                                />
                              </TableCell>

                              <TableCell>
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="number"
                                  value={row.unitPrice}
                                  onChange={(event) =>
                                    updateFormItem(
                                      index,
                                      "unitPrice",
                                      event.target.value,
                                    )
                                  }
                                  placeholder="0"
                                  slotProps={{
                                    htmlInput: {
                                      min: 0,
                                      step: 100,
                                    },
                                  }}
                                />
                              </TableCell>

                              <TableCell align="right">
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                  }}
                                >
                                  {formatCurrency(calculateRowSubtotal(row))}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <IconButton
                                  color="error"
                                  disabled={formItems.length === 1}
                                  onClick={() => removeItemRow(index)}
                                >
                                  <DeleteOutlined />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* TOTAL */}
                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: "1px solid rgba(255,255,255,.07)",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: {
                          xs: "100%",
                          sm: 320,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.7,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,.50)",
                          }}
                        >
                          Total Qty
                        </Typography>

                        <Typography
                          sx={{
                            fontWeight: 700,
                          }}
                        >
                          {totalQuantity}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                          }}
                        >
                          Total Pembelian
                        </Typography>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            color: "#00e676",
                          }}
                        >
                          {formatCurrency(grandTotal)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* NOTES */}
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Catatan"
                placeholder="Contoh: Pembelian perangkat untuk stok bulan September..."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                sx={{
                  mt: 2,
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <Button
            onClick={closeCreateDialog}
            disabled={saving}
            sx={{
              textTransform: "none",
              color: "rgba(255,255,255,.65)",
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveOutlined />
              )
            }
            onClick={handleSubmit}
            disabled={saving || loadingFormData}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog
        open={Boolean(detailTransaction)}
        onClose={() => setDetailTransaction(null)}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              background: "#0b1220",
              backgroundImage: "none",
              border: "1px solid rgba(255,255,255,.08)",
            },
          },
        }}
      >
        {detailTransaction && (
          <>
            <DialogTitle>
              <Typography
                component="span"
                variant="h6"
                sx={{
                  fontWeight: 800,
                }}
              >
                Detail Barang Masuk
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#00e676",
                  mt: 0.5,
                  fontWeight: 700,
                }}
              >
                {detailTransaction.transactionCode}
              </Typography>
            </DialogTitle>

            <DialogContent>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,.40)",
                    }}
                  >
                    Supplier
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {detailTransaction.supplier.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,.40)",
                    }}
                  >
                    Tanggal
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {formatDate(detailTransaction.transactionDate)}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,.40)",
                    }}
                  >
                    Petugas
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {detailTransaction.receivedBy.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,.40)",
                    }}
                  >
                    Total
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "#00e676",
                    }}
                  >
                    {formatCurrency(detailTransaction.totalAmount)}
                  </Typography>
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Barang</TableCell>

                      <TableCell align="right">Qty</TableCell>

                      <TableCell align="right">Harga</TableCell>

                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {detailTransaction.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {item.item.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              color: "rgba(255,255,255,.40)",
                            }}
                          >
                            {item.item.code}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          {item.quantity} {item.item.unit}
                        </TableCell>

                        <TableCell align="right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>

                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            {formatCurrency(item.subtotal)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {detailTransaction.notes && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    background: "rgba(255,255,255,.035)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,.40)",
                    }}
                  >
                    Catatan
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    {detailTransaction.notes}
                  </Typography>
                </Box>
              )}
            </DialogContent>

            <DialogActions
              sx={{
                px: 3,
                py: 2,
              }}
            >
              <Button
                onClick={() => setDetailTransaction(null)}
                sx={{
                  textTransform: "none",
                }}
              >
                Tutup
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        message={success}
      />
    </Box>
  );
}
