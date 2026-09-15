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

type CustomerStatus =
  | "PROSPECT"
  | "ACTIVE"
  | "SUSPENDED"
  | "INACTIVE";

type Branch = {
  id: number;
  name: string;
  code: string;
};

type Customer = {
  id: number;
  customerCode: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  status: CustomerStatus;
  branch: Branch | null;
  createdAt: string;
  updatedAt: string;
};

type Registration = {
  id: number;
  registrationCode: string;
  status: string;
  createdAt: string;
  package?: {
    id: number;
    name: string;
    code: string;
    speed: number;
    price: string | number;
  } | null;
};

type Subscription = {
  id: number;
  subscriptionCode: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  package?: {
    id: number;
    name: string;
    code: string;
    speed: number;
    price: string | number;
  } | null;
};

type CustomerDetail = Customer & {
  registrations?: Registration[];
  subscriptions?: Subscription[];
};

type Props = {
  user: {
    id: number;
    name: string;
    username: string;
    role: UserRole;
  };
  initialCustomers: Customer[];
  branches: Branch[];
};

const statusConfig: Record<
  CustomerStatus,
  {
    label: string;
    bg: string;
    color: string;
    border: string;
  }
> = {
  PROSPECT: {
    label: "Prospek",
    bg: "rgba(245, 158, 11, 0.12)",
    color: "#fbbf24",
    border: "rgba(245, 158, 11, 0.25)",
  },
  ACTIVE: {
    label: "Aktif",
    bg: "rgba(0, 230, 118, 0.12)",
    color: "#00e676",
    border: "rgba(0, 230, 118, 0.25)",
  },
  SUSPENDED: {
    label: "Ditangguhkan",
    bg: "rgba(239, 68, 68, 0.12)",
    color: "#f87171",
    border: "rgba(239, 68, 68, 0.25)",
  },
  INACTIVE: {
    label: "Tidak Aktif",
    bg: "rgba(148, 163, 184, 0.12)",
    color: "#94a3b8",
    border: "rgba(148, 163, 184, 0.25)",
  },
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
  phone: "",
  email: "",
  address: "",
  status: "PROSPECT" as CustomerStatus,
  branchId: "",
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
  "& .MuiInputBase-input::placeholder": {
    color: "rgba(255,255,255,0.35)",
    opacity: 1,
  },
};

