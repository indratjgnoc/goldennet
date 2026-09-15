"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import {
  AddRounded,
  BlockRounded,
  CheckCircleRounded,
  CloseRounded,
  EditRounded,
  EmailRounded,
  LocationOnRounded,
  PeopleAltRounded,
  PhoneRounded,
  SearchRounded,
  VisibilityRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEKNISI"
  | "CUSTOMER_SERVICE"
  | "FINANCE";

type Branch = {
  id: number;
  name: string;
  code: string;
  address: string;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  counts: {
    customers: number;
    coverageAreas: number;
    registrations: number;
  };
};

type BranchDetail = Branch & {
  customers?: Array<{
    id: number;
    customerCode: string;
    name: string;
    phone: string;
    status: string;
  }>;
  coverageAreas?: Array<{
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
  }>;
  registrations?: Array<{
    id: number;
    registrationCode: string;
    name: string;
    phone: string;
    status: string;
    createdAt: string;
    package?: {
      id: number;
      name: string;
      code: string;
      speed: number;
      price: string | number;
    } | null;
  }>;
};

type Props = {
  user: {
    id: number;
    name: string;
    username: string;
    role: UserRole;
  };
  initialBranches: Branch[];
};

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TEKNISI: "Teknisi",
  CUSTOMER_SERVICE: "Customer Service",
  FINANCE: "Finance",
};

const emptyForm = {
  name: "",
  code: "",
  address: "",
  phone: "",
  email: "",
  latitude: "",
  longitude: "",
};

const fieldStyle = {
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.62)",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#00e676",
  },

  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 2,

    "& fieldset": {
      borderColor: "rgba(255,255,255,0.10)",
    },

    "&:hover fieldset": {
      borderColor: "rgba(0,230,118,0.45)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#00e676",
    },
  },
};

const primaryButtonStyle = {
  background:
    "linear-gradient(135deg, #00e676, #00b85c)",
  color: "#001b0d",
  fontWeight: 800,
  borderRadius: 2,
  px: 2.5,

  "&:hover": {
    background:
      "linear-gradient(135deg, #19ff88, #00d96b)",
  },
};

