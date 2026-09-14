"use client";

import { useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import ToggleOffOutlinedIcon from "@mui/icons-material/ToggleOffOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

type PackageItem = {
  id: number;
  name: string;
  code: string;
  speed: number;
  price: number;
  description: string | null;
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  name: string;
  code: string;
  speed: string;
  price: string;
  description: string;
  isPopular: boolean;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  code: "",
  speed: "",
  price: "",
  description: "",
  isPopular: false,
  isActive: true,
};

const fieldStyle = {
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.55)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#00e676",
  },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    background: "rgba(255,255,255,0.025)",
    borderRadius: 2,
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.1)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0,230,118,0.45)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00e676",
    },
  },
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PackagesContent() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(
    null,
  );

  const [form, setForm] = useState<FormState>(emptyForm);

  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(
    null,
  );
  const [processingStatus, setProcessingStatus] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadPackages() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/packages?admin=true", {
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data paket.");
      }

      setPackages(result.data ?? []);
    } catch (err) {
      console.error("LOAD PACKAGES ERROR:", err);

      setError(
        err instanceof Error ? err.message : "Gagal mengambil data paket.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPackages();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const filteredPackages = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return packages.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && item.isActive) ||
        (statusFilter === "INACTIVE" && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [packages, search, statusFilter]);

  const totalPackages = packages.length;
  const activePackages = packages.filter((item) => item.isActive).length;
  const inactivePackages = packages.filter((item) => !item.isActive).length;
  const popularPackages = packages.filter(
    (item) => item.isPopular && item.isActive,
  ).length;

  function openCreateDialog() {
    setEditingPackage(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(item: PackageItem) {
    setEditingPackage(item);

    setForm({
      name: item.name,
      code: item.code,
      speed: String(item.speed),
      price: String(item.price),
      description: item.description ?? "",
      isPopular: item.isPopular,
      isActive: item.isActive,
    });

    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;

    setDialogOpen(false);
    setEditingPackage(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    setError("");

    if (!form.name.trim()) {
      setError("Nama paket wajib diisi.");
      return;
    }

    if (!form.code.trim()) {
      setError("Kode paket wajib diisi.");
      return;
    }

    if (!form.speed || Number(form.speed) <= 0) {
      setError("Kecepatan paket harus lebih dari 0.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setError("Harga paket harus lebih dari 0.");
      return;
    }

    setSaving(true);

    try {
      const url = editingPackage
        ? `/api/packages/${editingPackage.id}`
        : "/api/packages";

      const response = await fetch(url, {
        method: editingPackage ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          speed: Number(form.speed),
          price: Number(form.price),
          description: form.description || null,
          isPopular: form.isPopular,
          isActive: form.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan paket.");
      }

      setSuccess(
        editingPackage
          ? "Paket berhasil diperbarui."
          : "Paket berhasil ditambahkan.",
      );

      closeDialog();
      await loadPackages();
    } catch (err) {
      console.error("SAVE PACKAGE ERROR:", err);

      setError(err instanceof Error ? err.message : "Gagal menyimpan paket.");
    } finally {
      setSaving(false);
    }
  }

  function openStatusDialog(item: PackageItem) {
    setSelectedPackage(item);
    setConfirmOpen(true);
  }

  function closeStatusDialog() {
    if (processingStatus) return;

    setConfirmOpen(false);
    setSelectedPackage(null);
  }

  async function handleStatusChange() {
    if (!selectedPackage) return;

    setProcessingStatus(true);
    setError("");

    try {
      const newStatus = !selectedPackage.isActive;

      const response = await fetch(`/api/packages/${selectedPackage.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          isActive: newStatus,
          isPopular: newStatus ? selectedPackage.isPopular : false,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengubah status paket.");
      }

      setSuccess(
        newStatus
          ? "Paket berhasil diaktifkan."
          : "Paket berhasil dinonaktifkan.",
      );

      closeStatusDialog();
      await loadPackages();
    } catch (err) {
      console.error("CHANGE PACKAGE STATUS ERROR:", err);

      setError(
        err instanceof Error ? err.message : "Gagal mengubah status paket.",
      );
    } finally {
      setProcessingStatus(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(0,230,118,0.09), transparent 28%), #020617",
        color: "#fff",
        py: { xs: 3, md: 5 },
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
            gap: 2,
            mb: { xs: 3, md: 4 },
            flexDirection: {
              xs: "column",
              md: "row",
            },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#00e676",
                mb: 1,
              }}
            >
              GOLDEN NET / PRODUCT MANAGEMENT
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: 28,
                  md: 36,
                },
                fontWeight: 800,
                letterSpacing: -1,
              }}
            >
              Paket Internet
            </Typography>

            <Typography
              sx={{
                mt: 0.75,
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
              }}
            >
              Kelola produk dan layanan internet Golden Net.
            </Typography>
          </Box>

          <Button
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
            sx={{
              minHeight: 44,
              px: 2.5,
              borderRadius: 2,
              fontWeight: 800,
              color: "#001b0d",
              background: "linear-gradient(135deg, #00e676, #00b85c)",
              "&:hover": {
                background: "linear-gradient(135deg, #19ff88, #00d96b)",
              },
            }}
          >
            Tambah Paket
          </Button>
        </Box>

        {/* STATISTICS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: 1.5,
            mb: 3,
          }}
        >
          {[
            {
              label: "TOTAL PAKET",
              value: totalPackages,
              icon: <Inventory2OutlinedIcon />,
            },
            {
              label: "PAKET AKTIF",
              value: activePackages,
              icon: <CheckCircleIcon />,
            },
            {
              label: "PAKET NONAKTIF",
              value: inactivePackages,
              icon: <ToggleOffOutlinedIcon />,
            },
            {
              label: "PAKET POPULER",
              value: popularPackages,
              icon: <StarRoundedIcon />,
            },
          ].map((item) => (
            <Paper
              key={item.label}
              sx={{
                p: 2,
                borderRadius: 2.5,
                background:
                  "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 15px 50px rgba(0,0,0,0.2)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 10,
                      letterSpacing: 1.3,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {item.label}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 26,
                      fontWeight: 800,
                    }}
                  >
                    {item.value}
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
                    color: "#00e676",
                    background: "rgba(0,230,118,0.08)",
                  }}
                >
                  {item.icon}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* MAIN */}
        <Paper
          sx={{
            overflow: "hidden",
            borderRadius: 3,
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
          }}
        >
          {/* TOOLBAR */}
          <Box
            sx={{
              p: { xs: 2, md: 2.5 },
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <TextField
              size="small"
              placeholder="Cari nama atau kode paket..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{
                ...fieldStyle,
                flex: 1,
                minWidth: {
                  xs: "100%",
                  md: 280,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        sx={{
                          color: "rgba(255,255,255,0.35)",
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "ALL" | "ACTIVE" | "INACTIVE",
                )
              }
              sx={{
                ...fieldStyle,
                minWidth: 150,
              }}
            >
              <MenuItem value="ALL">Semua</MenuItem>
              <MenuItem value="ACTIVE">Aktif</MenuItem>
              <MenuItem value="INACTIVE">Nonaktif</MenuItem>
            </TextField>

            <IconButton
              onClick={loadPackages}
              sx={{
                width: 40,
                height: 40,
                color: "#00e676",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 2,
              }}
            >
              <RefreshRoundedIcon />
            </IconButton>
          </Box>

          {/* CARDS */}
          <Box
            sx={{
              p: { xs: 2, md: 3 },
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {loading ? (
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  py: 10,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Memuat paket...
                </Typography>
              </Box>
            ) : filteredPackages.length === 0 ? (
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  py: 10,
                  textAlign: "center",
                }}
              >
                <Inventory2OutlinedIcon
                  sx={{
                    fontSize: 48,
                    color: "rgba(255,255,255,0.15)",
                  }}
                />

                <Typography
                  sx={{
                    mt: 1.5,
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Tidak ada paket yang ditemukan.
                </Typography>
              </Box>
            ) : (
              filteredPackages.map((item) => (
                <Paper
                  key={item.id}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    p: 2.5,
                    borderRadius: 3,
                    background: item.isPopular
                      ? "linear-gradient(145deg, rgba(0,230,118,0.10), rgba(15,23,42,0.98))"
                      : "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(2,6,23,0.99))",
                    border: item.isPopular
                      ? "1px solid rgba(0,230,118,0.28)"
                      : "1px solid rgba(255,255,255,0.07)",
                    opacity: item.isActive ? 1 : 0.65,
                    transition: "transform .2s ease, border-color .2s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      borderColor: "rgba(0,230,118,0.35)",
                    },
                  }}
                >
                  {item.isPopular && (
                    <Chip
                      icon={
                        <StarRoundedIcon
                          sx={{
                            fontSize: 15,
                          }}
                        />
                      }
                      label="POPULER"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        color: "#f4c542",
                        background: "rgba(244,197,66,0.1)",
                        border: "1px solid rgba(244,197,66,0.2)",
                        fontSize: 9,
                        fontWeight: 800,
                      }}
                    />
                  )}

                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1.5,
                      color: "#00e676",
                    }}
                  >
                    {item.code}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 22,
                      fontWeight: 800,
                    }}
                  >
                    {item.name}
                  </Typography>

                  <Box
                    sx={{
                      mt: 2.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <SpeedOutlinedIcon
                      sx={{
                        color: "#00e676",
                        fontSize: 20,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 28,
                        fontWeight: 900,
                      }}
                    >
                      {item.speed}
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.45)",
                        fontSize: 13,
                      }}
                    >
                      Mbps
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 19,
                      fontWeight: 800,
                    }}
                  >
                    {formatRupiah(item.price)}
                    <Typography
                      component="span"
                      sx={{
                        fontSize: 11,
                        ml: 0.5,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      /bulan
                    </Typography>
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1.5,
                      minHeight: 40,
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.48)",
                    }}
                  >
                    {item.description || "Paket internet Golden Net."}
                  </Typography>

                  <Box
                    sx={{
                      mt: 2.5,
                      pt: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <Chip
                      label={item.isActive ? "Aktif" : "Nonaktif"}
                      size="small"
                      sx={{
                        color: item.isActive ? "#00e676" : "#94a3b8",
                        background: item.isActive
                          ? "rgba(0,230,118,0.08)"
                          : "rgba(148,163,184,0.08)",
                        fontWeight: 700,
                      }}
                    />

                    <Box>
                      <IconButton
                        onClick={() => openEditDialog(item)}
                        sx={{
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        onClick={() => openStatusDialog(item)}
                        sx={{
                          color: item.isActive ? "#fbbf24" : "#00e676",
                        }}
                      >
                        {item.isActive ? (
                          <ToggleOffOutlinedIcon />
                        ) : (
                          <ToggleOnOutlinedIcon />
                        )}
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        </Paper>
      </Container>

      {/* CREATE / EDIT */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              background: "linear-gradient(145deg, #0f172a, #020617)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {editingPackage ? "Edit Paket Internet" : "Tambah Paket Internet"}
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="Nama Paket"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value,
                })
              }
              fullWidth
              sx={fieldStyle}
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
                label="Kode Paket"
                value={form.code}
                onChange={(event) =>
                  setForm({
                    ...form,
                    code: event.target.value.toUpperCase(),
                  })
                }
                fullWidth
                sx={fieldStyle}
              />

              <TextField
                label="Kecepatan"
                type="number"
                value={form.speed}
                onChange={(event) =>
                  setForm({
                    ...form,
                    speed: event.target.value,
                  })
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          Mbps
                        </Typography>
                      </InputAdornment>
                    ),
                  },
                }}
                fullWidth
                sx={fieldStyle}
              />
            </Box>

            <TextField
              label="Harga / Bulan"
              type="number"
              value={form.price}
              onChange={(event) =>
                setForm({
                  ...form,
                  price: event.target.value,
                })
              }
              fullWidth
              sx={fieldStyle}
            />

            <TextField
              label="Deskripsi"
              multiline
              minRows={3}
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
              fullWidth
              sx={fieldStyle}
            />

            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Button
                onClick={() =>
                  setForm({
                    ...form,
                    isPopular: !form.isPopular,
                  })
                }
                startIcon={<StarRoundedIcon />}
                sx={{
                  color: form.isPopular ? "#f4c542" : "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {form.isPopular ? "Paket Populer" : "Tandai Populer"}
              </Button>

              <Button
                onClick={() =>
                  setForm({
                    ...form,
                    isActive: !form.isActive,
                  })
                }
                startIcon={
                  form.isActive ? (
                    <ToggleOnOutlinedIcon />
                  ) : (
                    <ToggleOffOutlinedIcon />
                  )
                }
                sx={{
                  color: form.isActive ? "#00e676" : "#94a3b8",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {form.isActive ? "Paket Aktif" : "Paket Nonaktif"}
              </Button>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Button
            onClick={closeDialog}
            disabled={saving}
            sx={{
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Batal
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving}
            sx={{
              px: 2.5,
              color: "#001b0d",
              fontWeight: 800,
              background: "linear-gradient(135deg, #00e676, #00b85c)",
              "&:hover": {
                background: "linear-gradient(135deg, #19ff88, #00d96b)",
              },
            }}
          >
            {saving
              ? "Menyimpan..."
              : editingPackage
                ? "Simpan Perubahan"
                : "Tambah Paket"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* STATUS CONFIRMATION */}
      <Dialog
        open={confirmOpen}
        onClose={closeStatusDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background: "linear-gradient(145deg, #0f172a, #020617)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedPackage?.isActive ? "Nonaktifkan Paket?" : "Aktifkan Paket?"}
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 14,
            }}
          >
            Apakah Anda yakin ingin{" "}
            {selectedPackage?.isActive ? "menonaktifkan" : "mengaktifkan"} paket{" "}
            <strong>{selectedPackage?.name}</strong>?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeStatusDialog}
            disabled={processingStatus}
            sx={{
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Batal
          </Button>

          <Button
            onClick={handleStatusChange}
            disabled={processingStatus}
            sx={{
              color: "#001b0d",
              fontWeight: 800,
              background: "linear-gradient(135deg, #00e676, #00b85c)",
            }}
          >
            {processingStatus ? "Memproses..." : "Ya, Lanjutkan"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3500}
        onClose={() => setSuccess("")}
      >
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4500}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