const primaryButtonStyle = {
  background: "linear-gradient(135deg, #00e676, #00b85c)",
  color: "#001b0d",
  fontWeight: 800,
  borderRadius: 2,
  px: 2.5,
  "&:hover": {
    background: "linear-gradient(135deg, #19ff88, #00d96b)",
  },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPrice(value: string | number | undefined) {
  if (value === undefined || value === null) return "-";

  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

export default function CustomersContent({
  user,
  initialCustomers,
  branches,
}: Props) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CustomerStatus>(
    "ALL",
  );
  const [branchFilter, setBranchFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
    null,
  );
  const [form, setForm] = useState(emptyForm);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [customerToToggle, setCustomerToToggle] =
    useState<Customer | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailCustomer, setDetailCustomer] =
    useState<CustomerDetail | null>(null);

  const canManage = [
    "SUPER_ADMIN",
    "ADMIN",
    "CUSTOMER_SERVICE",
  ].includes(user.role);

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !keyword ||
        customer.customerCode.toLowerCase().includes(keyword) ||
        customer.name.toLowerCase().includes(keyword) ||
        customer.phone.toLowerCase().includes(keyword) ||
        customer.email?.toLowerCase().includes(keyword) ||
        customer.branch?.name.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || customer.status === statusFilter;

      const matchesBranch =
        branchFilter === "ALL" ||
        String(customer.branch?.id ?? "") === branchFilter;

      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [customers, search, statusFilter, branchFilter]);

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (customer) => customer.status === "ACTIVE",
  ).length;
  const prospects = customers.filter(
    (customer) => customer.status === "PROSPECT",
  ).length;
  const suspendedCustomers = customers.filter(
    (customer) => customer.status === "SUSPENDED",
  ).length;

  function openCreateDialog() {
    setEditingCustomer(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function openEditDialog(customer: Customer) {
    setEditingCustomer(customer);

    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email ?? "",
      address: customer.address,
      status: customer.status,
      branchId: customer.branch ? String(customer.branch.id) : "",
    });

    setError("");
    setSuccess("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingCustomer(null);
    setForm(emptyForm);
    setError("");
  }

  async function loadCustomers() {
    try {
      setLoading(true);

      const response = await fetch("/api/customers", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengambil data pelanggan.");
      }

      setCustomers(result.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data pelanggan.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Nama pelanggan wajib diisi.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Nomor telepon wajib diisi.");
      return;
    }

    if (!form.address.trim()) {
      setError("Alamat pelanggan wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        address: form.address.trim(),
        status: form.status,
        branchId: form.branchId ? Number(form.branchId) : null,
      };

      const url = editingCustomer
        ? `/api/customers/${editingCustomer.id}`
        : "/api/customers";

      const method = editingCustomer ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            (editingCustomer
              ? "Gagal memperbarui pelanggan."
              : "Gagal menambahkan pelanggan."),
        );
      }

      await loadCustomers();

      setFormOpen(false);
      setEditingCustomer(null);
      setForm(emptyForm);

      setSuccess(
        editingCustomer
          ? "Data pelanggan berhasil diperbarui."
          : "Pelanggan baru berhasil ditambahkan.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyimpan data.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openToggleConfirm(customer: Customer) {
    setCustomerToToggle(customer);
    setError("");
    setConfirmOpen(true);
  }

  async function handleToggleStatus() {
    if (!customerToToggle) return;

    try {
      setSaving(true);
      setError("");

      const newStatus: CustomerStatus =
        customerToToggle.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const response = await fetch(
        `/api/customers/${customerToToggle.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Gagal mengubah status pelanggan.",
        );
      }

      await loadCustomers();

      setConfirmOpen(false);
      setCustomerToToggle(null);

      setSuccess(
        newStatus === "ACTIVE"
          ? "Pelanggan berhasil diaktifkan."
          : "Pelanggan berhasil dinonaktifkan.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengubah status pelanggan.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function openDetail(customer: Customer) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailCustomer(null);
    setError("");

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Gagal mengambil detail pelanggan.",
        );
      }

      setDetailCustomer(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil detail pelanggan.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    if (detailLoading) return;

    setDetailOpen(false);
    setDetailCustomer(null);
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
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
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
              FIANDRA NET / CUSTOMER MANAGEMENT
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 26, md: 32 },
                fontWeight: 900,
                letterSpacing: -0.8,
              }}
            >
              Manajemen Pelanggan
            </Typography>

            <Typography
              sx={{
                mt: 0.7,
                color: "rgba(255,255,255,0.55)",
                fontSize: 14,
              }}
            >
              Kelola data pelanggan, status layanan, dan informasi jaringan
              pelanggan Fiandra Net.
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
            <Box sx={{ textAlign: "right", mr: 1 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {user.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
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
                Tambah Pelanggan
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
              background: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 2,
              color: "#fca5a5",
            }}
          >
            <Typography sx={{ fontSize: 13 }}>{error}</Typography>
          </Paper>
        )}

        {success && (
          <Paper
            sx={{
              mb: 2,
              px: 2,
              py: 1.5,
              background: "rgba(0,230,118,0.08)",
              border: "1px solid rgba(0,230,118,0.20)",
              borderRadius: 2,
              color: "#86efac",
            }}
          >
            <Typography sx={{ fontSize: 13 }}>{success}</Typography>
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
            icon={<PeopleAltRounded />}
            label="Total Pelanggan"
            value={totalCustomers}
            description="Seluruh data pelanggan"
          />

          <StatCard
            icon={<CheckCircleRounded />}
            label="Pelanggan Aktif"
            value={activeCustomers}
            description="Layanan sedang aktif"
            accent="#00e676"
          />

          <StatCard
            icon={<PeopleAltRounded />}
            label="Prospek"
            value={prospects}
            description="Calon pelanggan"
            accent="#fbbf24"
          />

          <StatCard
            icon={<BlockRounded />}
            label="Ditangguhkan"
            value={suspendedCustomers}
            description="Perlu perhatian"
            accent="#f87171"
          />
        </Box>

        {/* FILTER TOOLBAR */}
        <Paper
          sx={{
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
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
                md: "2fr 1fr 1fr auto",
              },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, kode pelanggan, nomor HP..."
              sx={fieldStyle}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded
                        sx={{
                          color: "rgba(255,255,255,0.35)",
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl fullWidth size="small" sx={fieldStyle}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "ALL" | CustomerStatus,
                  )
                }
              >
                <MenuItem value="ALL">Semua Status</MenuItem>
                <MenuItem value="PROSPECT">Prospek</MenuItem>
                <MenuItem value="ACTIVE">Aktif</MenuItem>
                <MenuItem value="SUSPENDED">Ditangguhkan</MenuItem>
                <MenuItem value="INACTIVE">Tidak Aktif</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={fieldStyle}>
              <InputLabel>Branch</InputLabel>
              <Select
                value={branchFilter}
                label="Branch"
                onChange={(event) => setBranchFilter(event.target.value)}
              >
                <MenuItem value="ALL">Semua Branch</MenuItem>

                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              disabled={loading}
              onClick={loadCustomers}
              sx={{
                minHeight: 40,
                color: "#fff",
                borderColor: "rgba(255,255,255,0.12)",
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#00e676",
                  background: "rgba(0,230,118,0.05)",
                },
              }}
            >
              {loading ? "Memuat..." : "Refresh"}
            </Button>
          </Box>
        </Paper>

        {/* CUSTOMER TABLE */}
        <Paper
          sx={{
            overflow: "hidden",
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
            borderRadius: 2,
          }}
        >
          {/* TABLE HEADER */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                Daftar Pelanggan
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.42)",
                  fontSize: 12,
                  mt: 0.3,
                }}
              >
                Menampilkan {filteredCustomers.length} dari {customers.length}{" "}
                pelanggan
              </Typography>
            </Box>

            <Chip
              label={`${filteredCustomers.length} Data`}
              sx={{
                color: "#00e676",
                background: "rgba(0,230,118,0.08)",
                border: "1px solid rgba(0,230,118,0.18)",
                fontWeight: 800,
              }}
            />
          </Box>

          {/* DESKTOP TABLE */}
          <Box sx={{ display: { xs: "none", md: "block" }, overflowX: "auto" }}>
            <Box sx={{ minWidth: 950 }}>
              {/* TABLE COLUMN HEADER */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.5fr 1.3fr 1fr 1.1fr 120px",
                  px: 2.5,
                  py: 1.5,
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.015)",
                }}
              >
                {[
                  "PELANGGAN",
                  "KONTAK",
                  "BRANCH",
                  "STATUS",
                  "TERDAFTAR",
                  "AKSI",
                ].map((title) => (
                  <Typography
                    key={title}
                    sx={{
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: 1,
                      color: "rgba(255,255,255,0.38)",
                    }}
                  >
                    {title}
                  </Typography>
                ))}
              </Box>

              {filteredCustomers.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  canManage={canManage}
                  onDetail={() => openDetail(customer)}
                  onEdit={() => openEditDialog(customer)}
                  onToggle={() => openToggleConfirm(customer)}
                />
              ))}
            </Box>
          </Box>

          {/* MOBILE LIST */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            {filteredCustomers.map((customer) => (
              <MobileCustomerCard
                key={customer.id}
                customer={customer}
                canManage={canManage}
                onDetail={() => openDetail(customer)}
                onEdit={() => openEditDialog(customer)}
                onToggle={() => openToggleConfirm(customer)}
              />
            ))}
          </Box>

          {/* EMPTY STATE */}
          {filteredCustomers.length === 0 && (
            <Box
              sx={{
                py: 8,
                px: 3,
                textAlign: "center",
              }}
            >
              <PeopleAltRounded
                sx={{
                  fontSize: 46,
                  color: "rgba(255,255,255,0.14)",
                  mb: 1,
                }}
              />

              <Typography
                sx={{
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                Data pelanggan tidak ditemukan
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.35)",
                  mt: 0.5,
                }}
              >
                Coba ubah kata pencarian atau filter.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* CREATE / EDIT DIALOG */}
      <Dialog
        open={formOpen}
        onClose={closeForm}
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiDialog-paper": {
            background:
              "linear-gradient(145deg, #0f172a, #020617)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 2,
            color: "#fff",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            pt: 2.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: 20,
              }}
            >
              {editingCustomer
                ? "Edit Pelanggan"
                : "Tambah Pelanggan"}
            </Typography>

            <Typography
              sx={{
                fontSize: 12,
                color: "rgba(255,255,255,0.42)",
                mt: 0.5,
              }}
            >
              {editingCustomer
                ? `Mengubah data ${editingCustomer.customerCode}`
                : "Tambahkan pelanggan baru ke sistem Fiandra Net"}
            </Typography>
          </Box>

          <Button
            onClick={closeForm}
            sx={{
              minWidth: 38,
              width: 38,
              height: 38,
              color: "rgba(255,255,255,0.55)",
              borderRadius: 2,
              "&:hover": {
                color: "#fff",
                background: "rgba(255,255,255,0.06)",
              },
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
            <TextField
              fullWidth
              label="Nama Pelanggan"
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
            </Box>

            <FormControl fullWidth sx={fieldStyle}>
              <InputLabel>Branch</InputLabel>

              <Select
                value={form.branchId}
                label="Branch"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    branchId: event.target.value,
                  }))
                }
              >
                <MenuItem value="">Tanpa Branch</MenuItem>

                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name} ({branch.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={fieldStyle}>
              <InputLabel>Status</InputLabel>

              <Select
                value={form.status}
                label="Status"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as CustomerStatus,
                  }))
                }
              >
                <MenuItem value="PROSPECT">Prospek</MenuItem>
                <MenuItem value="ACTIVE">Aktif</MenuItem>
                <MenuItem value="SUSPENDED">
                  Ditangguhkan
                </MenuItem>
                <MenuItem value="INACTIVE">Tidak Aktif</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Alamat"
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  address: event.target.value,
                }))
              }
              sx={fieldStyle}
            />
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
            onClick={closeForm}
            disabled={saving}
            sx={{
              color: "rgba(255,255,255,0.65)",
              borderRadius: 2,
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
              : editingCustomer
                ? "Simpan Perubahan"
                : "Tambah Pelanggan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog
        open={detailOpen}
        onClose={closeDetail}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              background:
                "linear-gradient(145deg, #0f172a, #020617)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 2,
              color: "#fff",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
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
              Detail Pelanggan
            </Typography>

            <Typography
              sx={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                mt: 0.5,
              }}
            >
              Informasi pelanggan dan riwayat layanan
            </Typography>
          </Box>

          <Button
            onClick={closeDetail}
            sx={{
              minWidth: 38,
              width: 38,
              height: 38,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <CloseRounded />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 3 }}>
          {detailLoading && (
            <Box
              sx={{
                py: 7,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Memuat detail pelanggan...
              </Typography>
            </Box>
          )}

          {!detailLoading && detailCustomer && (
            <Box sx={{ display: "grid", gap: 2.5 }}>
              {/* PROFILE */}
              <Paper
                sx={{
                  p: 2,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 2,
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
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 2,
                      background: "rgba(0,230,118,0.10)",
                      color: "#00e676",
                    }}
                  >
                    <PeopleAltRounded />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: 17,
                      }}
                    >
                      {detailCustomer.name}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#00e676",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {detailCustomer.customerCode}
                    </Typography>
                  </Box>
                </Box>

                <Divider
                  sx={{
                    borderColor: "rgba(255,255,255,0.06)",
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
                    label="Nomor Telepon"
                    value={detailCustomer.phone}
                  />

                  <DetailItem
                    icon={<EmailRounded />}
                    label="Email"
                    value={detailCustomer.email || "-"}
                  />

                  <DetailItem
                    icon={<LocationOnRounded />}
                    label="Branch"
                    value={
                      detailCustomer.branch
                        ? `${detailCustomer.branch.name} (${detailCustomer.branch.code})`
                        : "-"
                    }
                  />

                  <DetailItem
                    icon={<CheckCircleRounded />}
                    label="Status"
                    value={
                      statusConfig[detailCustomer.status]?.label ??
                      detailCustomer.status
                    }
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.35)",
                      mb: 0.7,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    Alamat
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.72)",
                    }}
                  >
                    {detailCustomer.address}
                  </Typography>
                </Box>
              </Paper>

              {/* REGISTRATIONS */}
              <Paper
                sx={{
                  p: 2,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    mb: 1.5,
                  }}
                >
                  Riwayat Pendaftaran
                </Typography>

                {detailCustomer.registrations?.length ? (
                  <Box sx={{ display: "grid", gap: 1 }}>
                    {detailCustomer.registrations.map((registration) => (
                      <Box
                        key={registration.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          background: "rgba(255,255,255,0.025)",
                          border:
                            "1px solid rgba(255,255,255,0.05)",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                            }}
                          >
                            {registration.registrationCode}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.42)",
                              mt: 0.3,
                            }}
                          >
                            {registration.package?.name || "Paket -"}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={registration.status}
                          sx={{
                            color: "#00e676",
                            background:
                              "rgba(0,230,118,0.08)",
                            border:
                              "1px solid rgba(0,230,118,0.16)",
                            fontWeight: 800,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: 13,
                    }}
                  >
                    Belum ada riwayat pendaftaran.
                  </Typography>
                )}
              </Paper>

              {/* SUBSCRIPTIONS */}
              <Paper
                sx={{
                  p: 2,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    mb: 1.5,
                  }}
                >
                  Layanan Internet
                </Typography>

                {detailCustomer.subscriptions?.length ? (
                  <Box sx={{ display: "grid", gap: 1 }}>
                    {detailCustomer.subscriptions.map((subscription) => (
                      <Box
                        key={subscription.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          background: "rgba(255,255,255,0.025)",
                          border:
                            "1px solid rgba(255,255,255,0.05)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                            }}
                          >
                            {subscription.package?.name ||
                              "Paket Internet"}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.42)",
                              mt: 0.3,
                            }}
                          >
                            {subscription.package?.speed
                              ? `${subscription.package.speed} Mbps`
                              : "-"}{" "}
                            •{" "}
                            {formatPrice(
                              subscription.package?.price,
                            )}
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={subscription.status}
                          sx={{
                            color: "#00e676",
                            background:
                              "rgba(0,230,118,0.08)",
                            border:
                              "1px solid rgba(0,230,118,0.16)",
                            fontWeight: 800,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: 13,
                    }}
                  >
                    Belum ada layanan internet.
                  </Typography>
                )}
              </Paper>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* STATUS CONFIRMATION */}
      <Dialog
        open={confirmOpen}
        onClose={() => !saving && setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            background:
              "linear-gradient(145deg, #0f172a, #020617)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 2,
            color: "#fff",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
          }}
        >
          {customerToToggle?.status === "ACTIVE"
            ? "Nonaktifkan Pelanggan?"
            : "Aktifkan Pelanggan?"}
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {customerToToggle?.status === "ACTIVE"
              ? `Pelanggan "${customerToToggle?.name}" akan diubah menjadi tidak aktif.`
              : `Pelanggan "${customerToToggle?.name}" akan diaktifkan kembali.`}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            disabled={saving}
            onClick={() => setConfirmOpen(false)}
            sx={{
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Batal
          </Button>

          <Button
            disabled={saving}
            onClick={handleToggleStatus}
            sx={
              customerToToggle?.status === "ACTIVE"
                ? {
                    color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 2,
                  }
                : primaryButtonStyle
            }
          >
            {saving
              ? "Memproses..."
              : customerToToggle?.status === "ACTIVE"
                ? "Nonaktifkan"
                : "Aktifkan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

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
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 2,
        boxShadow: "0 25px 80px rgba(0,0,0,0.25)",
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
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
            fontSize: { xs: 20, md: 25 },
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
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   DESKTOP ROW
========================================================= */

function CustomerRow({
  customer,
  canManage,
  onDetail,
  onEdit,
  onToggle,
}: {
  customer: Customer;
  canManage: boolean;
  onDetail: () => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const config = statusConfig[customer.status];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "2fr 1.5fr 1.3fr 1fr 1.1fr 120px",
        px: 2.5,
        py: 1.7,
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "0.2s ease",
        "&:hover": {
          background: "rgba(255,255,255,0.025)",
        },
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 850,
            color: "#fff",
          }}
        >
          {customer.name}
        </Typography>

        <Typography
          sx={{
            fontSize: 11,
            color: "#00e676",
            mt: 0.35,
            fontWeight: 700,
          }}
        >
          {customer.customerCode}
        </Typography>
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 12,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {customer.phone}
        </Typography>

        <Typography
          sx={{
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
            mt: 0.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 170,
          }}
        >
          {customer.email || "Tidak ada email"}
        </Typography>
      </Box>

      <Typography
        sx={{
          fontSize: 12,
          color: "rgba(255,255,255,0.65)",
        }}
      >
        {customer.branch?.name || "-"}
      </Typography>

      <Box>
        <Chip
          size="small"
          label={config.label}
          sx={{
            height: 27,
            color: config.color,
            background: config.bg,
            border: `1px solid ${config.border}`,
            fontWeight: 800,
            fontSize: 10,
          }}
        />
      </Box>

      <Typography
        sx={{
          fontSize: 11,
          color: "rgba(255,255,255,0.42)",
        }}
      >
        {formatDate(customer.createdAt)}
      </Typography>

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

            {(customer.status === "ACTIVE" ||
              customer.status === "INACTIVE") && (
              <ActionButton
                title={
                  customer.status === "ACTIVE"
                    ? "Nonaktifkan"
                    : "Aktifkan"
                }
                onClick={onToggle}
                danger={customer.status === "ACTIVE"}
              >
                {customer.status === "ACTIVE" ? (
                  <BlockRounded fontSize="small" />
                ) : (
                  <CheckCircleRounded fontSize="small" />
                )}
              </ActionButton>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function MobileCustomerCard({
  customer,
  canManage,
  onDetail,
  onEdit,
  onToggle,
}: {
  customer: Customer;
  canManage: boolean;
  onDetail: () => void;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const config = statusConfig[customer.status];

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            {customer.name}
          </Typography>

          <Typography
            sx={{
              color: "#00e676",
              fontSize: 11,
              fontWeight: 700,
              mt: 0.3,
            }}
          >
            {customer.customerCode}
          </Typography>
        </Box>

        <Chip
          size="small"
          label={config.label}
          sx={{
            color: config.color,
            background: config.bg,
            border: `1px solid ${config.border}`,
            fontWeight: 800,
            fontSize: 9,
          }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 0.7,
          mt: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          📞 {customer.phone}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          📍 {customer.branch?.name || "Tanpa branch"}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 0.8,
          mt: 1.5,
        }}
      >
        <Button
          size="small"
          onClick={onDetail}
          startIcon={<VisibilityRounded />}
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
              onClick={onEdit}
              startIcon={<EditRounded />}
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

            {(customer.status === "ACTIVE" ||
              customer.status === "INACTIVE") && (
              <Button
                size="small"
                onClick={onToggle}
                sx={{
                  minWidth: 40,
                  color:
                    customer.status === "ACTIVE"
                      ? "#f87171"
                      : "#00e676",
                  border:
                    customer.status === "ACTIVE"
                      ? "1px solid rgba(239,68,68,0.18)"
                      : "1px solid rgba(0,230,118,0.18)",
                  borderRadius: 1.5,
                }}
              >
                {customer.status === "ACTIVE" ? (
                  <BlockRounded fontSize="small" />
                ) : (
                  <CheckCircleRounded fontSize="small" />
                )}
              </Button>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

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
      onClick={onClick}
      title={title}
      sx={{
        minWidth: 32,
        width: 32,
        height: 32,
        p: 0,
        color: danger ? "#f87171" : "rgba(255,255,255,0.55)",
        borderRadius: 1.5,
        "&:hover": {
          color: danger ? "#f87171" : "#00e676",
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

/* =========================================================
   DETAIL ITEM
========================================================= */

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
            color: "rgba(255,255,255,0.32)",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: "rgba(255,255,255,0.75)",
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