export default function BranchesContent({
  user,
  initialBranches,
}: Props) {
  const [branches, setBranches] =
    useState<Branch[]>(initialBranches);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE"
  >("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] =
    useState<Branch | null>(null);

  const [form, setForm] = useState(emptyForm);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] =
    useState(false);
  const [detailBranch, setDetailBranch] =
    useState<BranchDetail | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [branchToToggle, setBranchToToggle] =
    useState<Branch | null>(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canManage = [
    "SUPER_ADMIN",
    "ADMIN",
    "CUSTOMER_SERVICE",
  ].includes(user.role);

  const filteredBranches = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return branches.filter((branch) => {
      const matchesSearch =
        !keyword ||
        branch.name.toLowerCase().includes(keyword) ||
        branch.code.toLowerCase().includes(keyword) ||
        branch.address.toLowerCase().includes(keyword) ||
        branch.phone?.toLowerCase().includes(keyword) ||
        branch.email?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && branch.isActive) ||
        (statusFilter === "INACTIVE" && !branch.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [branches, search, statusFilter]);

  const activeBranches = branches.filter(
    (branch) => branch.isActive,
  ).length;

  const totalCustomers = branches.reduce(
    (total, branch) =>
      total + branch.counts.customers,
    0,
  );

  const totalCoverage = branches.reduce(
    (total, branch) =>
      total + branch.counts.coverageAreas,
    0,
  );

  function openCreateDialog() {
    setEditingBranch(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function openEditDialog(branch: Branch) {
    setEditingBranch(branch);

    setForm({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      phone: branch.phone ?? "",
      email: branch.email ?? "",
      latitude:
        branch.latitude !== null
          ? String(branch.latitude)
          : "",
      longitude:
        branch.longitude !== null
          ? String(branch.longitude)
          : "",
    });

    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingBranch(null);
    setForm(emptyForm);
  }

  async function loadBranches() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/branches",
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal mengambil data branch.",
        );
      }

      const normalized = (result.data ?? []).map(
        (branch: Branch) => ({
          ...branch,
          latitude:
            branch.latitude !== null
              ? Number(branch.latitude)
              : null,
          longitude:
            branch.longitude !== null
              ? Number(branch.longitude)
              : null,
          counts: {
            customers:
              branch.counts?.customers ?? 0,
            coverageAreas:
              branch.counts?.coverageAreas ?? 0,
            registrations:
              branch.counts?.registrations ?? 0,
          },
        }),
      );

      setBranches(normalized);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data branch.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Nama branch wajib diisi.");
      return;
    }

    if (!form.code.trim()) {
      setError("Kode branch wajib diisi.");
      return;
    }

    if (!form.address.trim()) {
      setError("Alamat branch wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        address: form.address.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        latitude:
          form.latitude.trim() === ""
            ? null
            : Number(form.latitude),
        longitude:
          form.longitude.trim() === ""
            ? null
            : Number(form.longitude),
      };

      const url = editingBranch
        ? `/api/branches/${editingBranch.id}`
        : "/api/branches";

      const response = await fetch(url, {
        method: editingBranch ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal menyimpan branch.",
        );
      }

      await loadBranches();

      setFormOpen(false);
      setEditingBranch(null);
      setForm(emptyForm);

      setSuccess(
        editingBranch
          ? "Branch berhasil diperbarui."
          : "Branch berhasil ditambahkan.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan branch.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function openDetail(branch: Branch) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailBranch(null);

    try {
      const response = await fetch(
        `/api/branches/${branch.id}`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal mengambil detail branch.",
        );
      }

      setDetailBranch(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil detail branch.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function openToggleConfirm(branch: Branch) {
    setBranchToToggle(branch);
    setConfirmOpen(true);
  }

  async function handleToggleStatus() {
    if (!branchToToggle) return;

    try {
      setSaving(true);
      setError("");

      const newStatus =
        !branchToToggle.isActive;

      const response = await fetch(
        `/api/branches/${branchToToggle.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: newStatus,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal mengubah status branch.",
        );
      }

      await loadBranches();

      setConfirmOpen(false);
      setBranchToToggle(null);

      setSuccess(
        newStatus
          ? "Branch berhasil diaktifkan."
          : "Branch berhasil dinonaktifkan.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengubah status branch.",
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
          "radial-gradient(circle at top right, rgba(0,230,118,0.09), transparent 28%), #020617",
        color: "#fff",
        py: 4,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1500,
          mx: "auto",
          px: { xs: 2, md: 3 },
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
            mb: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 2,
                color: "#00e676",
                mb: 0.5,
              }}
            >
              FIANDRA NET / BRANCH MANAGEMENT
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: 26,
                  md: 32,
                },
                fontWeight: 900,
                letterSpacing: -0.8,
              }}
            >
              Manajemen Branch
            </Typography>

            <Typography
              sx={{
                mt: 0.7,
                color:
                  "rgba(255,255,255,0.55)",
                fontSize: 14,
              }}
            >
              Kelola cabang operasional dan
              cakupan layanan Fiandra Net.
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
            <Box
              sx={{
                textAlign: "right",
                mr: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {user.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  color:
                    "rgba(255,255,255,0.45)",
                }}
              >
                {roleLabels[user.role]}
              </Typography>
            </Box>

            {canManage && (
              <Button
                onClick={openCreateDialog}
                startIcon={<AddRounded />}
                sx={primaryButtonStyle}
              >
                Tambah Branch
              </Button>
            )}
          </Box>
        </Box>

        {/* ALERT */}
        {error && (
          <Paper
            sx={{
              mb: 2,
              px: 2,
              py: 1.5,
              background:
                "rgba(239,68,68,0.10)",
              border:
                "1px solid rgba(239,68,68,0.25)",
              borderRadius: 2,
              color: "#fca5a5",
            }}
          >
            <Typography sx={{ fontSize: 13 }}>
              {error}
            </Typography>
          </Paper>
        )}

        {success && (
          <Paper
            sx={{
              mb: 2,
              px: 2,
              py: 1.5,
              background:
                "rgba(0,230,118,0.08)",
              border:
                "1px solid rgba(0,230,118,0.20)",
              borderRadius: 2,
              color: "#86efac",
            }}
          >
            <Typography sx={{ fontSize: 13 }}>
              {success}
            </Typography>
          </Paper>
        )}

        {/* STATISTICS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <StatCard
            icon={<LocationOnRounded />}
            label="Total Branch"
            value={branches.length}
            description="Seluruh cabang"
          />

          <StatCard
            icon={<CheckCircleRounded />}
            label="Branch Aktif"
            value={activeBranches}
            description="Operasional aktif"
            accent="#00e676"
          />

          <StatCard
            icon={<PeopleAltRounded />}
            label="Total Pelanggan"
            value={totalCustomers}
            description="Pelanggan seluruh branch"
            accent="#60a5fa"
          />

          <StatCard
            icon={<LocationOnRounded />}
            label="Coverage Area"
            value={totalCoverage}
            description="Area coverage terdaftar"
            accent="#fbbf24"
          />
        </Box>

        {/* FILTER */}
        <Paper
          sx={{
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))",
            border:
              "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 25px 80px rgba(0,0,0,0.35)",
            borderRadius: 2,
            p: 2,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "2fr 1fr auto",
              },
              gap: 1.5,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Cari nama, kode, alamat, telepon..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              sx={fieldStyle}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded
                        sx={{
                          color:
                            "rgba(255,255,255,0.35)",
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl
              fullWidth
              size="small"
              sx={fieldStyle}
            >
              <InputLabel>Status</InputLabel>

              <Select
                value={statusFilter}
                label="Status"
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "ALL"
                      | "ACTIVE"
                      | "INACTIVE",
                  )
                }
              >
                <MenuItem value="ALL">
                  Semua Status
                </MenuItem>
                <MenuItem value="ACTIVE">
                  Aktif
                </MenuItem>
                <MenuItem value="INACTIVE">
                  Tidak Aktif
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              onClick={loadBranches}
              disabled={loading}
              variant="outlined"
              sx={{
                minHeight: 40,
                color: "#fff",
                borderColor:
                  "rgba(255,255,255,0.12)",
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#00e676",
                  background:
                    "rgba(0,230,118,0.05)",
                },
              }}
            >
              {loading ? "Memuat..." : "Refresh"}
            </Button>
          </Box>
        </Paper>

        {/* TABLE */}
        <Paper
          sx={{
            overflow: "hidden",
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))",
            border:
              "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 25px 80px rgba(0,0,0,0.35)",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 2,
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              borderBottom:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                Daftar Branch
              </Typography>

              <Typography
                sx={{
                  color:
                    "rgba(255,255,255,0.42)",
                  fontSize: 12,
                  mt: 0.3,
                }}
              >
                Menampilkan{" "}
                {filteredBranches.length} dari{" "}
                {branches.length} branch
              </Typography>
            </Box>

            <Chip
              label={`${filteredBranches.length} Data`}
              sx={{
                color: "#00e676",
                background:
                  "rgba(0,230,118,0.08)",
                border:
                  "1px solid rgba(0,230,118,0.18)",
                fontWeight: 800,
              }}
            />
          </Box>

          {/* DESKTOP */}
          <Box
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
              overflowX: "auto",
            }}
          >
            <Box sx={{ minWidth: 1050 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "1.6fr 1fr 2fr 1.2fr 1.1fr 130px",
                  px: 2.5,
                  py: 1.5,
                  background:
                    "rgba(255,255,255,0.015)",
                  borderBottom:
                    "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {[
                  "BRANCH",
                  "KODE",
                  "KONTAK",
                  "PELANGGAN",
                  "STATUS",
                  "AKSI",
                ].map((item) => (
                  <Typography
                    key={item}
                    sx={{
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: 1,
                      color:
                        "rgba(255,255,255,0.38)",
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>

              {filteredBranches.map(
                (branch) => (
                  <BranchRow
                    key={branch.id}
                    branch={branch}
                    canManage={canManage}
                    onDetail={() =>
                      openDetail(branch)
                    }
                    onEdit={() =>
                      openEditDialog(branch)
                    }
                    onToggle={() =>
                      openToggleConfirm(branch)
                    }
                  />
                ),
              )}
            </Box>
          </Box>

          {/* MOBILE */}
          <Box
            sx={{
              display: {
                xs: "block",
                md: "none",
              },
            }}
          >
            {filteredBranches.map(
              (branch) => (
                <MobileBranchCard
                  key={branch.id}
                  branch={branch}
                  canManage={canManage}
                  onDetail={() =>
                    openDetail(branch)
                  }
                  onEdit={() =>
                    openEditDialog(branch)
                  }
                  onToggle={() =>
                    openToggleConfirm(branch)
                  }
                />
              ),
            )}
          </Box>

          {filteredBranches.length === 0 && (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
              }}
            >
              <LocationOnRounded
                sx={{
                  fontSize: 48,
                  color:
                    "rgba(255,255,255,0.12)",
                  mb: 1,
                }}
              />

              <Typography
                sx={{
                  fontWeight: 800,
                  color:
                    "rgba(255,255,255,0.6)",
                }}
              >
                Branch tidak ditemukan
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  color:
                    "rgba(255,255,255,0.35)",
                  mt: 0.5,
                }}
              >
                Coba ubah pencarian atau
                filter.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* CREATE / EDIT */}
      <Dialog
        open={formOpen}
        onClose={closeForm}
        fullWidth
        maxWidth="sm"
        slotProps={{
            paper: {
          sx: {
            background:
              "linear-gradient(145deg, #0f172a, #020617)",
            border:
              "1px solid rgba(255,255,255,0.08)",
            borderRadius: 2,
            color: "#fff",
          },
        },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-start",
            px: 3,
            pt: 2.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              {editingBranch
                ? "Edit Branch"
                : "Tambah Branch"}
            </Typography>

            <Typography
              sx={{
                fontSize: 12,
                color:
                  "rgba(255,255,255,0.42)",
                mt: 0.5,
              }}
            >
              {editingBranch
                ? `Mengubah ${editingBranch.code}`
                : "Tambahkan cabang operasional Fiandra Net"}
            </Typography>
          </Box>

          <Button
            onClick={closeForm}
            sx={{
              minWidth: 38,
              width: 38,
              height: 38,
              color:
                "rgba(255,255,255,0.55)",
            }}
          >
            <CloseRounded />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              mt: 1,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1.5fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Nama Branch"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                sx={fieldStyle}
                autoFocus
              />

              <TextField
                fullWidth
                label="Kode Branch"
                value={form.code}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    code:
                      event.target.value.toUpperCase(),
                  }))
                }
                sx={fieldStyle}
                helperText="Contoh: BIA"
                slotProps={{
                  formHelperText: {
                    sx: {
                      color:
                        "rgba(255,255,255,0.3)",
                    },
                  },
                }}
              />
            </Box>

            <TextField
              fullWidth
              label="Nomor Telepon"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  phone: event.target.value,
                }))
              }
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Alamat Branch"
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  address: event.target.value,
                }))
              }
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
                fullWidth
                type="number"
                label="Latitude"
                value={form.latitude}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    latitude:
                      event.target.value,
                  }))
                }
                sx={fieldStyle}
              />

              <TextField
                fullWidth
                type="number"
                label="Longitude"
                value={form.longitude}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    longitude:
                      event.target.value,
                  }))
                }
                sx={fieldStyle}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={closeForm}
            disabled={saving}
            sx={{
              color:
                "rgba(255,255,255,0.65)",
            }}
          >
            Batal
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            sx={primaryButtonStyle}
          >
            {saving
              ? "Menyimpan..."
              : editingBranch
                ? "Simpan Perubahan"
                : "Tambah Branch"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAIL */}
      <Dialog
        open={detailOpen}
        onClose={() =>
          !detailLoading &&
          setDetailOpen(false)
        }
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              background:
                "linear-gradient(145deg, #0f172a, #020617)",
              border:
                "1px solid rgba(255,255,255,0.08)",
            borderRadius: 2,
            color: "#fff",
          },
        },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent:
              "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              Detail Branch
            </Typography>

            <Typography
              sx={{
                fontSize: 12,
                color:
                  "rgba(255,255,255,0.4)",
                mt: 0.5,
              }}
            >
              Informasi operasional branch
            </Typography>
          </Box>

          <Button
            onClick={() =>
              setDetailOpen(false)
            }
            sx={{
              minWidth: 38,
              width: 38,
              height: 38,
              color:
                "rgba(255,255,255,0.55)",
            }}
          >
            <CloseRounded />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 3 }}>
          {detailLoading && (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color:
                    "rgba(255,255,255,0.45)",
                }}
              >
                Memuat detail branch...
              </Typography>
            </Box>
          )}

          {!detailLoading &&
            detailBranch && (
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    background:
                      "rgba(255,255,255,0.025)",
                    border:
                      "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: "grid",
                        placeItems:
                          "center",
                        borderRadius: 2,
                        color: "#00e676",
                        background:
                          "rgba(0,230,118,0.10)",
                      }}
                    >
                      <LocationOnRounded />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 18,
                          fontWeight: 900,
                        }}
                      >
                        {detailBranch.name}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#00e676",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {detailBranch.code}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider
                    sx={{
                      borderColor:
                        "rgba(255,255,255,0.06)",
                      mb: 2,
                    }}
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
                    <DetailItem
                      icon={<PhoneRounded />}
                      label="Telepon"
                      value={
                        detailBranch.phone ||
                        "-"
                      }
                    />

                    <DetailItem
                      icon={<EmailRounded />}
                      label="Email"
                      value={
                        detailBranch.email ||
                        "-"
                      }
                    />

                    <DetailItem
                      icon={
                        <PeopleAltRounded />
                      }
                      label="Pelanggan"
                      value={`${detailBranch.counts.customers} pelanggan`}
                    />

                    <DetailItem
                      icon={
                        <LocationOnRounded />
                      }
                      label="Coverage"
                      value={`${detailBranch.counts.coverageAreas} area`}
                    />
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 800,
                        color:
                          "rgba(255,255,255,0.32)",
                        textTransform:
                          "uppercase",
                        letterSpacing: 0.8,
                        mb: 0.7,
                      }}
                    >
                      Alamat
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 13,
                        lineHeight: 1.7,
                        color:
                          "rgba(255,255,255,0.72)",
                      }}
                    >
                      {detailBranch.address}
                    </Typography>
                  </Box>

                  {(detailBranch.latitude !==
                    null ||
                    detailBranch.longitude !==
                      null) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 800,
                          color:
                            "rgba(255,255,255,0.32)",
                          textTransform:
                            "uppercase",
                          letterSpacing: 0.8,
                          mb: 0.7,
                        }}
                      >
                        Koordinat
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "#00e676",
                          fontFamily:
                            "monospace",
                        }}
                      >
                        {detailBranch.latitude ??
                          "-"}
                        ,{" "}
                        {detailBranch.longitude ??
                          "-"}
                      </Typography>
                    </Box>
                  )}
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    background:
                      "rgba(255,255,255,0.025)",
                    border:
                      "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      mb: 1.5,
                    }}
                  >
                    Pelanggan di Branch
                  </Typography>

                  {detailBranch.customers
                    ?.length ? (
                    <Box
                      sx={{
                        display: "grid",
                        gap: 1,
                      }}
                    >
                      {detailBranch.customers.map(
                        (customer) => (
                          <Box
                            key={customer.id}
                            sx={{
                              p: 1.4,
                              display: "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              gap: 2,
                              borderRadius: 1.5,
                              background:
                                "rgba(255,255,255,0.025)",
                              border:
                                "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                }}
                              >
                                {customer.name}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 10,
                                  color:
                                    "#00e676",
                                  mt: 0.3,
                                }}
                              >
                                {
                                  customer.customerCode
                                }
                              </Typography>
                            </Box>

                            <Typography
                              sx={{
                                fontSize: 11,
                                color:
                                  "rgba(255,255,255,0.45)",
                              }}
                            >
                              {
                                customer.phone
                              }
                            </Typography>
                          </Box>
                        ),
                      )}
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: 13,
                        color:
                          "rgba(255,255,255,0.35)",
                      }}
                    >
                      Belum ada pelanggan.
                    </Typography>
                  )}
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    background:
                      "rgba(255,255,255,0.025)",
                    border:
                      "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      mb: 1.5,
                    }}
                  >
                    Coverage Area
                  </Typography>

                  {detailBranch.coverageAreas
                    ?.length ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      {detailBranch.coverageAreas.map(
                        (area) => (
                          <Chip
                            key={area.id}
                            label={area.name}
                            sx={{
                              color: area.isActive
                                ? "#00e676"
                                : "#94a3b8",
                              background:
                                area.isActive
                                  ? "rgba(0,230,118,0.08)"
                                  : "rgba(148,163,184,0.08)",
                              border: area.isActive
                                ? "1px solid rgba(0,230,118,0.18)"
                                : "1px solid rgba(148,163,184,0.18)",
                              fontWeight: 700,
                            }}
                          />
                        ),
                      )}
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: 13,
                        color:
                          "rgba(255,255,255,0.35)",
                      }}
                    >
                      Belum ada coverage area.
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}
        </DialogContent>
      </Dialog>

      {/* CONFIRM STATUS */}
      <Dialog
        open={confirmOpen}
        onClose={() =>
          !saving &&
          setConfirmOpen(false)
        }
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              background:
                "linear-gradient(145deg, #0f172a, #020617)",
              border:
                "1px solid rgba(255,255,255,0.08)",
            borderRadius: 2,
            color: "#fff",
          },
        },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          {branchToToggle?.isActive
            ? "Nonaktifkan Branch?"
            : "Aktifkan Branch?"}
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color:
                "rgba(255,255,255,0.55)",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {branchToToggle?.isActive
              ? `Branch "${branchToToggle?.name}" akan dinonaktifkan.`
              : `Branch "${branchToToggle?.name}" akan diaktifkan kembali.`}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            disabled={saving}
            onClick={() =>
              setConfirmOpen(false)
            }
            sx={{
              color:
                "rgba(255,255,255,0.65)",
            }}
          >
            Batal
          </Button>

          <Button
            disabled={saving}
            onClick={handleToggleStatus}
            sx={
              branchToToggle?.isActive
                ? {
                    color: "#f87171",
                    border:
                      "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 2,
                  }
                : primaryButtonStyle
            }
          >
            {saving
              ? "Memproses..."
              : branchToToggle?.isActive
                ? "Nonaktifkan"
                : "Aktifkan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
  accent = "#00e676",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  description: string;
  accent?: string;
}) {
  return (
    <Card
      sx={{
        height: "100%",
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))",
        border:
          "1px solid rgba(255,255,255,0.07)",
        borderRadius: 2,
        boxShadow:
          "0 25px 80px rgba(0,0,0,0.25)",
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 1.5,
            md: 2,
          },
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            color: accent,
            background: `${accent}14`,
            mb: 1.5,
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: {
              xs: 20,
              md: 25,
            },
            fontWeight: 900,
          }}
        >
          {value.toLocaleString("id-ID")}
        </Typography>

        <Typography
          sx={{
            mt: 0.3,
            fontSize: 12,
            fontWeight: 800,
            color:
              "rgba(255,255,255,0.7)",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: 10,
            color:
              "rgba(255,255,255,0.35)",
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

function BranchRow({
  branch,
  canManage,
  onDetail,
  onEdit,
  onToggle,
}: {
  branch: Branch;
  canManage: boolean;
  onDetail: () => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns:
          "1.6fr 1fr 2fr 1.2fr 1.1fr 130px",
        px: 2.5,
        py: 1.7,
        alignItems: "center",
        borderBottom:
          "1px solid rgba(255,255,255,0.04)",
        "&:hover": {
          background:
            "rgba(255,255,255,0.025)",
        },
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {branch.name}
        </Typography>

        <Typography
          sx={{
            fontSize: 11,
            color: "#00e676",
            fontWeight: 700,
            mt: 0.35,
          }}
        >
          {branch.code}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontFamily: "monospace",
          fontSize: 12,
          color:
            "rgba(255,255,255,0.65)",
        }}
      >
        {branch.code}
      </Typography>

      <Box>
        <Typography
          sx={{
            fontSize: 12,
            color:
              "rgba(255,255,255,0.72)",
          }}
        >
          {branch.phone || "-"}
        </Typography>

        <Typography
          sx={{
            fontSize: 10,
            color:
              "rgba(255,255,255,0.35)",
            mt: 0.3,
          }}
        >
          {branch.email || "Tidak ada email"}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: 12,
          color:
            "rgba(255,255,255,0.65)",
        }}
      >
        {branch.counts.customers} pelanggan
      </Typography>

      <Chip
        size="small"
        label={
          branch.isActive
            ? "Aktif"
            : "Tidak Aktif"
        }
        sx={{
          width: "fit-content",
          color: branch.isActive
            ? "#00e676"
            : "#94a3b8",
          background:
            branch.isActive
              ? "rgba(0,230,118,0.10)"
              : "rgba(148,163,184,0.10)",
          border: branch.isActive
            ? "1px solid rgba(0,230,118,0.20)"
            : "1px solid rgba(148,163,184,0.20)",
          fontWeight: 800,
          fontSize: 10,
        }}
      />

      <Box
        sx={{
          display: "flex",
          gap: 0.5,
        }}
      >
        <ActionButton
          title="Detail"
          onClick={onDetail}
        >
          <VisibilityRounded fontSize="small" />
        </ActionButton>

        {canManage && (
          <>
            <ActionButton
              title="Edit"
              onClick={onEdit}
            >
              <EditRounded fontSize="small" />
            </ActionButton>

            <ActionButton
              title={
                branch.isActive
                  ? "Nonaktifkan"
                  : "Aktifkan"
              }
              onClick={onToggle}
              danger={branch.isActive}
            >
              {branch.isActive ? (
                <BlockRounded fontSize="small" />
              ) : (
                <CheckCircleRounded fontSize="small" />
              )}
            </ActionButton>
          </>
        )}
      </Box>
    </Box>
  );
}

function MobileBranchCard({
  branch,
  canManage,
  onDetail,
  onEdit,
  onToggle,
}: {
  branch: Branch;
  canManage: boolean;
  onDetail: () => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderBottom:
          "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent:
            "space-between",
          gap: 1,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            {branch.name}
          </Typography>

          <Typography
            sx={{
              color: "#00e676",
              fontSize: 11,
              fontWeight: 800,
              mt: 0.3,
            }}
          >
            {branch.code}
          </Typography>
        </Box>

        <Chip
          size="small"
          label={
            branch.isActive
              ? "Aktif"
              : "Tidak Aktif"
          }
          sx={{
            color: branch.isActive
              ? "#00e676"
              : "#94a3b8",
            background:
              branch.isActive
                ? "rgba(0,230,118,0.10)"
                : "rgba(148,163,184,0.10)",
            fontWeight: 800,
          }}
        />
      </Box>

      <Typography
        sx={{
          mt: 1.2,
          fontSize: 12,
          color:
            "rgba(255,255,255,0.55)",
        }}
      >
        📞 {branch.phone || "-"}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 12,
          color:
            "rgba(255,255,255,0.55)",
        }}
      >
        👥 {branch.counts.customers} pelanggan
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 12,
          color:
            "rgba(255,255,255,0.55)",
        }}
      >
        📍 {branch.counts.coverageAreas} coverage
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 0.8,
          mt: 1.5,
        }}
      >
        <Button
          size="small"
          startIcon={
            <VisibilityRounded />
          }
          onClick={onDetail}
          sx={{
            color: "#fff",
            border:
              "1px solid rgba(255,255,255,0.10)",
            borderRadius: 1.5,
            fontSize: 11,
          }}
        >
          Detail
        </Button>

        {canManage && (
          <>
            <Button
              size="small"
              startIcon={<EditRounded />}
              onClick={onEdit}
              sx={{
                color: "#00e676",
                border:
                  "1px solid rgba(0,230,118,0.18)",
                borderRadius: 1.5,
                fontSize: 11,
              }}
            >
              Edit
            </Button>

            <Button
              size="small"
              onClick={onToggle}
              sx={{
                minWidth: 40,
                color: branch.isActive
                  ? "#f87171"
                  : "#00e676",
                border: branch.isActive
                  ? "1px solid rgba(239,68,68,0.18)"
                  : "1px solid rgba(0,230,118,0.18)",
                borderRadius: 1.5,
              }}
            >
              {branch.isActive ? (
                <BlockRounded fontSize="small" />
              ) : (
                <CheckCircleRounded fontSize="small" />
              )}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}

function ActionButton({
  children,
  onClick,
  title,
  danger = false,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <Button
      title={title}
      onClick={onClick}
      sx={{
        minWidth: 32,
        width: 32,
        height: 32,
        p: 0,
        color: danger
          ? "#f87171"
          : "rgba(255,255,255,0.55)",
        borderRadius: 1.5,
        "&:hover": {
          color: danger
            ? "#f87171"
            : "#00e676",
          background: danger
            ? "rgba(239,68,68,0.08)"
            : "rgba(0,230,118,0.08)",
        },
      }}
    >
      {children}
    </Button>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          color: "#00e676",
          display: "flex",
          mt: 0.15,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 0.7,
            fontWeight: 800,
            color:
              "rgba(255,255,255,0.32)",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color:
              "rgba(255,255,255,0.75)",
            mt: 0.35,
            wordBreak: "break-word",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
