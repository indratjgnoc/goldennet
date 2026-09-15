"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  Business,
  DeleteOutlined,
  EditOutlined,
  EmailOutlined,
  Inventory2Outlined,
  LocalPhoneOutlined,
  Refresh,
  Search,
  VisibilityOutlined,
} from "@mui/icons-material";

type Supplier = {
  id: number;
  name: string;
  code: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  contactName: string | null;
  isActive: boolean;
  stockInCount: number;
  createdAt: string;
  updatedAt: string;
};

type SupplierStats = {
  total: number;
  active: number;
  inactive: number;
};

type SupplierForm = {
  name: string;
  code: string;
  phone: string;
  email: string;
  address: string;
  contactName: string;
  isActive: boolean;
};

const initialForm: SupplierForm = {
  name: "",
  code: "",
  phone: "",
  email: "",
  address: "",
  contactName: "",
  isActive: true,
};

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<SupplierStats>({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const [form, setForm] = useState<SupplierForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showMessage = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status !== "all") {
        params.set("status", status);
      }

      const response = await fetch(
        `/api/inventory/suppliers?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data supplier");
      }

      setSuppliers(result.data || []);
      setStats(
        result.stats || {
          total: 0,
          active: 0,
          inactive: 0,
        },
      );
    } catch (error) {
      console.error(error);

      showMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data supplier",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuppliers();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchSuppliers]);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(initialForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = async (supplier: Supplier) => {
    try {
      setEditingId(supplier.id);
      setErrors({});

      const response = await fetch(`/api/inventory/suppliers/${supplier.id}`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil detail supplier");
      }

      const data = result.data;

      setForm({
        name: data.name || "",
        code: data.code || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        contactName: data.contactName || "",
        isActive: Boolean(data.isActive),
      });

      setDialogOpen(true);
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil detail supplier",
        "error",
      );
    }
  };

  const openDetailDialog = async (supplier: Supplier) => {
    try {
      const response = await fetch(`/api/inventory/suppliers/${supplier.id}`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil detail supplier");
      }

      setSelectedSupplier(result.data);
      setDetailOpen(true);
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil detail supplier",
        "error",
      );
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Nama supplier wajib diisi";
    } else if (form.name.trim().length > 150) {
      nextErrors.name = "Maksimal 150 karakter";
    }

    if (!form.code.trim()) {
      nextErrors.code = "Kode supplier wajib diisi";
    } else if (form.code.trim().length > 50) {
      nextErrors.code = "Maksimal 50 karakter";
    }

    if (form.phone.length > 30) {
      nextErrors.phone = "Maksimal 30 karakter";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Format email tidak valid";
    }

    if (form.email.length > 254) {
      nextErrors.email = "Email terlalu panjang";
    }

    if (form.contactName.length > 100) {
      nextErrors.contactName = "Maksimal 100 karakter";
    }

    if (form.address.length > 500) {
      nextErrors.address = "Maksimal 500 karakter";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        contactName: form.contactName.trim() || null,
        isActive: form.isActive,
      };

      const url = editingId
        ? `/api/inventory/suppliers/${editingId}`
        : "/api/inventory/suppliers";

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Gagal ${editingId ? "memperbarui" : "menambahkan"} supplier`,
        );
      }

      setDialogOpen(false);

      showMessage(
        editingId
          ? "Supplier berhasil diperbarui"
          : "Supplier berhasil ditambahkan",
      );

      await fetchSuppliers();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSupplier) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/inventory/suppliers/${selectedSupplier.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus supplier");
      }

      setDeleteOpen(false);

      showMessage(result.message || "Supplier berhasil dihapus");

      await fetchSuppliers();
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Gagal menghapus supplier",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (field: keyof SupplierForm, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: "",
      }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        p: { xs: 2, md: 3 },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 24, md: 30 },
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            Supplier
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            Kelola data pemasok perangkat dan material instalasi.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
          sx={{
            borderRadius: 2.5,
            px: 2.5,
            py: 1.25,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          Tambah Supplier
        </Button>
      </Box>

      {/* STATS */}
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
        <StatCard
          icon={<Business />}
          label="Total Supplier"
          value={stats.total}
        />

        <StatCard
          icon={<Inventory2Outlined />}
          label="Supplier Aktif"
          value={stats.active}
        />

        <StatCard
          icon={<Business />}
          label="Tidak Aktif"
          value={stats.inactive}
        />
      </Box>

      {/* TABLE CONTAINER */}
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.015))",
        }}
      >
        {/* TOOLBAR */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            gap: 1.5,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Cari nama, kode, kontak, telepon..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <Search
                    sx={{
                      mr: 1,
                      color: "text.secondary",
                    }}
                  />
                ),
              },
            }}
          />

          <Select
            size="small"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            sx={{
              minWidth: { xs: "100%", md: 160 },
            }}
          >
            <MenuItem value="all">Semua Status</MenuItem>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="inactive">Tidak Aktif</MenuItem>
          </Select>

          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchSuppliers}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* CONTENT */}
        {loading ? (
          <Box
            sx={{
              minHeight: 320,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={30} />
          </Box>
        ) : suppliers.length === 0 ? (
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
            <Business
              sx={{
                fontSize: 56,
                color: "text.secondary",
                mb: 1,
              }}
            />
            <Typography sx={{ fontWeight: 700 }}>Belum ada supplier</Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Tambahkan supplier pertama untuk mulai mengelola data pemasok.
            </Typography>

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={openCreateDialog}
              sx={{
                mt: 2,
                borderRadius: 2,
              }}
            >
              Tambah Supplier
            </Button>
          </Box>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                overflowX: "auto",
              }}
            >
              <Box
                component="table"
                sx={{
                  width: "100%",
                  borderCollapse: "collapse",
                  "& th": {
                    textAlign: "left",
                    px: 2,
                    py: 1.75,
                    color: "text.secondary",
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  },
                  "& td": {
                    px: 2,
                    py: 1.75,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  },
                }}
              >
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Kode</th>
                    <th>Kontak</th>
                    <th>Transaksi</th>
                    <th>Status</th>
                    <th align="right">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>
                        <Typography sx={{ fontWeight: 700 }}>
                          {supplier.name}
                        </Typography>

                        {supplier.contactName && (
                          <Typography variant="caption" color="text.secondary">
                            {supplier.contactName}
                          </Typography>
                        )}
                      </td>

                      <td>
                        <Chip
                          label={supplier.code}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontFamily: "monospace",
                          }}
                        />
                      </td>

                      <td>
                        <Box>
                          {supplier.phone && (
                            <Typography
                              variant="body2"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <LocalPhoneOutlined sx={{ fontSize: 16 }} />
                              {supplier.phone}
                            </Typography>
                          )}

                          {supplier.email && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <EmailOutlined sx={{ fontSize: 15 }} />
                              {supplier.email}
                            </Typography>
                          )}
                        </Box>
                      </td>

                      <td>
                        <Typography sx={{ fontWeight: 700 }}>
                          {supplier.stockInCount}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Barang Masuk
                        </Typography>
                      </td>

                      <td>
                        <Chip
                          label={supplier.isActive ? "Aktif" : "Tidak Aktif"}
                          size="small"
                          color={supplier.isActive ? "success" : "default"}
                        />
                      </td>

                      <td>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          <Tooltip title="Detail">
                            <IconButton
                              size="small"
                              onClick={() => openDetailDialog(supplier)}
                            >
                              <VisibilityOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(supplier)}
                            >
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Hapus / Nonaktifkan">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openDeleteDialog(supplier)}
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>

            {/* MOBILE */}
            <Box
              sx={{
                display: { xs: "block", md: "none" },
                p: 1.5,
              }}
            >
              {suppliers.map((supplier) => (
                <Paper
                  key={supplier.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>
                        {supplier.name}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontFamily: "monospace",
                        }}
                      >
                        {supplier.code}
                      </Typography>
                    </Box>

                    <Chip
                      label={supplier.isActive ? "Aktif" : "Tidak Aktif"}
                      size="small"
                      color={supplier.isActive ? "success" : "default"}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2" color="text.secondary">
                    {supplier.contactName || "Kontak belum diisi"}
                  </Typography>

                  {supplier.phone && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        display: "flex",
                        gap: 0.75,
                        alignItems: "center",
                      }}
                    >
                      <LocalPhoneOutlined fontSize="small" />
                      {supplier.phone}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      mt: 1.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {supplier.stockInCount} transaksi barang masuk
                    </Typography>

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => openDetailDialog(supplier)}
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(supplier)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteDialog(supplier)}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </>
        )}
      </Paper>

      {/* CREATE / EDIT DIALOG */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingId ? "Edit Supplier" : "Tambah Supplier"}
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="Nama Supplier"
              required
              fullWidth
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />

            <TextField
              label="Kode Supplier"
              required
              fullWidth
              value={form.code}
              onChange={(event) =>
                updateForm("code", event.target.value.toUpperCase())
              }
              error={Boolean(errors.code)}
              helperText={errors.code || "Contoh: SUP-001"}
            />

            <TextField
              label="Nama Kontak"
              fullWidth
              value={form.contactName}
              onChange={(event) =>
                updateForm("contactName", event.target.value)
              }
              error={Boolean(errors.contactName)}
              helperText={errors.contactName}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                label="Nomor Telepon"
                fullWidth
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
              />

              <TextField
                label="Email"
                fullWidth
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
            </Box>

            <TextField
              label="Alamat"
              fullWidth
              multiline
              minRows={3}
              value={form.address}
              onChange={(event) => updateForm("address", event.target.value)}
              error={Boolean(errors.address)}
              helperText={errors.address}
            />

            <Select
              fullWidth
              value={form.isActive ? "active" : "inactive"}
              onChange={(event) =>
                updateForm("isActive", event.target.value === "active")
              }
            >
              <MenuItem value="active">Aktif</MenuItem>
              <MenuItem value="inactive">Tidak Aktif</MenuItem>
            </Select>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={17} /> : undefined}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            {editingId ? "Simpan Perubahan" : "Simpan Supplier"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Detail Supplier</DialogTitle>

        <DialogContent>
          {selectedSupplier && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {selectedSupplier.name}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedSupplier.code}
                  </Typography>
                </Box>

                <Chip
                  label={selectedSupplier.isActive ? "Aktif" : "Tidak Aktif"}
                  color={selectedSupplier.isActive ? "success" : "default"}
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <DetailRow
                label="Nama Kontak"
                value={selectedSupplier.contactName || "-"}
              />

              <DetailRow
                label="Telepon"
                value={selectedSupplier.phone || "-"}
              />

              <DetailRow label="Email" value={selectedSupplier.email || "-"} />

              <DetailRow
                label="Alamat"
                value={selectedSupplier.address || "-"}
              />

              <DetailRow
                label="Total Barang Masuk"
                value={`${selectedSupplier.stockInCount} transaksi`}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDetailOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog
        open={deleteOpen}
        onClose={() => !saving && setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Hapus Supplier?</DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            Supplier <strong>{selectedSupplier?.name}</strong> akan dihapus.
            Jika supplier sudah memiliki transaksi barang masuk, sistem akan
            otomatis menonaktifkannya.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={saving}>
            Batal
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={17} /> : <DeleteOutlined />
            }
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar((current) => ({
            ...current,
            open: false,
          }))
        }
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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 1.75,
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
          bgcolor: "rgba(0,230,118,0.10)",
          color: "primary.main",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: 25,
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        py: 1.25,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          textAlign: "right",
          maxWidth: "65%",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
