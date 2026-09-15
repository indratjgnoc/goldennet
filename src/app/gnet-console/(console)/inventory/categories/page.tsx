"use client";

import {
  AddOutlined,
  CategoryOutlined,
  DeleteOutlined,
  EditOutlined,
  RefreshOutlined,
  SearchOutlined,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
};

type CategoryResponse = {
  success: boolean;
  message?: string;
  data?: Category[];
};

type FormData = {
  name: string;
  description: string;
  isActive: boolean;
};

const initialForm: FormData = {
  name: "",
  description: "",
  isActive: true,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [form, setForm] = useState<FormData>(initialForm);
  const [formError, setFormError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/inventory/categories", {
        method: "GET",
        cache: "no-store",
      });

      const result: CategoryResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data kategori.");
      }

      setCategories(result.data ?? []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Gagal mengambil data kategori.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchInitialCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/inventory/categories", {
          cache: "no-store",
        });

        const result = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(result.message || "Gagal mengambil data kategori.");
        }

        setCategories(result.data ?? []);
      } catch (error) {
        if (cancelled) return;

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data kategori.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchInitialCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(keyword) ||
        category.description?.toLowerCase().includes(keyword)
      );
    });
  }, [categories, search]);

  const activeCount = categories.filter((category) => category.isActive).length;

  const inactiveCount = categories.filter(
    (category) => !category.isActive,
  ).length;

  const openCreateDialog = () => {
    setEditingCategory(null);
    setForm(initialForm);
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);

    setForm({
      name: category.name,
      description: category.description ?? "",
      isActive: category.isActive,
    });

    setFormError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingCategory(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setFormError("Nama kategori wajib diisi.");
      return;
    }

    if (name.length < 2) {
      setFormError("Nama kategori minimal 2 karakter.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      setError("");
      setSuccess("");

      const url = editingCategory
        ? `/api/inventory/categories/${editingCategory.id}`
        : "/api/inventory/categories";

      const method = editingCategory ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || null,
          isActive: form.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            (editingCategory
              ? "Gagal memperbarui kategori."
              : "Gagal membuat kategori."),
        );
      }

      setDialogOpen(false);
      setEditingCategory(null);
      setForm(initialForm);

      setSuccess(
        editingCategory
          ? "Kategori berhasil diperbarui."
          : "Kategori berhasil ditambahkan.",
      );

      await loadCategories();
    } catch (err) {
      console.error(err);

      setFormError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan kategori.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) return;

    setDeleteDialogOpen(false);
    setDeletingCategory(null);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/inventory/categories/${deletingCategory.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus kategori.");
      }

      setDeleteDialogOpen(false);
      setDeletingCategory(null);

      setSuccess("Kategori berhasil dihapus.");

      await loadCategories();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Gagal menghapus kategori.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(0,230,118,0.08), transparent 30%), #020617",
        color: "#fff",
        py: { xs: 3, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
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
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,230,118,.08)",
                  color: "#00e676",
                }}
              >
                <CategoryOutlined />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: 25, md: 30 },
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Kategori
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,.42)",
                    fontSize: 13,
                    mt: 0.3,
                  }}
                >
                  Kelola kategori perangkat dan material inventory.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
            }}
          >
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
                flex: { xs: 1, sm: "initial" },
                borderColor: "rgba(255,255,255,.12)",
                color: "rgba(255,255,255,.75)",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                "&:hover": {
                  borderColor: "rgba(0,230,118,.35)",
                  color: "#00e676",
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
                flex: { xs: 1, sm: "initial" },
                background: "#00e676",
                color: "#001b0d",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 800,
                boxShadow: "0 8px 25px rgba(0,230,118,.12)",
                "&:hover": {
                  background: "#00c968",
                },
              }}
            >
              Tambah Kategori
            </Button>
          </Box>
        </Box>

        {/* ALERT */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              mb: 2,
              background: "rgba(211,47,47,.10)",
              color: "#fff",
              border: "1px solid rgba(211,47,47,.25)",
              "& .MuiAlert-icon": {
                color: "#ff5252",
              },
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
              background: "rgba(0,230,118,.07)",
              color: "#fff",
              border: "1px solid rgba(0,230,118,.18)",
              "& .MuiAlert-icon": {
                color: "#00e676",
              },
            }}
          >
            {success}
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
          <SummaryCard
            title="Total Kategori"
            value={categories.length}
            icon={<CategoryOutlined />}
          />

          <SummaryCard
            title="Kategori Aktif"
            value={activeCount}
            icon={<CategoryOutlined />}
            accent="#00e676"
          />

          <SummaryCard
            title="Tidak Aktif"
            value={inactiveCount}
            icon={<CategoryOutlined />}
            accent="#ff9800"
          />
        </Box>

        {/* TABLE CARD */}
        <Card
          sx={{
            background:
              "linear-gradient(145deg, rgba(15,23,42,.94), rgba(2,6,23,.98))",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            {/* TOOLBAR */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "stretch", md: "center" },
                gap: 2,
                mb: 2.5,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  Daftar Kategori
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,.35)",
                    fontSize: 11.5,
                    mt: 0.4,
                  }}
                >
                  {filteredCategories.length} kategori ditampilkan
                </Typography>
              </Box>

              <TextField
                size="small"
                placeholder="Cari kategori..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{
                  width: { xs: "100%", md: 300 },
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    borderRadius: 2,
                    background: "rgba(255,255,255,.025)",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,.09)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(0,230,118,.25)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#00e676",
                    },
                  },
                  "& input::placeholder": {
                    color: "rgba(255,255,255,.28)",
                    opacity: 1,
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined
                          sx={{
                            color: "rgba(255,255,255,.3)",
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {/* LOADING */}
            {loading ? (
              <Box
                sx={{
                  minHeight: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress sx={{ color: "#00e676" }} />
              </Box>
            ) : filteredCategories.length === 0 ? (
              /* EMPTY */
              <Box
                sx={{
                  minHeight: 300,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  px: 2,
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,230,118,.07)",
                    color: "#00e676",
                    mb: 2,
                  }}
                >
                  <CategoryOutlined sx={{ fontSize: 30 }} />
                </Box>

                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  {search ? "Kategori tidak ditemukan" : "Belum ada kategori"}
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,.35)",
                    fontSize: 12,
                    mt: 0.7,
                    maxWidth: 400,
                  }}
                >
                  {search
                    ? "Coba gunakan kata kunci pencarian yang berbeda."
                    : "Tambahkan kategori pertama untuk mulai mengelola inventory."}
                </Typography>

                {!search && (
                  <Button
                    variant="contained"
                    startIcon={<AddOutlined />}
                    onClick={openCreateDialog}
                    sx={{
                      mt: 2,
                      background: "#00e676",
                      color: "#001b0d",
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 800,
                      "&:hover": {
                        background: "#00c968",
                      },
                    }}
                  >
                    Tambah Kategori
                  </Button>
                )}
              </Box>
            ) : (
              /* CATEGORY LIST */
              <Box>
                {/* DESKTOP HEADER */}
                <Box
                  sx={{
                    display: { xs: "none", md: "grid" },
                    gridTemplateColumns: "1.2fr 2fr .7fr .8fr 110px",
                    gap: 2,
                    px: 2,
                    py: 1.3,
                    borderRadius: 2,
                    background: "rgba(255,255,255,.025)",
                    color: "rgba(255,255,255,.32)",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                  }}
                >
                  <Box>Nama Kategori</Box>
                  <Box>Deskripsi</Box>
                  <Box>Barang</Box>
                  <Box>Status</Box>
                  <Box sx={{ textAlign: "right" }}>Aksi</Box>
                </Box>

                {filteredCategories.map((category) => (
                  <Box
                    key={category.id}
                    sx={{
                      display: {
                        xs: "block",
                        md: "grid",
                      },
                      gridTemplateColumns: "1.2fr 2fr .7fr .8fr 110px",
                      gap: 2,
                      alignItems: "center",
                      px: 2,
                      py: 2,
                      mt: 1,
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,.055)",
                      background: "rgba(255,255,255,.012)",
                      transition: "all .2s ease",
                      "&:hover": {
                        background: "rgba(0,230,118,.025)",
                        borderColor: "rgba(0,230,118,.14)",
                      },
                    }}
                  >
                    {/* NAME */}
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 750,
                        }}
                      >
                        {category.name}
                      </Typography>

                      <Typography
                        sx={{
                          display: { xs: "block", md: "none" },
                          color: "rgba(255,255,255,.28)",
                          fontSize: 10,
                          mt: 0.4,
                        }}
                      >
                        ID #{category.id}
                      </Typography>
                    </Box>

                    {/* DESCRIPTION */}
                    <Typography
                      sx={{
                        color: category.description
                          ? "rgba(255,255,255,.45)"
                          : "rgba(255,255,255,.22)",
                        fontSize: 11.5,
                        lineHeight: 1.5,
                        mt: { xs: 1.5, md: 0 },
                      }}
                    >
                      {category.description || "Tidak ada deskripsi"}
                    </Typography>

                    {/* ITEM COUNT */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        mt: { xs: 1.5, md: 0 },
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#00e676",
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        {category._count?.items ?? 0}
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(255,255,255,.3)",
                          fontSize: 10,
                        }}
                      >
                        barang
                      </Typography>
                    </Box>

                    {/* STATUS */}
                    <Box sx={{ mt: { xs: 1.5, md: 0 } }}>
                      <Chip
                        label={category.isActive ? "Aktif" : "Tidak Aktif"}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: 10,
                          fontWeight: 700,
                          background: category.isActive
                            ? "rgba(0,230,118,.08)"
                            : "rgba(255,152,0,.08)",
                          color: category.isActive ? "#00e676" : "#ff9800",
                          border: category.isActive
                            ? "1px solid rgba(0,230,118,.12)"
                            : "1px solid rgba(255,152,0,.12)",
                        }}
                      />
                    </Box>

                    {/* ACTION */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: {
                          xs: "flex-start",
                          md: "flex-end",
                        },
                        gap: 0.5,
                        mt: { xs: 1.5, md: 0 },
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(category)}
                        sx={{
                          width: 32,
                          height: 32,
                          color: "#64b5f6",
                          background: "rgba(33,150,243,.06)",
                          "&:hover": {
                            background: "rgba(33,150,243,.13)",
                          },
                        }}
                      >
                        <EditOutlined sx={{ fontSize: 17 }} />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => openDeleteDialog(category)}
                        sx={{
                          width: 32,
                          height: 32,
                          color: "#ff5252",
                          background: "rgba(255,82,82,.06)",
                          "&:hover": {
                            background: "rgba(255,82,82,.13)",
                          },
                        }}
                      >
                        <DeleteOutlined sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* CREATE / EDIT DIALOG */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              background: "#020617",
              border: "1px solid rgba(0,230,118,.15)",
              borderRadius: 3,
              color: "#fff",
              backgroundImage: "none",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: 19,
            pb: 1,
          }}
        >
          {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: "rgba(255,255,255,.38)",
              fontSize: 12,
              mb: 2.5,
            }}
          >
            {editingCategory
              ? "Perbarui informasi kategori inventory."
              : "Tambahkan kategori baru untuk perangkat atau material."}
          </Typography>

          {formError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                background: "rgba(211,47,47,.10)",
                color: "#fff",
                border: "1px solid rgba(211,47,47,.20)",
                "& .MuiAlert-icon": {
                  color: "#ff5252",
                },
              }}
            >
              {formError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Nama Kategori"
            placeholder="Contoh: Perangkat Jaringan"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            autoFocus
            disabled={saving}
            sx={dialogFieldSx}
          />

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Deskripsi"
            placeholder="Jelaskan isi atau penggunaan kategori..."
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            disabled={saving}
            sx={{
              ...dialogFieldSx,
              mt: 2,
            }}
          />

          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,.06)",
              background: "rgba(255,255,255,.02)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Status Kategori
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,.32)",
                    fontSize: 10.5,
                    mt: 0.4,
                  }}
                >
                  Kategori aktif akan tersedia saat menambah barang.
                </Typography>
              </Box>

              <Button
                size="small"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    isActive: !current.isActive,
                  }))
                }
                disabled={saving}
                sx={{
                  minWidth: 76,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 800,
                  background: form.isActive
                    ? "rgba(0,230,118,.10)"
                    : "rgba(255,152,0,.10)",
                  color: form.isActive ? "#00e676" : "#ff9800",
                  "&:hover": {
                    background: form.isActive
                      ? "rgba(0,230,118,.16)"
                      : "rgba(255,152,0,.16)",
                  },
                }}
              >
                {form.isActive ? "Aktif" : "Tidak Aktif"}
              </Button>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            gap: 1,
          }}
        >
          <Button
            onClick={closeDialog}
            disabled={saving}
            sx={{
              color: "rgba(255,255,255,.55)",
              textTransform: "none",
              fontWeight: 700,
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
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CategoryOutlined />
              )
            }
            sx={{
              background: "#00e676",
              color: "#001b0d",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              minWidth: 130,
              "&:hover": {
                background: "#00c968",
              },
            }}
          >
            {saving
              ? "Menyimpan..."
              : editingCategory
                ? "Simpan Perubahan"
                : "Tambah Kategori"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              background: "#020617",
              border: "1px solid rgba(0,230,118,.15)",
              borderRadius: 3,
              color: "#fff",
              backgroundImage: "none",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Hapus Kategori?
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: "rgba(255,255,255,.48)",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            Kategori{" "}
            <Box
              component="span"
              sx={{
                color: "#fff",
                fontWeight: 800,
              }}
            >
              {deletingCategory?.name}
            </Box>{" "}
            akan dihapus.
          </Typography>

          {deletingCategory?._count?.items ? (
            <Alert
              severity="warning"
              sx={{
                mt: 2,
                background: "rgba(255,193,7,.08)",
                color: "#fff",
                border: "1px solid rgba(255,193,7,.15)",
                "& .MuiAlert-icon": {
                  color: "#ffc107",
                },
              }}
            >
              Kategori ini masih digunakan oleh {deletingCategory._count.items}{" "}
              barang. API akan menentukan apakah kategori dapat dihapus.
            </Alert>
          ) : (
            <Typography
              sx={{
                color: "rgba(255,255,255,.28)",
                fontSize: 11,
                mt: 1.5,
              }}
            >
              Pastikan kategori ini memang tidak diperlukan lagi.
            </Typography>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            gap: 1,
          }}
        >
          <Button
            onClick={closeDeleteDialog}
            disabled={deleting}
            sx={{
              color: "rgba(255,255,255,.55)",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteOutlined />
              )
            }
            sx={{
              background: "#ff5252",
              color: "#fff",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              "&:hover": {
                background: "#e53935",
              },
            }}
          >
            {deleting ? "Menghapus..." : "Hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  accent = "#00e676",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card
      sx={{
        background:
          "linear-gradient(145deg, rgba(15,23,42,.92), rgba(2,6,23,.96))",
        border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 2.2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "rgba(255,255,255,.38)",
                fontSize: 10.5,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".07em",
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontSize: 27,
                fontWeight: 800,
                mt: 0.7,
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accent,
              background: `${accent}12`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

const dialogFieldSx = {
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,.42)",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#00e676",
  },

  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: 2,
    background: "rgba(255,255,255,.025)",

    "& fieldset": {
      borderColor: "rgba(255,255,255,.10)",
    },

    "&:hover fieldset": {
      borderColor: "rgba(0,230,118,.28)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#00e676",
    },
  },

  "& input::placeholder, & textarea::placeholder": {
    color: "rgba(255,255,255,.22)",
    opacity: 1,
  },
};
