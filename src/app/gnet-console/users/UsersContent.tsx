"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { useMemo, useState } from "react";

type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEKNISI"
  | "CUSTOMER_SERVICE"
  | "FINANCE";

type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

type User = {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type CurrentUser = {
  id: number;
  name: string;
  username: string;
  role: string;
};

type Props = {
  user: CurrentUser;
  initialUsers?: User[];
};

type FormData = {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

const roleLabel: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TEKNISI: "Teknisi",
  CUSTOMER_SERVICE: "Customer Service",
  FINANCE: "Finance",
};

const statusLabel: Record<UserStatus, string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Nonaktif",
  SUSPENDED: "Ditangguhkan",
};

const emptyForm: FormData = {
  name: "",
  username: "",
  email: "",
  password: "",
  role: "TEKNISI",
  status: "ACTIVE",
};

export default function UsersContent({ user, initialUsers = [] }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [processingStatus, setProcessingStatus] = useState(false);

  const isSuperAdmin = user.role === "SUPER_ADMIN";

  async function loadUsers(showLoading = false) {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/users", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data user.");
      }

      setUsers(result.data ?? []);
    } catch (error) {
      console.error("LOAD USERS ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Gagal mengambil data user.",
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.username.toLowerCase().includes(keyword) ||
        (item.email ?? "").toLowerCase().includes(keyword) ||
        roleLabel[item.role].toLowerCase().includes(keyword);

      const matchesRole = roleFilter === "ALL" || item.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const activeCount = users.filter((item) => item.status === "ACTIVE").length;

  const inactiveCount = users.filter(
    (item) => item.status === "INACTIVE",
  ).length;

  const suspendedCount = users.filter(
    (item) => item.status === "SUSPENDED",
  ).length;

  function openCreateDialog() {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(item: User) {
    setEditingUser(item);

    setForm({
      name: item.name,
      username: item.username,
      email: item.email ?? "",
      password: "",
      role: item.role,
      status: item.status,
    });

    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving) return;

    setDialogOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
  }

  function handleFormChange(field: keyof FormData, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit() {
    setSaving(true);
    setError("");

    try {
      const payload: Record<string, string> = {
        name: form.name,
        username: form.username,
        email: form.email,
        role: form.role,
        status: form.status,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";

      const method = editingUser ? "PATCH" : "POST";

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
        throw new Error(result.message || "Gagal menyimpan data user.");
      }

      setSuccess(
        editingUser
          ? "Data user berhasil diperbarui."
          : "User berhasil ditambahkan.",
      );

      closeDialog();
      await loadUsers();
    } catch (error) {
      console.error("SAVE USER ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Gagal menyimpan data user.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openStatusDialog(item: User) {
    setSelectedUser(item);
    setConfirmOpen(true);
  }

  function closeStatusDialog() {
    if (processingStatus) return;

    setConfirmOpen(false);
    setSelectedUser(null);
  }

  async function handleStatusChange() {
    if (!selectedUser) return;

    setProcessingStatus(true);
    setError("");

    try {
      const newStatus: UserStatus =
        selectedUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengubah status user.");
      }

      setSuccess(
        newStatus === "ACTIVE"
          ? "User berhasil diaktifkan."
          : "User berhasil dinonaktifkan.",
      );

      closeStatusDialog();
      await loadUsers();
    } catch (error) {
      console.error("CHANGE USER STATUS ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Gagal mengubah status user.",
      );
    } finally {
      setProcessingStatus(false);
    }
  }

  function getStatusColor(status: UserStatus) {
    if (status === "ACTIVE") {
      return "#00e676";
    }

    if (status === "SUSPENDED") {
      return "#fbbf24";
    }

    return "#94a3b8";
  }

  function getStatusBackground(status: UserStatus) {
    if (status === "ACTIVE") {
      return "rgba(0,230,118,0.08)";
    }

    if (status === "SUSPENDED") {
      return "rgba(251,191,36,0.08)";
    }

    return "rgba(148,163,184,0.08)";
  }

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase();
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
            flexDirection: {
              xs: "column",
              md: "row",
            },
            justifyContent: "space-between",
            alignItems: {
              xs: "flex-start",
              md: "center",
            },
            gap: 2,
            mb: 4,
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
                width: 54,
                height: 54,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg, rgba(0,230,118,0.2), rgba(0,230,118,0.04))",
                border: "1px solid rgba(0,230,118,0.2)",
                boxShadow: "0 10px 30px rgba(0,230,118,0.08)",
                flexShrink: 0,
              }}
            >
              <PeopleAltRoundedIcon
                sx={{
                  color: "#00e676",
                  fontSize: 29,
                }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: 24,
                    md: 30,
                  },
                  fontWeight: 800,
                  letterSpacing: "-0.6px",
                }}
              >
                Manajemen User
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 14,
                  mt: 0.5,
                }}
              >
                Kelola akun dan hak akses pengguna Golden Net
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,0.42)",
                fontSize: 13,
              }}
            >
              Login sebagai
            </Typography>

            <Chip
              label={`${user.username} • ${roleLabel[user.role as UserRole] ?? user.role}`}
              size="small"
              sx={{
                color: "#00e676",
                background: "rgba(0,230,118,0.08)",
                border: "1px solid rgba(0,230,118,0.15)",
                fontWeight: 700,
              }}
            />
          </Box>
        </Box>

        {/* STATISTICS */}
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
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: "rgba(15,23,42,0.72)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "rgba(255,255,255,0.42)",
              }}
            >
              Total User
            </Typography>

            <Typography
              sx={{
                mt: 0.7,
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {users.length}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: "rgba(15,23,42,0.72)",
              border: "1px solid rgba(0,230,118,0.1)",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "rgba(255,255,255,0.42)",
              }}
            >
              User Aktif
            </Typography>

            <Typography
              sx={{
                mt: 0.7,
                fontSize: 28,
                fontWeight: 800,
                color: "#00e676",
              }}
            >
              {activeCount}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: "rgba(15,23,42,0.72)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "rgba(255,255,255,0.42)",
              }}
            >
              Nonaktif / Suspend
            </Typography>

            <Typography
              sx={{
                mt: 0.7,
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {inactiveCount + suspendedCount}
            </Typography>
          </Paper>
        </Box>

        {/* MAIN CARD */}
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: 4,
            background:
              "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
          }}
        >
          {/* TOOLBAR */}
          <Box
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  lg: "row",
                },
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  Daftar Pengguna
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.42)",
                  }}
                >
                  Kelola seluruh akun yang memiliki akses ke sistem.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: {
                    xs: "column",
                    sm: "row",
                  },
                  gap: 1.5,
                  width: {
                    xs: "100%",
                    lg: "auto",
                  },
                }}
              >
                <TextField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari user..."
                  size="small"
                  sx={{
                    width: {
                      xs: "100%",
                      sm: 240,
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      borderRadius: 2.5,
                      background: "rgba(255,255,255,0.03)",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(0,230,118,0.35)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#00e676",
                      },
                    },
                    "& input::placeholder": {
                      color: "rgba(255,255,255,0.32)",
                      opacity: 1,
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon
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

                <FormControl
                  size="small"
                  sx={{
                    minWidth: 150,
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      borderRadius: 2.5,
                      background: "rgba(255,255,255,0.03)",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255,255,255,0.4)",
                    },
                  }}
                >
                  <InputLabel>Role</InputLabel>

                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={(event) => setRoleFilter(event.target.value)}
                  >
                    <MenuItem value="ALL">Semua Role</MenuItem>
                    <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="TEKNISI">Teknisi</MenuItem>
                    <MenuItem value="CUSTOMER_SERVICE">
                      Customer Service
                    </MenuItem>
                    <MenuItem value="FINANCE">Finance</MenuItem>
                  </Select>
                </FormControl>

                <FormControl
                  size="small"
                  sx={{
                    minWidth: 145,
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      borderRadius: 2.5,
                      background: "rgba(255,255,255,0.03)",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255,255,255,0.4)",
                    },
                  }}
                >
                  <InputLabel>Status</InputLabel>

                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <MenuItem value="ALL">Semua Status</MenuItem>
                    <MenuItem value="ACTIVE">Aktif</MenuItem>
                    <MenuItem value="INACTIVE">Nonaktif</MenuItem>
                    <MenuItem value="SUSPENDED">Ditangguhkan</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={openCreateDialog}
                  sx={{
                    minHeight: 40,
                    borderRadius: 2.5,
                    px: 2,
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #00e676, #00b85c)",
                    color: "#001b0d",
                    boxShadow: "0 10px 25px rgba(0,230,118,0.15)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #19ff88, #00d96b)",
                    },
                  }}
                >
                  Tambah User
                </Button>
              </Box>
            </Box>
          </Box>

          {/* ERROR */}
          {error && (
            <Box sx={{ p: 2.5 }}>
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            </Box>
          )}

          {/* LOADING */}
          {loading ? (
            <Box
              sx={{
                minHeight: 360,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress
                size={34}
                sx={{
                  color: "#00e676",
                }}
              />
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Box
                component="table"
                sx={{
                  width: "100%",
                  minWidth: 1050,
                  borderCollapse: "collapse",

                  "& th": {
                    textAlign: "left",
                    px: 3,
                    py: 2,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    whiteSpace: "nowrap",
                  },

                  "& td": {
                    px: 3,
                    py: 2.2,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  },

                  "& tbody tr:hover": {
                    background: "rgba(255,255,255,0.025)",
                  },
                }}
              >
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Login Terakhir</th>
                    <th align="right">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((item) => {
                    const isSelf = item.id === user.id;

                    const canModify = !(
                      item.role === "SUPER_ADMIN" && !isSuperAdmin
                    );

                    const canToggle = !isSelf && canModify;

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
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "rgba(0,230,118,0.1)",
                                border: "1px solid rgba(0,230,118,0.12)",
                                color: "#00e676",
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {getInitial(item.name)}
                            </Box>

                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: 14,
                                }}
                              >
                                {item.name}
                              </Typography>

                              <Typography
                                sx={{
                                  fontSize: 12,
                                  color: "rgba(255,255,255,0.38)",
                                }}
                              >
                                @{item.username}
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
                            {item.email || "-"}
                          </Typography>
                        </td>

                        <td>
                          <Chip
                            label={roleLabel[item.role]}
                            size="small"
                            sx={{
                              color:
                                item.role === "SUPER_ADMIN"
                                  ? "#f4c542"
                                  : "#00e676",
                              background:
                                item.role === "SUPER_ADMIN"
                                  ? "rgba(244,197,66,0.08)"
                                  : "rgba(0,230,118,0.08)",
                              border:
                                item.role === "SUPER_ADMIN"
                                  ? "1px solid rgba(244,197,66,0.16)"
                                  : "1px solid rgba(0,230,118,0.12)",
                              fontWeight: 700,
                            }}
                          />
                        </td>

                        <td>
                          <Chip
                            label={statusLabel[item.status]}
                            size="small"
                            sx={{
                              color: getStatusColor(item.status),
                              background: getStatusBackground(item.status),
                              border: `1px solid ${getStatusColor(item.status)}22`,
                              fontWeight: 700,
                            }}
                          />
                        </td>

                        <td>
                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "rgba(255,255,255,0.42)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.lastLoginAt
                              ? new Date(item.lastLoginAt).toLocaleString(
                                  "id-ID",
                                )
                              : "Belum pernah login"}
                          </Typography>
                        </td>

                        <td>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 1,
                            }}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditRoundedIcon />}
                              disabled={!canModify}
                              onClick={() => openEditDialog(item)}
                              sx={{
                                borderRadius: 2,
                                minWidth: 0,
                                color: "rgba(255,255,255,0.75)",
                                borderColor: "rgba(255,255,255,0.1)",
                                "&:hover": {
                                  borderColor: "rgba(0,230,118,0.4)",
                                  color: "#00e676",
                                },
                              }}
                            >
                              Edit
                            </Button>

                            {item.status === "ACTIVE" ? (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<BlockRoundedIcon />}
                                disabled={!canToggle}
                                onClick={() => openStatusDialog(item)}
                                sx={{
                                  borderRadius: 2,
                                  minWidth: 0,
                                  color: "#f87171",
                                  borderColor: "rgba(248,113,113,0.2)",
                                  "&:hover": {
                                    borderColor: "rgba(248,113,113,0.5)",
                                  },
                                }}
                              >
                                Nonaktifkan
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<CheckCircleRoundedIcon />}
                                disabled={!canToggle}
                                onClick={() => openStatusDialog(item)}
                                sx={{
                                  borderRadius: 2,
                                  minWidth: 0,
                                  color: "#00e676",
                                  borderColor: "rgba(0,230,118,0.18)",
                                  "&:hover": {
                                    borderColor: "rgba(0,230,118,0.5)",
                                  },
                                }}
                              >
                                Aktifkan
                              </Button>
                            )}
                          </Box>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <Box
                          sx={{
                            py: 9,
                            textAlign: "center",
                          }}
                        >
                          <PeopleAltRoundedIcon
                            sx={{
                              fontSize: 42,
                              color: "rgba(255,255,255,0.12)",
                              mb: 1,
                            }}
                          />

                          <Typography
                            sx={{
                              color: "rgba(255,255,255,0.4)",
                              fontWeight: 600,
                            }}
                          >
                            Tidak ada user yang ditemukan.
                          </Typography>
                        </Box>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Box>
            </Box>
          )}
        </Paper>
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
              borderRadius: 4,
              background: "linear-gradient(145deg, #0f172a, #020617)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              boxShadow: "0 30px 100px rgba(0,0,0,0.55)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
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
                  fontSize: 21,
                  fontWeight: 800,
                }}
              >
                {editingUser ? "Edit User" : "Tambah User"}
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.42)",
                  mt: 0.5,
                }}
              >
                {editingUser
                  ? "Perbarui informasi dan hak akses user."
                  : "Buat akun baru untuk sistem Golden Net."}
              </Typography>
            </Box>

            <Button
              onClick={closeDialog}
              disabled={saving}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: 2,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <CloseRoundedIcon />
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gap: 2,
              mt: 1,
            }}
          >
            <TextField
              label="Nama Lengkap"
              value={form.name}
              onChange={(event) => handleFormChange("name", event.target.value)}
              fullWidth
              disabled={saving}
              sx={fieldStyle}
            />

            <TextField
              label="Username"
              value={form.username}
              onChange={(event) =>
                handleFormChange("username", event.target.value)
              }
              fullWidth
              disabled={saving}
              helperText={
                editingUser
                  ? "Username dapat diubah jika diperlukan."
                  : "3-50 karakter. Gunakan huruf, angka, titik, underscore atau tanda hubung."
              }
              sx={fieldStyle}
            />

            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                handleFormChange("email", event.target.value)
              }
              fullWidth
              disabled={saving}
              sx={fieldStyle}
            />

            <TextField
              label={editingUser ? "Password Baru (opsional)" : "Password"}
              type="password"
              value={form.password}
              onChange={(event) =>
                handleFormChange("password", event.target.value)
              }
              fullWidth
              disabled={saving}
              helperText={
                editingUser
                  ? "Kosongkan jika password tidak ingin diubah."
                  : "Minimal 8 karakter."
              }
              sx={fieldStyle}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockResetRoundedIcon
                        sx={{
                          color: "rgba(255,255,255,0.3)",
                        }}
                      />
                    </InputAdornment>
                  ),
                },
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
              <FormControl fullWidth sx={fieldStyle}>
                <InputLabel>Role</InputLabel>

                <Select
                  value={form.role}
                  label="Role"
                  disabled={saving}
                  onChange={(event) =>
                    handleFormChange("role", event.target.value)
                  }
                >
                  {isSuperAdmin && (
                    <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                  )}

                  <MenuItem value="ADMIN">Admin</MenuItem>

                  <MenuItem value="TEKNISI">Teknisi</MenuItem>

                  <MenuItem value="CUSTOMER_SERVICE">Customer Service</MenuItem>

                  <MenuItem value="FINANCE">Finance</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={fieldStyle}>
                <InputLabel>Status</InputLabel>

                <Select
                  value={form.status}
                  label="Status"
                  disabled={saving}
                  onChange={(event) =>
                    handleFormChange("status", event.target.value)
                  }
                >
                  <MenuItem value="ACTIVE">Aktif</MenuItem>

                  <MenuItem value="INACTIVE">Nonaktif</MenuItem>

                  <MenuItem value="SUSPENDED">Ditangguhkan</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
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
              color: "rgba(255,255,255,0.55)",
              borderRadius: 2.5,
              px: 2,
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
              ) : editingUser ? (
                <EditRoundedIcon />
              ) : (
                <AddRoundedIcon />
              )
            }
            sx={{
              borderRadius: 2.5,
              px: 2.5,
              fontWeight: 800,
              background: "linear-gradient(135deg, #00e676, #00b85c)",
              color: "#001b0d",
              "&:hover": {
                background: "linear-gradient(135deg, #19ff88, #00d96b)",
              },
            }}
          >
            {saving
              ? "Menyimpan..."
              : editingUser
                ? "Simpan Perubahan"
                : "Buat User"}
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
          {selectedUser?.status === "ACTIVE"
            ? "Nonaktifkan User?"
            : "Aktifkan User?"}
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.58)",
              lineHeight: 1.7,
            }}
          >
            {selectedUser?.status === "ACTIVE"
              ? `Akun @${selectedUser?.username} tidak akan dapat login setelah dinonaktifkan.`
              : `Akun @${selectedUser?.username} akan dapat login kembali setelah diaktifkan.`}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={closeStatusDialog}
            disabled={processingStatus}
            sx={{
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={handleStatusChange}
            disabled={processingStatus}
            sx={{
              borderRadius: 2.5,
              fontWeight: 800,
              background:
                selectedUser?.status === "ACTIVE" ? "#dc2626" : "#00e676",
              color: selectedUser?.status === "ACTIVE" ? "#fff" : "#001b0d",
              "&:hover": {
                background:
                  selectedUser?.status === "ACTIVE" ? "#b91c1c" : "#00d96b",
              },
            }}
          >
            {processingStatus
              ? "Memproses..."
              : selectedUser?.status === "ACTIVE"
                ? "Nonaktifkan"
                : "Aktifkan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUCCESS */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3500}
        onClose={() => setSuccess("")}
        message={success}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      />
    </Box>
  );
}

const fieldStyle = {
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.45)",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#00e676",
  },

  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: 2.5,
    background: "rgba(255,255,255,0.025)",

    "& fieldset": {
      borderColor: "rgba(255,255,255,0.1)",
    },

    "&:hover fieldset": {
      borderColor: "rgba(0,230,118,0.35)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#00e676",
    },
  },

  "& .MuiFormHelperText-root": {
    color: "rgba(255,255,255,0.32)",
  },
};
