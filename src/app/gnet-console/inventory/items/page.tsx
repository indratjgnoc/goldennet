"use client";

import {
  AddRounded,
  CloseRounded,
  DeleteOutlineRounded,
  EditRounded,
  Inventory2Outlined,
  SearchRounded,
  VisibilityOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";

type Unit = "PCS" | "UNIT" | "METER" | "BOX" | "ROLL" | "SET" | "PACK";

type Category = {
  id: number;
  name: string;
};

type Item = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  categoryId: number;
  category: Category;
  unit: Unit;
  stock: number;
  minimumStock: number;
  purchasePrice: number;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormData = {
  code: string;
  name: string;
  description: string;
  categoryId: string;
  unit: Unit;
  minimumStock: string;
  purchasePrice: string;
  location: string;
  isActive: boolean;
};

const emptyForm: FormData = {
  code: "",
  name: "",
  description: "",
  categoryId: "",
  unit: "PCS",
  minimumStock: "0",
  purchasePrice: "0",
  location: "",
  isActive: true,
};

const unitLabels: Record<Unit, string> = {
  PCS: "PCS",
  UNIT: "Unit",
  METER: "Meter",
  BOX: "Box",
  ROLL: "Roll",
  SET: "Set",
  PACK: "Pack",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}

function getStockStatus(item: Item) {
  if (item.stock <= 0) {
    return {
      label: "Habis",
      color: "#ef4444",
      background: "rgba(239,68,68,0.08)",
    };
  }

  if (item.stock <= item.minimumStock) {
    return {
      label: "Minimum",
      color: "#fbbf24",
      background: "rgba(251,191,36,0.08)",
    };
  }

  return {
    label: "Aman",
    color: "#00e676",
    background: "rgba(0,230,118,0.08)",
  };
}

export default function InventoryItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    async function loadItems() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/inventory/items", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil data barang.");
        }

        setItems(result.data ?? []);
        setCategories(result.categories ?? []);
      } catch (error) {
        console.error("LOAD INVENTORY ITEMS ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data barang.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.code.toLowerCase().includes(keyword) ||
        item.name.toLowerCase().includes(keyword) ||
        item.category.name.toLowerCase().includes(keyword) ||
        (item.location ?? "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);

      const matchesCategory =
        categoryFilter === "all" || String(item.categoryId) === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, search, statusFilter, categoryFilter]);

  const activeCount = items.filter((item) => item.isActive).length;

  const inactiveCount = items.filter((item) => !item.isActive).length;

  const lowStockCount = items.filter(
    (item) => item.isActive && item.stock <= item.minimumStock,
  ).length;

  function openCreateDialog() {
    setEditingItem(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setDialogOpen(true);
  }

  function openEditDialog(item: Item) {
    setEditingItem(item);

    setForm({
      code: item.code,
      name: item.name,
      description: item.description ?? "",
      categoryId: String(item.categoryId),
      unit: item.unit,
      minimumStock: String(item.minimumStock),
      purchasePrice: String(item.purchasePrice),
      location: item.location ?? "",
      isActive: item.isActive,
    });

    setError("");
    setSuccess("");
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;

    setDialogOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  function openDetailDialog(item: Item) {
    setSelectedItem(item);
    setDetailOpen(true);
  }

  function openDeleteDialog(item: Item) {
    setSelectedItem(item);
    setDeleteOpen(true);
  }

  function handleChange(field: keyof FormData, value: string | boolean) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit() {
    if (!form.code.trim()) {
      setError("Kode barang wajib diisi.");
      return;
    }

    if (!form.name.trim()) {
      setError("Nama barang wajib diisi.");
      return;
    }

    if (!form.categoryId) {
      setError("Kategori barang wajib dipilih.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        code: form.code,
        name: form.name,
        description: form.description,
        categoryId: Number(form.categoryId),
        unit: form.unit,
        minimumStock: Number(form.minimumStock),
        purchasePrice: Number(form.purchasePrice),
        location: form.location,
        isActive: form.isActive,
      };

      const url = editingItem
        ? `/api/inventory/items/${editingItem.id}`
        : "/api/inventory/items";

      const method = editingItem ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan barang.");
      }

      setSuccess(
        editingItem
          ? "Barang berhasil diperbarui."
          : "Barang berhasil ditambahkan.",
      );

      setDialogOpen(false);
      setEditingItem(null);
      setForm(emptyForm);

      await refreshItems();
    } catch (error) {
      console.error("SAVE INVENTORY ITEM ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Gagal menyimpan barang.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function refreshItems() {
    try {
      const response = await fetch("/api/inventory/items", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memperbarui data.");
      }

      setItems(result.data ?? []);
      setCategories(result.categories ?? []);
    } catch (error) {
      console.error("REFRESH INVENTORY ITEMS ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Gagal memperbarui data.",
      );
    }
  }

  async function handleDelete() {
    if (!selectedItem) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/inventory/items/${selectedItem.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menonaktifkan barang.");
      }

      setSuccess("Barang berhasil dinonaktifkan.");

      setDeleteOpen(false);
      setSelectedItem(null);

      await refreshItems();
    } catch (error) {
      console.error("DELETE INVENTORY ITEM ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Gagal menonaktifkan barang.",
      );
    } finally {
      setSaving(false);
    }
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
      <Box
        sx={{
          width: "100%",
          maxWidth: 1500,
          mx: "auto",
          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
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
                mb: 1,
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
                  color: "#00e676",
                  background: "rgba(0,230,118,0.08)",
                  border: "1px solid rgba(0,230,118,0.16)",
                }}
              >
                <Inventory2Outlined />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: 24,
                      md: 29,
                    },
                    fontWeight: 800,
                  }}
                >
                  Barang
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Master Inventory
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.48)",
                fontSize: 14,
              }}
            >
              Kelola perangkat WiFi dan material instalasi Golden Net.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={openCreateDialog}
            sx={{
              borderRadius: 2.5,
              px: 2.5,
              py: 1.2,
              textTransform: "none",
              fontWeight: 800,
              background: "linear-gradient(135deg, #00e676, #00b85c)",
              color: "#001b0d",
              boxShadow: "0 10px 30px rgba(0,230,118,0.10)",
              "&:hover": {
                background: "linear-gradient(135deg, #19ff88, #00d96b)",
              },
            }}
          >
            Tambah Barang
          </Button>
        </Box>

        {/* ALERT */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2.5,
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess("")}
            sx={{
              mb: 2,
              borderRadius: 2.5,
            }}
          >
            {success}
          </Alert>
        )}

        {/* STATS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {[
            {
              label: "Total Barang",
              value: items.length,
              color: "#00e676",
            },
            {
              label: "Barang Aktif",
              value: activeCount,
              color: "#00e676",
            },
            {
              label: "Stok Menipis",
              value: lowStockCount,
              color: "#fbbf24",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              sx={{
                borderRadius: 3,
                background:
                  "linear-gradient(145deg, rgba(15,23,42,0.72), rgba(2,6,23,0.82))",
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
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.45)",
                    fontSize: 12,
                    mb: 1,
                  }}
                >
                  {stat.label}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* FILTER */}
        <Card
          sx={{
            mb: 2,
            borderRadius: 3,
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.72), rgba(2,6,23,0.82))",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <CardContent
            sx={{
              p: 2,
              "&:last-child": {
                pb: 2,
              },
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "2fr 1fr 1fr",
                },
                gap: 1.5,
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Cari kode, nama, kategori, lokasi..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchRounded
                        sx={{
                          mr: 1,
                          color: "rgba(255,255,255,0.35)",
                        }}
                      />
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    color: "#fff",
                    background: "rgba(255,255,255,0.025)",
                  },
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.08)",
                  },
                }}
              />

              <FormControl size="small" fullWidth>
                <InputLabel
                  sx={{
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Status
                </InputLabel>

                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(event) => setStatusFilter(event.target.value)}
                  sx={{
                    color: "#fff",
                    borderRadius: 2.5,
                    background: "rgba(255,255,255,0.025)",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  <MenuItem value="all">Semua Status</MenuItem>
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="inactive">Nonaktif</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel
                  sx={{
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Kategori
                </InputLabel>

                <Select
                  value={categoryFilter}
                  label="Kategori"
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  sx={{
                    color: "#fff",
                    borderRadius: 2.5,
                    background: "rgba(255,255,255,0.025)",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  <MenuItem value="all">Semua Kategori</MenuItem>

                  {categories.map((category) => (
                    <MenuItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.72), rgba(2,6,23,0.82))",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                Daftar Barang
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.38)",
                  mt: 0.3,
                }}
              >
                {filteredItems.length} data ditampilkan
              </Typography>
            </Box>

            <Chip
              label={`${inactiveCount} nonaktif`}
              size="small"
              sx={{
                color: "rgba(255,255,255,0.45)",
                background: "rgba(255,255,255,0.04)",
              }}
            />
          </Box>

          {loading ? (
            <Box
              sx={{
                minHeight: 350,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress
                size={32}
                sx={{
                  color: "#00e676",
                }}
              />
            </Box>
          ) : filteredItems.length === 0 ? (
            <Box
              sx={{
                minHeight: 350,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 3,
              }}
            >
              <Inventory2Outlined
                sx={{
                  fontSize: 52,
                  color: "rgba(255,255,255,0.12)",
                  mb: 2,
                }}
              />

              <Typography
                sx={{
                  fontWeight: 800,
                  mb: 0.5,
                }}
              >
                Belum ada barang
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.38)",
                  fontSize: 13,
                  mb: 2,
                }}
              >
                Tambahkan perangkat atau material pertama.
              </Typography>

              <Button
                variant="outlined"
                startIcon={<AddRounded />}
                onClick={openCreateDialog}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  color: "#00e676",
                  borderColor: "rgba(0,230,118,0.25)",
                }}
              >
                Tambah Barang
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                overflowX: "auto",
              }}
            >
              <Box
                component="table"
                sx={{
                  width: "100%",
                  minWidth: 1050,
                  borderCollapse: "collapse",

                  "& th": {
                    px: 2.5,
                    py: 1.8,
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.35)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    whiteSpace: "nowrap",
                  },

                  "& td": {
                    px: 2.5,
                    py: 2,
                    borderBottom: "1px solid rgba(255,255,255,0.045)",
                    verticalAlign: "middle",
                  },

                  "& tbody tr:hover": {
                    background: "rgba(255,255,255,0.02)",
                  },
                }}
              >
                <thead>
                  <tr>
                    <th>Barang</th>
                    <th>Kategori</th>
                    <th>Stok</th>
                    <th>Minimum</th>
                    <th>Harga Beli</th>
                    <th>Lokasi</th>
                    <th>Status</th>
                    <th align="right">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item);

                    return (
                      <tr key={item.id}>
                        <td>
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
                                color: "#00e676",
                                background: "rgba(0,230,118,0.07)",
                                border: "1px solid rgba(0,230,118,0.10)",
                                flexShrink: 0,
                              }}
                            >
                              <Inventory2Outlined />
                            </Box>

                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: 13,
                                }}
                              >
                                {item.name}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 11,
                                  color: "rgba(255,255,255,0.38)",
                                  mt: 0.3,
                                }}
                              >
                                {item.code}
                              </Typography>
                            </Box>
                          </Box>
                        </td>

                        <td>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: "rgba(255,255,255,0.62)",
                            }}
                          >
                            {item.category.name}
                          </Typography>
                        </td>

                        <td>
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: 14,
                                color: stockStatus.color,
                              }}
                            >
                              {formatNumber(item.stock)}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.30)",
                              }}
                            >
                              {unitLabels[item.unit]}
                            </Typography>
                          </Box>
                        </td>

                        <td>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: "rgba(255,255,255,0.55)",
                            }}
                          >
                            {formatNumber(item.minimumStock)}
                          </Typography>
                        </td>

                        <td>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.55)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatRupiah(item.purchasePrice)}
                          </Typography>
                        </td>

                        <td>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.45)",
                            }}
                          >
                            {item.location || "-"}
                          </Typography>
                        </td>

                        <td>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.5,
                            }}
                          >
                            <Chip
                              label={item.isActive ? "Aktif" : "Nonaktif"}
                              size="small"
                              sx={{
                                width: "fit-content",
                                color: item.isActive ? "#00e676" : "#94a3b8",
                                background: item.isActive
                                  ? "rgba(0,230,118,0.08)"
                                  : "rgba(148,163,184,0.08)",
                                border: `1px solid ${
                                  item.isActive
                                    ? "rgba(0,230,118,0.14)"
                                    : "rgba(148,163,184,0.12)"
                                }`,
                                fontWeight: 700,
                              }}
                            />

                            {item.isActive && (
                              <Chip
                                label={stockStatus.label}
                                size="small"
                                sx={{
                                  width: "fit-content",
                                  color: stockStatus.color,
                                  background: stockStatus.background,
                                  fontSize: 10,
                                }}
                              />
                            )}
                          </Box>
                        </td>

                        <td>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 0.5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => openDetailDialog(item)}
                              sx={{
                                color: "rgba(255,255,255,0.45)",
                                "&:hover": {
                                  color: "#00e676",
                                  background: "rgba(0,230,118,0.07)",
                                },
                              }}
                            >
                              <VisibilityOutlined fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(item)}
                              sx={{
                                color: "rgba(255,255,255,0.45)",
                                "&:hover": {
                                  color: "#00e676",
                                  background: "rgba(0,230,118,0.07)",
                                },
                              }}
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>

                            {item.isActive && (
                              <IconButton
                                size="small"
                                onClick={() => openDeleteDialog(item)}
                                sx={{
                                  color: "rgba(255,255,255,0.35)",
                                  "&:hover": {
                                    color: "#ef4444",
                                    background: "rgba(239,68,68,0.07)",
                                  },
                                }}
                              >
                                <DeleteOutlineRounded fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Box>
            </Box>
          )}
        </Card>
      </Box>

      {/* ==========================================
          CREATE / EDIT DIALOG
          ========================================== */}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              background: "linear-gradient(145deg, #0f172a, #020617)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            fontWeight: 800,
          }}
        >
          {editingItem ? "Edit Barang" : "Tambah Barang"}

          <IconButton
            onClick={closeDialog}
            disabled={saving}
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            <CloseRounded />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="Kode Barang"
              value={form.code}
              disabled={saving}
              onChange={(event) =>
                handleChange("code", event.target.value.toUpperCase())
              }
              placeholder="ONT-001"
              sx={{
                "& .MuiInputBase-root": {
                  color: "#fff",
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.45)",
                },
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.10)",
                },
              }}
            />

            <TextField
              label="Nama Barang"
              value={form.name}
              disabled={saving}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="ONT Huawei"
              sx={{
                "& .MuiInputBase-root": {
                  color: "#fff",
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.45)",
                },
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.10)",
                },
              }}
            />

            <FormControl fullWidth disabled={saving}>
              <InputLabel
                sx={{
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Kategori
              </InputLabel>

              <Select
                value={form.categoryId}
                label="Kategori"
                onChange={(event) =>
                  handleChange("categoryId", event.target.value)
                }
                sx={{
                  color: "#fff",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.10)",
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={saving}>
              <InputLabel
                sx={{
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Satuan
              </InputLabel>

              <Select
                value={form.unit}
                label="Satuan"
                onChange={(event) =>
                  handleChange("unit", event.target.value as Unit)
                }
                sx={{
                  color: "#fff",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.10)",
                  },
                }}
              >
                {Object.entries(unitLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Minimum Stok"
              type="number"
              value={form.minimumStock}
              disabled={saving}
              onChange={(event) =>
                handleChange("minimumStock", event.target.value)
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              sx={{
                "& .MuiInputBase-root": {
                  color: "#fff",
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.45)",
                },
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.10)",
                },
              }}
            />

            <TextField
              label="Harga Beli"
              type="number"
              value={form.purchasePrice}
              disabled={saving}
              onChange={(event) =>
                handleChange("purchasePrice", event.target.value)
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              sx={{
                "& .MuiInputBase-root": {
                  color: "#fff",
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.45)",
                },
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.10)",
                },
              }}
            />

            <TextField
              label="Lokasi Penyimpanan"
              value={form.location}
              disabled={saving}
              onChange={(event) => handleChange("location", event.target.value)}
              placeholder="Rak A-01"
              sx={{
                "& .MuiInputBase-root": {
                  color: "#fff",
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.45)",
                },
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.10)",
                },
              }}
            />

            <TextField
              label="Deskripsi"
              value={form.description}
              disabled={saving}
              multiline
              minRows={3}
              onChange={(event) =>
                handleChange("description", event.target.value)
              }
              sx={{
                gridColumn: {
                  xs: "auto",
                  sm: "1 / -1",
                },
                "& .MuiInputBase-root": {
                  color: "#fff",
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.45)",
                },
                "& fieldset": {
                  borderColor: "rgba(255,255,255,0.10)",
                },
              }}
            />
          </Box>

          {editingItem && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.38)",
                }}
              >
                Stok saat ini:{" "}
                <Box
                  component="span"
                  sx={{
                    color: "#00e676",
                    fontWeight: 800,
                  }}
                >
                  {formatNumber(editingItem.stock)}{" "}
                  {unitLabels[editingItem.unit]}
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.28)",
                }}
              >
                Stok tidak dapat diedit dari master barang. Perubahan stok
                dilakukan melalui transaksi Barang Masuk dan Barang Keluar.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            gap: 1,
          }}
        >
          <Button
            onClick={closeDialog}
            disabled={saving}
            sx={{
              color: "rgba(255,255,255,0.45)",
              textTransform: "none",
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={16}
                  sx={{
                    color: "#001b0d",
                  }}
                />
              ) : (
                <EditRounded />
              )
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              background: "linear-gradient(135deg, #00e676, #00b85c)",
              color: "#001b0d",
            }}
          >
            {saving
              ? "Menyimpan..."
              : editingItem
                ? "Simpan Perubahan"
                : "Tambah Barang"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==========================================
          DETAIL DIALOG
          ========================================== */}

      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              background: "linear-gradient(145deg, #0f172a, #020617)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Detail Barang
        </DialogTitle>

        <DialogContent>
          {selectedItem && (
            <Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  background: "rgba(0,230,118,0.04)",
                  border: "1px solid rgba(0,230,118,0.10)",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  {selectedItem.name}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.38)",
                  }}
                >
                  {selectedItem.code}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1,
                }}
              >
                {[
                  ["Kategori", selectedItem.category.name],
                  ["Satuan", unitLabels[selectedItem.unit]],
                  [
                    "Stok",
                    `${formatNumber(selectedItem.stock)} ${
                      unitLabels[selectedItem.unit]
                    }`,
                  ],
                  [
                    "Minimum",
                    `${formatNumber(selectedItem.minimumStock)} ${
                      unitLabels[selectedItem.unit]
                    }`,
                  ],
                  ["Harga Beli", formatRupiah(selectedItem.purchasePrice)],
                  ["Lokasi", selectedItem.location || "-"],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.025)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.30)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        mb: 0.5,
                      }}
                    >
                      {label}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {selectedItem.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.30)",
                      mb: 0.5,
                    }}
                  >
                    DESKRIPSI
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.60)",
                      lineHeight: 1.6,
                    }}
                  >
                    {selectedItem.description}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={() => setDetailOpen(false)}
            sx={{
              color: "rgba(255,255,255,0.50)",
              textTransform: "none",
            }}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==========================================
          DELETE / DEACTIVATE CONFIRMATION
          ========================================== */}

      <Dialog
        open={deleteOpen}
        onClose={() => (saving ? undefined : setDeleteOpen(false))}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              background: "linear-gradient(145deg, #0f172a, #020617)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Nonaktifkan Barang?
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Barang{" "}
            <Box
              component="span"
              sx={{
                color: "#fff",
                fontWeight: 800,
              }}
            >
              {selectedItem?.name}
            </Box>{" "}
            akan dinonaktifkan.
            <br />
            Histori transaksi tetap aman dan barang tidak akan dihapus dari
            database.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            gap: 1,
          }}
        >
          <Button
            onClick={() => setDeleteOpen(false)}
            disabled={saving}
            sx={{
              color: "rgba(255,255,255,0.50)",
              textTransform: "none",
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={saving}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              background: "#ef4444",
              "&:hover": {
                background: "#dc2626",
              },
            }}
          >
            {saving ? "Memproses..." : "Nonaktifkan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
