"use client";

import {
  Add,
  Business,
  CheckCircle,
  Close,
  Edit,
  LocationOn,
  Refresh,
  Search,
  Visibility,
  Block,
} from "@mui/icons-material";
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
  InputAdornment,
  MenuItem,
  Paper,
  Select,
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

type Branch = {
  id: number;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
};

type CoverageArea = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  branchId: number;
  createdAt: string;
  updatedAt: string;
  branch: Branch;
};

type CoverageForm = {
  name: string;
  description: string;
  branchId: string;
  isActive: boolean;
};

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
};

const emptyForm: CoverageForm = {
  name: "",
  description: "",
  branchId: "",
  isActive: true,
};

const fieldStyle = {
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.65)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#00e676",
  },
  "& .MuiOutlinedInput-root": {
    color: "#f8fafc",
    background: "rgba(2,6,23,0.65)",
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

const primaryButtonSx = {
  borderRadius: 2,
  px: 2.5,
  fontWeight: 800,
  background: "linear-gradient(135deg, #00e676, #00b85c)",
  color: "#001b0d",
  boxShadow: "0 8px 25px rgba(0,230,118,0.18)",
  "&:hover": {
    background: "linear-gradient(135deg, #19ff88, #00d96b)",
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function CoverageAreasContent() {
  const [coverageAreas, setCoverageAreas] = useState<CoverageArea[]>([]);

  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState(true);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [selectedCoverage, setSelectedCoverage] = useState<CoverageArea | null>(
    null,
  );

  const [form, setForm] = useState<CoverageForm>(emptyForm);

  const [saving, setSaving] = useState(false);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (
    message: string,
    severity: SnackbarState["severity"] = "success",
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const loadCoverageAreas = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (branchFilter !== "all") {
        params.set("branchId", branchFilter);
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/coverage/admin?${params.toString()}`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data coverage.");
      }

      setCoverageAreas(result.data ?? []);
    } catch (error) {
      console.error(error);

      showSnackbar(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data coverage.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [branchFilter, search, statusFilter]);

  const loadBranches = useCallback(async () => {
    try {
      setBranchesLoading(true);

      const response = await fetch("/api/branches?admin=true", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data cabang.");
      }

      setBranches(result.data ?? []);
    } catch (error) {
      console.error(error);

      showSnackbar(
        error instanceof Error ? error.message : "Gagal mengambil data cabang.",
        "error",
      );
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCoverageAreas();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadCoverageAreas]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBranches();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadBranches]);

  const statistics = useMemo(() => {
    const total = coverageAreas.length;
    const active = coverageAreas.filter((item) => item.isActive).length;

    return {
      total,
      active,
      inactive: total - active,
    };
  }, [coverageAreas]);

  const activeBranches = useMemo(
    () => branches.filter((branch) => branch.isActive),
    [branches],
  );

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (coverage: CoverageArea) => {
    setEditingId(coverage.id);

    setForm({
      name: coverage.name,
      description: coverage.description ?? "",
      branchId: String(coverage.branchId),
      isActive: coverage.isActive,
    });

    setDialogOpen(true);
  };

  const openDetailDialog = (coverage: CoverageArea) => {
    setSelectedCoverage(coverage);
    setDetailOpen(true);
  };

  const closeFormDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showSnackbar("Nama area wajib diisi.", "error");
      return;
    }

    if (!form.branchId) {
      showSnackbar("Cabang wajib dipilih.", "error");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        branchId: Number(form.branchId),
        isActive: form.isActive,
      };

      const url = editingId
        ? `/api/coverage/${editingId}`
        : "/api/coverage/admin";

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan coverage.");
      }

      showSnackbar(
        editingId
          ? "Coverage area berhasil diperbarui."
          : "Coverage area berhasil ditambahkan.",
      );

      closeFormDialog();

      await loadCoverageAreas();
    } catch (error) {
      console.error(error);

      showSnackbar(
        error instanceof Error ? error.message : "Gagal menyimpan coverage.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleCoverage = async (coverage: CoverageArea) => {
    const nextStatus = !coverage.isActive;

    const action = nextStatus ? "mengaktifkan" : "menonaktifkan";

    const confirmed = window.confirm(
      `Yakin ingin ${action} coverage "${coverage.name}"?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/coverage/${coverage.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Gagal ${action} coverage.`);
      }

      showSnackbar(
        nextStatus
          ? "Coverage berhasil diaktifkan."
          : "Coverage berhasil dinonaktifkan.",
      );

      await loadCoverageAreas();
    } catch (error) {
      console.error(error);

      showSnackbar(
        error instanceof Error ? error.message : `Gagal ${action} coverage.`,
        "error",
      );
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        color: "#f8fafc",
        pl: {
          xs: 0,
          sm: 1,
          md: 2,
          lg: 3,
        },
        pb: 4,
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 2,
          pt: {
            xs: 2,
            sm: 2.5,
            md: 3,
            lg: 3,
          },
          mb: {
            xs: 3,
            md: 4,
          },
          flexDirection: {
            xs: "column",
            sm: "row",
          },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2.2,
              color: "#00e676",
              mb: 0.8,
            }}
          >
            FIANDRA NET / NETWORK MANAGEMENT
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: 28,
                md: 34,
              },
              fontWeight: 900,
              letterSpacing: -1,
              lineHeight: 1.1,
            }}
          >
            Coverage Area
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.55)",
              mt: 1,
              fontSize: 14,
            }}
          >
            Kelola wilayah layanan internet Fiandra Net berdasarkan cabang.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.2,
            width: {
              xs: "100%",
              sm: "auto",
            },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => void loadCoverageAreas()}
            sx={{
              minHeight: 44,
              borderRadius: 2,
              borderColor: "rgba(255,255,255,0.12)",
              color: "#fff",
              "&:hover": {
                borderColor: "rgba(0,230,118,0.5)",
                background: "rgba(0,230,118,0.05)",
              },
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreateDialog}
            sx={{
              ...primaryButtonSx,
              flex: {
                xs: 1,
                sm: "initial",
              },
            }}
          >
            Tambah Coverage
          </Button>
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
        <StatCard
          icon={<LocationOn />}
          label="Total Coverage"
          value={statistics.total}
          description="Seluruh area terdaftar"
        />

        <StatCard
          icon={<CheckCircle />}
          label="Coverage Aktif"
          value={statistics.active}
          description="Wilayah siap dilayani"
          accent
        />

        <StatCard
          icon={<Block />}
          label="Coverage Nonaktif"
          value={statistics.inactive}
          description="Wilayah sementara tidak aktif"
        />
      </Box>

      {/* MAIN CARD */}
      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.07)",
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))",
          boxShadow: "0 25px 80px rgba(0,0,0,0.35)",
        }}
      >
        {/* TOOLBAR */}
        <Box
          sx={{
            p: {
              xs: 2,
              md: 2.5,
            },
            display: "flex",
            gap: 1.5,
            flexDirection: {
              xs: "column",
              md: "row",
            },
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Cari area, deskripsi, atau cabang..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={fieldStyle}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      sx={{
                        color: "rgba(255,255,255,0.4)",
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Select
            size="small"
            value={branchFilter}
            onChange={(event) => setBranchFilter(event.target.value)}
            displayEmpty
            sx={{
              minWidth: {
                xs: "100%",
                md: 190,
              },
              color: "#fff",
              background: "rgba(2,6,23,0.65)",
              borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.10)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(0,230,118,0.45)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#00e676",
              },
              "& .MuiSvgIcon-root": {
                color: "#fff",
              },
            }}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: {
                    background: "#0f172a",
                    color: "#fff",
                  },
                },
              },
            }}
          >
            <MenuItem value="all">Semua Cabang</MenuItem>

            {branches.map((branch) => (
              <MenuItem key={branch.id} value={String(branch.id)}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            sx={{
              minWidth: {
                xs: "100%",
                md: 160,
              },
              color: "#fff",
              background: "rgba(2,6,23,0.65)",
              borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.10)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(0,230,118,0.45)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#00e676",
              },
              "& .MuiSvgIcon-root": {
                color: "#fff",
              },
            }}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: {
                    background: "#0f172a",
                    color: "#fff",
                  },
                },
              },
            }}
          >
            <MenuItem value="all">Semua Status</MenuItem>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="inactive">Nonaktif</MenuItem>
          </Select>
        </Box>

        <Divider
          sx={{
            borderColor: "rgba(255,255,255,0.06)",
          }}
        />

        {/* DESKTOP TABLE */}
        <TableContainer
          sx={{
            display: {
              xs: "none",
              md: "block",
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={headerCellSx}>AREA</TableCell>

                <TableCell sx={headerCellSx}>CABANG</TableCell>

                <TableCell sx={headerCellSx}>DESKRIPSI</TableCell>

                <TableCell sx={headerCellSx}>STATUS</TableCell>

                <TableCell sx={headerCellSx}>DIBUAT</TableCell>

                <TableCell align="right" sx={headerCellSx}>
                  AKSI
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      py: 8,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    <CircularProgress
                      size={28}
                      sx={{
                        color: "#00e676",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : coverageAreas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{
                      py: 8,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    <LocationOn
                      sx={{
                        fontSize: 42,
                        opacity: 0.3,
                        mb: 1,
                      }}
                    />

                    <Typography>Belum ada data coverage area.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                coverageAreas.map((coverage) => (
                  <TableRow
                    key={coverage.id}
                    sx={{
                      "&:hover": {
                        background: "rgba(255,255,255,0.025)",
                      },
                    }}
                  >
                    <TableCell sx={bodyCellSx}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.3,
                        }}
                      >
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(0,230,118,0.08)",
                            border: "1px solid rgba(0,230,118,0.12)",
                          }}
                        >
                          <LocationOn
                            sx={{
                              fontSize: 19,
                              color: "#00e676",
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: 14,
                            }}
                          >
                            {coverage.name}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "rgba(255,255,255,0.4)",
                              mt: 0.3,
                            }}
                          >
                            ID #{coverage.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {coverage.branch.name}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "#00e676",
                            mt: 0.3,
                          }}
                        >
                          {coverage.branch.code}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        maxWidth: 280,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.62)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {coverage.description || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <StatusChip active={coverage.isActive} />
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        {formatDate(coverage.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        <IconButton
                          onClick={() => openDetailDialog(coverage)}
                          sx={iconButtonSx}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>

                        <IconButton
                          onClick={() => openEditDialog(coverage)}
                          sx={iconButtonSx}
                        >
                          <Edit fontSize="small" />
                        </IconButton>

                        <IconButton
                          onClick={() => void toggleCoverage(coverage)}
                          sx={{
                            ...iconButtonSx,
                            color: coverage.isActive ? "#f59e0b" : "#00e676",
                          }}
                        >
                          {coverage.isActive ? (
                            <Block fontSize="small" />
                          ) : (
                            <CheckCircle fontSize="small" />
                          )}
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* MOBILE */}
        <Box
          sx={{
            display: {
              xs: "block",
              md: "none",
            },
            p: 1.5,
          }}
        >
          {loading ? (
            <Box
              sx={{
                py: 7,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <CircularProgress
                size={30}
                sx={{
                  color: "#00e676",
                }}
              />
            </Box>
          ) : coverageAreas.length === 0 ? (
            <Box
              sx={{
                py: 7,
                textAlign: "center",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <LocationOn
                sx={{
                  fontSize: 42,
                  opacity: 0.3,
                }}
              />

              <Typography sx={{ mt: 1 }}>
                Belum ada data coverage area.
              </Typography>
            </Box>
          ) : (
            coverageAreas.map((coverage) => (
              <Paper
                key={coverage.id}
                elevation={0}
                sx={{
                  mb: 1.5,
                  p: 2,
                  borderRadius: 2.5,
                  background: "rgba(15,23,42,0.75)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.2,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,230,118,0.08)",
                      }}
                    >
                      <LocationOn
                        sx={{
                          color: "#00e676",
                        }}
                      />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        {coverage.name}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#00e676",
                          fontSize: 11,
                          mt: 0.3,
                        }}
                      >
                        {coverage.branch.code} · {coverage.branch.name}
                      </Typography>
                    </Box>
                  </Box>

                  <StatusChip active={coverage.isActive} />
                </Box>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.5)",
                    mt: 1.5,
                  }}
                >
                  {coverage.description || "Tidak ada deskripsi."}
                </Typography>

                <Divider
                  sx={{
                    my: 1.5,
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    Dibuat {formatDate(coverage.createdAt)}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                    }}
                  >
                    <IconButton
                      onClick={() => openDetailDialog(coverage)}
                      sx={iconButtonSx}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>

                    <IconButton
                      onClick={() => openEditDialog(coverage)}
                      sx={iconButtonSx}
                    >
                      <Edit fontSize="small" />
                    </IconButton>

                    <IconButton
                      onClick={() => void toggleCoverage(coverage)}
                      sx={{
                        ...iconButtonSx,
                        color: coverage.isActive ? "#f59e0b" : "#00e676",
                      }}
                    >
                      {coverage.isActive ? (
                        <Block fontSize="small" />
                      ) : (
                        <CheckCircle fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))
          )}
        </Box>
      </Paper>

      {/* CREATE / EDIT DIALOG */}
      <Dialog
        open={dialogOpen}
        onClose={closeFormDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              background: "linear-gradient(145deg, #0f172a, #020617)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
              color: "#fff",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 900,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 19,
                fontWeight: 900,
              }}
            >
              {editingId ? "Edit Coverage Area" : "Tambah Coverage Area"}
            </Typography>

            <Typography
              sx={{
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                mt: 0.5,
              }}
            >
              Tentukan wilayah layanan Fiandra Net.
            </Typography>
          </Box>

          <IconButton
            onClick={closeFormDialog}
            sx={{
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              pt: 1,
            }}
          >
            <TextField
              fullWidth
              label="Nama Area"
              placeholder="Contoh: Biaro"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              sx={fieldStyle}
            />

            <TextField
              fullWidth
              select
              label="Cabang"
              value={form.branchId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  branchId: event.target.value,
                }))
              }
              sx={fieldStyle}
              disabled={branchesLoading}
              helperText={
                branchesLoading
                  ? "Memuat data cabang..."
                  : "Coverage harus terhubung ke cabang aktif."
              }
              slotProps={{
                formHelperText: {
                  sx: {
                    color: "rgba(255,255,255,0.4)",
                  },
                },
              }}
            >
              {activeBranches.length === 0 ? (
                <MenuItem disabled>Tidak ada cabang aktif</MenuItem>
              ) : (
                activeBranches.map((branch) => (
                  <MenuItem key={branch.id} value={String(branch.id)}>
                    {branch.name} ({branch.code})
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Deskripsi"
              placeholder="Contoh: Wilayah layanan sekitar Biaro dan sekitarnya."
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              sx={fieldStyle}
              helperText={`${form.description.length}/500`}
              slotProps={{
                formHelperText: {
                  sx: {
                    color: "rgba(255,255,255,0.4)",
                  },
                },
              }}
            />

            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.55)",
                  mb: 1,
                }}
              >
                Status Coverage
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                }}
              >
                <Button
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      isActive: true,
                    }))
                  }
                  variant={form.isActive ? "contained" : "outlined"}
                  sx={{
                    ...(form.isActive
                      ? primaryButtonSx
                      : {
                          color: "rgba(255,255,255,0.65)",
                          borderColor: "rgba(255,255,255,0.12)",
                        }),
                  }}
                >
                  Aktif
                </Button>

                <Button
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      isActive: false,
                    }))
                  }
                  variant={!form.isActive ? "contained" : "outlined"}
                  sx={{
                    ...(!form.isActive
                      ? {
                          borderRadius: 2,
                          fontWeight: 800,
                          background: "rgba(245,158,11,0.16)",
                          color: "#fbbf24",
                        }
                      : {
                          color: "rgba(255,255,255,0.65)",
                          borderColor: "rgba(255,255,255,0.12)",
                        }),
                  }}
                >
                  Nonaktif
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            gap: 1,
          }}
        >
          <Button
            onClick={closeFormDialog}
            disabled={saving}
            sx={{
              color: "rgba(255,255,255,0.65)",
              borderRadius: 2,
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={saving || !form.name.trim() || !form.branchId}
            sx={primaryButtonSx}
          >
            {saving ? (
              <CircularProgress
                size={20}
                sx={{
                  color: "#001b0d",
                }}
              />
            ) : editingId ? (
              "Simpan Perubahan"
            ) : (
              "Tambah Coverage"
            )}
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
              background: "linear-gradient(145deg, #0f172a, #020617)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 3,
              color: "#fff",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 900,
          }}
        >
          Detail Coverage
          <IconButton
            onClick={() => setDetailOpen(false)}
            sx={{
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {selectedCoverage && (
            <Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  background: "rgba(0,230,118,0.05)",
                  border: "1px solid rgba(0,230,118,0.10)",
                  mb: 2,
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
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,230,118,0.10)",
                    }}
                  >
                    <LocationOn
                      sx={{
                        color: "#00e676",
                        fontSize: 26,
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: 20,
                        fontWeight: 900,
                      }}
                    >
                      {selectedCoverage.name}
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 12,
                      }}
                    >
                      Coverage #{selectedCoverage.id}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <DetailRow
                icon={<Business />}
                label="Cabang"
                value={`${selectedCoverage.branch.name} (${selectedCoverage.branch.code})`}
              />

              <DetailRow
                icon={<LocationOn />}
                label="Alamat Cabang"
                value={selectedCoverage.branch.address || "—"}
              />

              <DetailRow
                icon={<CheckCircle />}
                label="Status"
                value={selectedCoverage.isActive ? "Aktif" : "Nonaktif"}
              />

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.025)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "rgba(255,255,255,0.4)",
                    mb: 0.8,
                  }}
                >
                  Deskripsi
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {selectedCoverage.description || "Tidak ada deskripsi."}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                  mt: 2,
                }}
              >
                <InfoBox
                  label="Dibuat"
                  value={formatDate(selectedCoverage.createdAt)}
                />

                <InfoBox
                  label="Diperbarui"
                  value={formatDate(selectedCoverage.updatedAt)}
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
          }}
        >
          <Button
            onClick={() => setDetailOpen(false)}
            sx={{
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
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

function StatCard({
  icon,
  label,
  value,
  description,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  accent?: boolean;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        borderRadius: 2.5,
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.94), rgba(2,6,23,0.98))",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1,
              color: "rgba(255,255,255,0.42)",
              textTransform: "uppercase",
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              fontSize: 30,
              fontWeight: 900,
              lineHeight: 1,
              mt: 1,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              mt: 1,
            }}
          >
            {description}
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
            background: accent
              ? "rgba(0,230,118,0.10)"
              : "rgba(255,255,255,0.04)",
            color: accent ? "#00e676" : "rgba(255,255,255,0.55)",
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

function StatusChip({ active }: { active: boolean }) {
  return (
    <Chip
      size="small"
      label={active ? "Aktif" : "Nonaktif"}
      icon={
        active ? (
          <CheckCircle
            sx={{
              fontSize: "15px !important",
            }}
          />
        ) : (
          <Block
            sx={{
              fontSize: "15px !important",
            }}
          />
        )
      }
      sx={{
        height: 26,
        fontSize: 11,
        fontWeight: 800,
        background: active ? "rgba(0,230,118,0.10)" : "rgba(245,158,11,0.10)",
        color: active ? "#00e676" : "#fbbf24",
        "& .MuiChip-icon": {
          color: "inherit",
        },
      }}
    />
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        py: 1.3,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Box
        sx={{
          color: "rgba(0,230,118,0.8)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 10,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            color: "rgba(255,255,255,0.75)",
            mt: 0.3,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        background: "rgba(255,255,255,0.025)",
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 12,
          color: "rgba(255,255,255,0.65)",
          mt: 0.5,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

const headerCellSx = {
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.35)",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: 1,
  whiteSpace: "nowrap",
};

const bodyCellSx = {
  borderBottom: "1px solid rgba(255,255,255,0.045)",
  color: "#fff",
  py: 1.6,
};

const iconButtonSx = {
  width: 34,
  height: 34,
  borderRadius: 1.5,
  color: "rgba(255,255,255,0.55)",
  "&:hover": {
    color: "#00e676",
    background: "rgba(0,230,118,0.08)",
  },
};
