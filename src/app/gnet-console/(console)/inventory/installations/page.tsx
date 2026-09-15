"use client";

import { useEffect, useMemo, useState } from "react";

import {
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
  BuildOutlined,
  CalendarMonthOutlined,
  CloseOutlined,
  DeleteOutlined,
  Inventory2Outlined,
  LocationOnOutlined,
  PersonOutlineOutlined,
  RefreshOutlined,
  SearchOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

type Customer = {
  id: number;
  customerCode: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  status?: string;
};

type Technician = {
  id: number;
  name: string;
  username: string;
  role?: string;
  status?: string;
};

type InventoryItem = {
  id: number;
  code: string;
  name: string;
  unit: string;
  stock: string | number;
  minimumStock?: string | number;
  category?: {
    id: number;
    name: string;
  } | null;
};

type InstallationItem = {
  id: number;
  quantity: string;
  notes?: string | null;
  item: {
    id: number;
    code: string;
    name: string;
    unit: string;
  };
};

type Installation = {
  id: number;
  installationCode: string;
  customerId: number;
  technicianId: number;
  installationDate: string;
  address: string;
  notes?: string | null;
  createdAt: string;
  customer: Customer;
  technician: Technician;
  items: InstallationItem[];
};

type MaterialForm = {
  itemId: number | "";
  quantity: string;
  notes: string;
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    backgroundColor: "rgba(255,255,255,.025)",
    borderRadius: 2,
    "& fieldset": {
      borderColor: "rgba(255,255,255,.12)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0,230,118,.35)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00e676",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,.55)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#00e676",
  },
  "& .MuiInputBase-input": {
    color: "#fff",
  },
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStockNumber(value: string | number) {
  const number = typeof value === "number" ? value : Number(value);

  return Number.isFinite(number) ? number : 0;
}

function formatQuantity(value: string | number) {
  const number = getStockNumber(value);

  return number.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

function getStockStatus(item: InventoryItem) {
  const stock = getStockNumber(item.stock);

  const minimum = getStockNumber(item.minimumStock ?? 0);

  if (stock <= 0) {
    return {
      label: "Habis",
      color: "error" as const,
    };
  }

  if (stock <= minimum) {
    return {
      label: "Menipis",
      color: "warning" as const,
    };
  }

  return {
    label: "Aman",
    color: "success" as const,
  };
}

function emptyMaterial(): MaterialForm {
  return {
    itemId: "",
    quantity: "",
    notes: "",
  };
}

export default function InstallationsPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [formLoading, setFormLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openCreate, setOpenCreate] = useState(false);

  const [selectedInstallation, setSelectedInstallation] =
    useState<Installation | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);

  const [installationDate, setInstallationDate] = useState(() => {
    const now = new Date();

    const offset = now.getTimezoneOffset() * 60000;

    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });

  const [address, setAddress] = useState("");

  const [notes, setNotes] = useState("");

  const [materials, setMaterials] = useState<MaterialForm[]>([emptyMaterial()]);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (message: string, severity: "success" | "error") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });

    window.setTimeout(() => {
      setSnackbar((current) => ({
        ...current,
        open: false,
      }));
    }, 3500);
  };

  // =========================================
  // LOAD INSTALLATIONS
  // =========================================

  useEffect(() => {
    let cancelled = false;

    async function loadInstallations() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/inventory/installations${
            search ? `?search=${encodeURIComponent(search)}` : ""
          }`,
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(result.message || "Gagal mengambil data pemasangan.");
        }

        setInstallations(result.data ?? []);
      } catch (error) {
        if (!cancelled) {
          showMessage(
            error instanceof Error
              ? error.message
              : "Gagal mengambil data pemasangan.",
            "error",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInstallations();

    return () => {
      cancelled = true;
    };
  }, [search]);

  // =========================================
  // LOAD FORM DATA
  // =========================================

  useEffect(() => {
    let cancelled = false;

    async function loadFormData() {
      try {
        const [customerResponse, userResponse, itemResponse] =
          await Promise.all([
            fetch("/api/customers", {
              cache: "no-store",
            }),
            fetch("/api/users", {
              cache: "no-store",
            }),
            fetch("/api/inventory/items?limit=1000", {
              cache: "no-store",
            }),
          ]);

        const [customerResult, userResult, itemResult] = await Promise.all([
          customerResponse.json(),
          userResponse.json(),
          itemResponse.json(),
        ]);

        if (cancelled) {
          return;
        }

        if (customerResponse.ok) {
          setCustomers(customerResult.data ?? []);
        }

        if (userResponse.ok) {
          const users = userResult.data ?? [];

          setTechnicians(
            users.filter(
              (user: Technician) =>
                user.role === "TEKNISI" && user.status === "ACTIVE",
            ),
          );
        }

        if (itemResponse.ok) {
          setInventoryItems(itemResult.data ?? []);
        }
      } catch {
        if (!cancelled) {
          showMessage(
            "Gagal memuat data customer, teknisi, atau material.",
            "error",
          );
        }
      }
    }

    loadFormData();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================
  // FILTER
  // =========================================

  const filteredInstallations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return installations;
    }

    return installations.filter(
      (installation) =>
        installation.installationCode.toLowerCase().includes(keyword) ||
        installation.customer.name.toLowerCase().includes(keyword) ||
        installation.customer.customerCode.toLowerCase().includes(keyword) ||
        installation.technician.name.toLowerCase().includes(keyword) ||
        installation.address.toLowerCase().includes(keyword),
    );
  }, [installations, search]);

  const paginatedInstallations = useMemo(() => {
    const start = page * rowsPerPage;

    return filteredInstallations.slice(start, start + rowsPerPage);
  }, [filteredInstallations, page, rowsPerPage]);

  // =========================================
  // STATS
  // =========================================

  const stats = useMemo(() => {
    const total = installations.length;

    const thisMonth = installations.filter((installation) => {
      const date = new Date(installation.installationDate);

      const now = new Date();

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;

    const materialUsage = installations.reduce(
      (total, installation) =>
        total +
        installation.items.reduce(
          (subtotal, item) => subtotal + getStockNumber(item.quantity),
          0,
        ),
      0,
    );

    const technicianCount = new Set(
      installations.map((installation) => installation.technicianId),
    ).size;

    return {
      total,
      thisMonth,
      materialUsage,
      technicianCount,
    };
  }, [installations]);

  // =========================================
  // OPEN CREATE
  // =========================================

  const handleOpenCreate = () => {
    setSelectedCustomer(null);
    setSelectedTechnician(null);
    setInstallationDate(() => {
      const now = new Date();

      const offset = now.getTimezoneOffset() * 60000;

      return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    });

    setAddress("");
    setNotes("");
    setMaterials([emptyMaterial()]);

    setOpenCreate(true);
  };

  // =========================================
  // CUSTOMER CHANGE
  // =========================================

  const handleCustomerChange = (customer: Customer | null) => {
    setSelectedCustomer(customer);

    if (customer?.address && !address.trim()) {
      setAddress(customer.address);
    }
  };

  // =========================================
  // MATERIAL HELPERS
  // =========================================

  const usedItemIds = useMemo(
    () =>
      materials
        .map((material) => Number(material.itemId))
        .filter((id) => id > 0),
    [materials],
  );

  const getAvailableItems = (currentIndex: number) => {
    const currentItemId = materials[currentIndex]?.itemId;

    return inventoryItems.filter(
      (item) =>
        item.id === Number(currentItemId) || !usedItemIds.includes(item.id),
    );
  };

  const getSelectedItem = (material: MaterialForm) => {
    if (!material.itemId) {
      return null;
    }

    return (
      inventoryItems.find((item) => item.id === Number(material.itemId)) ?? null
    );
  };

  const updateMaterial = (
    index: number,
    field: keyof MaterialForm,
    value: string | number,
  ) => {
    setMaterials((current) =>
      current.map((material, materialIndex) =>
        materialIndex === index
          ? {
              ...material,
              [field]: value,
            }
          : material,
      ),
    );
  };

  const addMaterial = () => {
    setMaterials((current) => [...current, emptyMaterial()]);
  };

  const removeMaterial = (index: number) => {
    setMaterials((current) =>
      current.length === 1
        ? current
        : current.filter((_, materialIndex) => materialIndex !== index),
    );
  };

  // =========================================
  // SUBMIT
  // =========================================

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      showMessage("Customer wajib dipilih.", "error");
      return;
    }

    if (!selectedTechnician) {
      showMessage("Teknisi wajib dipilih.", "error");
      return;
    }

    if (!address.trim()) {
      showMessage("Alamat pemasangan wajib diisi.", "error");
      return;
    }

    const normalizedMaterials = materials.map((material) => ({
      itemId: Number(material.itemId),
      quantity: Number(material.quantity),
      notes: material.notes.trim() || null,
    }));

    for (let index = 0; index < normalizedMaterials.length; index += 1) {
      const material = normalizedMaterials[index];

      if (!Number.isInteger(material.itemId) || material.itemId <= 0) {
        showMessage(`Material pada baris ${index + 1} belum dipilih.`, "error");
        return;
      }

      if (!Number.isFinite(material.quantity) || material.quantity <= 0) {
        showMessage(
          `Jumlah material pada baris ${index + 1} harus lebih dari 0.`,
          "error",
        );
        return;
      }

      const item = inventoryItems.find(
        (inventoryItem) => inventoryItem.id === material.itemId,
      );

      if (!item) {
        showMessage(
          `Material pada baris ${index + 1} tidak ditemukan.`,
          "error",
        );
        return;
      }

      const availableStock = getStockNumber(item.stock);

      if (material.quantity > availableStock) {
        showMessage(
          `Stok ${item.name} tidak mencukupi. Tersedia ${formatQuantity(
            availableStock,
          )} ${item.unit}.`,
          "error",
        );
        return;
      }
    }

    const itemIds = normalizedMaterials.map((material) => material.itemId);

    if (new Set(itemIds).size !== itemIds.length) {
      showMessage("Material yang sama tidak boleh dipilih dua kali.", "error");
      return;
    }

    try {
      setFormLoading(true);

      const response = await fetch("/api/inventory/installations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          technicianId: selectedTechnician.id,
          installationDate,
          address: address.trim(),
          notes: notes.trim() || null,
          items: normalizedMaterials,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat pemasangan.");
      }

      setInstallations((current) => [result.data, ...current]);

      // Refresh inventory local data
      // agar stok pada form berikutnya
      // menggunakan nilai terbaru.
      try {
        const itemResponse = await fetch("/api/inventory/items?limit=1000", {
          cache: "no-store",
        });

        const itemResult = await itemResponse.json();

        if (itemResponse.ok) {
          setInventoryItems(itemResult.data ?? []);
        }
      } catch {
        // Tidak menggagalkan transaksi
        // hanya karena refresh stok gagal.
      }

      setOpenCreate(false);

      setPage(0);

      showMessage(
        "Pemasangan berhasil dibuat. Stok material telah diperbarui.",
        "success",
      );
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Gagal membuat pemasangan.",
        "error",
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =========================================
  // REFRESH
  // =========================================

  const handleRefresh = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/inventory/installations${
          search ? `?search=${encodeURIComponent(search)}` : ""
        }`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memperbarui data.");
      }

      setInstallations(result.data ?? []);

      showMessage("Data pemasangan diperbarui.", "success");
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "Gagal memperbarui data.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

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
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

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
            <Typography
              sx={{
                fontSize: {
                  xs: 25,
                  md: 31,
                },
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Pemasangan
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "rgba(255,255,255,.52)",
                fontSize: 14,
              }}
            >
              Kelola pemasangan pelanggan dan penggunaan material teknisi.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1.2,
              width: {
                xs: "100%",
                md: "auto",
              },
            }}
          >
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={handleRefresh}
              sx={{
                flex: {
                  xs: 1,
                  md: "unset",
                },
                color: "#fff",
                borderColor: "rgba(255,255,255,.14)",
                borderRadius: 2,
                textTransform: "none",
                "&:hover": {
                  borderColor: "rgba(0,230,118,.5)",
                  background: "rgba(0,230,118,.05)",
                },
              }}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={handleOpenCreate}
              sx={{
                flex: {
                  xs: 1,
                  md: "unset",
                },
                background: "#00e676",
                color: "#001b0d",
                fontWeight: 800,
                borderRadius: 2,
                textTransform: "none",
                boxShadow: "0 10px 30px rgba(0,230,118,.16)",
                "&:hover": {
                  background: "#00c968",
                },
              }}
            >
              Pemasangan Baru
            </Button>
          </Box>
        </Box>

        {/* ================================= */}
        {/* STATS */}
        {/* ================================= */}

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
              label: "Total Pemasangan",
              value: stats.total,
              icon: <BuildOutlined />,
            },
            {
              label: "Bulan Ini",
              value: stats.thisMonth,
              icon: <CalendarMonthOutlined />,
            },
            {
              label: "Material Digunakan",
              value: formatQuantity(stats.materialUsage),
              icon: <Inventory2Outlined />,
            },
            {
              label: "Teknisi Aktif",
              value: stats.technicianCount,
              icon: <PersonOutlineOutlined />,
            },
          ].map((stat) => (
            <Paper
              key={stat.label}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                background:
                  "linear-gradient(145deg, rgba(15,23,42,.95), rgba(2,6,23,.95))",
                border: "1px solid rgba(255,255,255,.07)",
                boxShadow: "0 15px 40px rgba(0,0,0,.15)",
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
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "rgba(255,255,255,.45)",
                    }}
                  >
                    {stat.label}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.7,
                      fontSize: {
                        xs: 20,
                        md: 23,
                      },
                      fontWeight: 800,
                    }}
                  >
                    {stat.value}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#00e676",
                    background: "rgba(0,230,118,.08)",
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* ================================= */}
        {/* TABLE CARD */}
        {/* ================================= */}

        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: 2.5,
            background: "rgba(15,23,42,.72)",
            border: "1px solid rgba(255,255,255,.07)",
            backdropFilter: "blur(14px)",
          }}
        >
          <Box
            sx={{
              p: {
                xs: 1.5,
                md: 2,
              },
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              flexDirection: {
                xs: "column",
                md: "row",
              },
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Cari kode pemasangan, customer, teknisi..."
              sx={inputSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchOutlined
                      sx={{
                        mr: 1,
                        color: "rgba(255,255,255,.38)",
                      }}
                    />
                  ),
                },
              }}
            />
          </Box>

          <Divider
            sx={{
              borderColor: "rgba(255,255,255,.06)",
            }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "Pemasangan",
                    "Customer",
                    "Teknisi",
                    "Material",
                    "Tanggal",
                    "Alamat",
                    "Aksi",
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      sx={{
                        color: "rgba(255,255,255,.42)",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".6px",
                        borderColor: "rgba(255,255,255,.06)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
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
                        borderColor: "rgba(255,255,255,.06)",
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
                ) : paginatedInstallations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{
                        py: 8,
                        borderColor: "rgba(255,255,255,.06)",
                      }}
                    >
                      <BuildOutlined
                        sx={{
                          fontSize: 42,
                          color: "rgba(255,255,255,.15)",
                        }}
                      />

                      <Typography
                        sx={{
                          mt: 1,
                          color: "rgba(255,255,255,.5)",
                        }}
                      >
                        Belum ada data pemasangan.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInstallations.map((installation) => (
                    <TableRow
                      key={installation.id}
                      hover
                      sx={{
                        "&:hover": {
                          background: "rgba(0,230,118,.025)",
                        },
                        "& td": {
                          borderColor: "rgba(255,255,255,.055)",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: "#00e676",
                          }}
                        >
                          {installation.installationCode}
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.3,
                            fontSize: 11,
                            color: "rgba(255,255,255,.38)",
                          }}
                        >
                          #{installation.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {installation.customer.name}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 11,
                            color: "rgba(255,255,255,.4)",
                            mt: 0.3,
                          }}
                        >
                          {installation.customer.customerCode}
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
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(0,230,118,.08)",
                              color: "#00e676",
                            }}
                          >
                            <PersonOutlineOutlined
                              sx={{
                                fontSize: 17,
                              }}
                            />
                          </Box>

                          <Typography
                            sx={{
                              fontSize: 13,
                            }}
                          >
                            {installation.technician.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                          }}
                        >
                          <Chip
                            size="small"
                            icon={<Inventory2Outlined />}
                            label={`${installation.items.length} jenis`}
                            sx={{
                              width: "fit-content",
                              color: "#b7ffda",
                              background: "rgba(0,230,118,.08)",
                              border: "1px solid rgba(0,230,118,.12)",
                              "& .MuiChip-icon": {
                                color: "#00e676",
                              },
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: 11,
                              color: "rgba(255,255,255,.38)",
                            }}
                          >
                            {formatQuantity(
                              installation.items.reduce(
                                (total, item) =>
                                  total + getStockNumber(item.quantity),
                                0,
                              ),
                            )}{" "}
                            unit
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(installation.installationDate)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 0.7,
                            maxWidth: 240,
                          }}
                        >
                          <LocationOnOutlined
                            sx={{
                              mt: 0.2,
                              fontSize: 16,
                              color: "rgba(255,255,255,.3)",
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: 12,
                              color: "rgba(255,255,255,.62)",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {installation.address}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => setSelectedInstallation(installation)}
                          sx={{
                            color: "#00e676",
                            background: "rgba(0,230,118,.06)",
                            "&:hover": {
                              background: "rgba(0,230,118,.12)",
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
            count={filteredInstallations.length}
            page={page}
            onPageChange={(_event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Baris:"
            sx={{
              color: "rgba(255,255,255,.55)",
              borderTop: "1px solid rgba(255,255,255,.06)",
              "& .MuiTablePagination-selectIcon": {
                color: "rgba(255,255,255,.5)",
              },
              "& .MuiTablePagination-actions button": {
                color: "rgba(255,255,255,.6)",
              },
            }}
          />
        </Paper>
      </Container>

      {/* ===================================== */}
      {/* CREATE DIALOG */}
      {/* ===================================== */}

      <Dialog
        open={openCreate}
        onClose={() => {
          if (!formLoading) {
            setOpenCreate(false);
          }
        }}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              background: "#0f172a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 3,
              backgroundImage:
                "radial-gradient(circle at top right, rgba(0,230,118,.08), transparent 35%)",
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
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              Pemasangan Baru
            </Typography>

            <Typography
              sx={{
                mt: 0.4,
                fontSize: 12,
                color: "rgba(255,255,255,.45)",
              }}
            >
              Catat pemasangan dan material yang digunakan.
            </Typography>
          </Box>

          <IconButton
            onClick={() => {
              if (!formLoading) {
                setOpenCreate(false);
              }
            }}
            sx={{
              color: "rgba(255,255,255,.55)",
            }}
          >
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
              gap: 2,
              pt: 1,
            }}
          >
            <Autocomplete
              options={customers}
              value={selectedCustomer}
              onChange={(_event, value) => handleCustomerChange(value)}
              getOptionLabel={(option) =>
                `${option.customerCode} — ${option.name}`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="Customer tidak ditemukan"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer"
                  placeholder="Pilih customer..."
                  sx={inputSx}
                />
              )}
              sx={{
                "& .MuiAutocomplete-inputRoot": {
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,.025)",
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,.12)",
                  },
                },
                "& .MuiAutocomplete-popupIndicator": {
                  color: "rgba(255,255,255,.5)",
                },
              }}
            />

            <Autocomplete
              options={technicians}
              value={selectedTechnician}
              onChange={(_event, value) => setSelectedTechnician(value)}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="Teknisi aktif tidak ditemukan"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Teknisi"
                  placeholder="Pilih teknisi..."
                  sx={inputSx}
                />
              )}
              sx={{
                "& .MuiAutocomplete-inputRoot": {
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,.025)",
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,.12)",
                  },
                },
                "& .MuiAutocomplete-popupIndicator": {
                  color: "rgba(255,255,255,.5)",
                },
              }}
            />

            <TextField
              label="Tanggal Pemasangan"
              type="datetime-local"
              value={installationDate}
              onChange={(event) => setInstallationDate(event.target.value)}
              fullWidth
              sx={inputSx}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <TextField
              label="Alamat Pemasangan"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              fullWidth
              sx={inputSx}
            />

            <TextField
              label="Catatan"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{
                ...inputSx,
                gridColumn: {
                  xs: "auto",
                  md: "1 / -1",
                },
              }}
            />
          </Box>

          {/* MATERIAL */}
          <Box
            sx={{
              mt: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
                mb: 1.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 800,
                  }}
                >
                  Material Digunakan
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "rgba(255,255,255,.4)",
                    mt: 0.3,
                  }}
                >
                  Stok akan otomatis dikurangi setelah pemasangan disimpan.
                </Typography>
              </Box>

              <Button
                size="small"
                startIcon={<AddOutlined />}
                onClick={addMaterial}
                sx={{
                  color: "#00e676",
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Tambah Material
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {materials.map((material, index) => {
                const selectedItem = getSelectedItem(material);

                const availableItems = getAvailableItems(index);

                const availableStock = selectedItem
                  ? getStockNumber(selectedItem.stock)
                  : 0;

                return (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      background: "rgba(2,6,23,.6)",
                      border: "1px solid rgba(255,255,255,.07)",
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "2fr 1fr 1.5fr auto",
                        },
                        gap: 1.2,
                        alignItems: "center",
                      }}
                    >
                      <Autocomplete
                        options={availableItems}
                        value={selectedItem}
                        onChange={(_event, value) => {
                          updateMaterial(index, "itemId", value?.id ?? "");

                          updateMaterial(index, "quantity", "");
                        }}
                        getOptionLabel={(option) =>
                          `${option.code} — ${option.name}`
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        noOptionsText="Material tidak tersedia"
                        renderOption={(props, option) => {
                          const stock = getStockNumber(option.stock);

                          const status = getStockStatus(option);

                          return (
                            <li {...props} key={option.id}>
                              <Box
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  gap: 1,
                                }}
                              >
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize: 13,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {option.name}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontSize: 10,
                                      color: "rgba(255,255,255,.45)",
                                    }}
                                  >
                                    {option.code}
                                  </Typography>
                                </Box>

                                <Chip
                                  size="small"
                                  label={`${formatQuantity(
                                    stock,
                                  )} ${option.unit}`}
                                  color={status.color}
                                />
                              </Box>
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Material"
                            placeholder="Pilih material..."
                            size="small"
                            sx={inputSx}
                          />
                        )}
                        sx={{
                          "& .MuiAutocomplete-inputRoot": {
                            color: "#fff",
                            backgroundColor: "rgba(255,255,255,.025)",
                            borderRadius: 2,
                            "& fieldset": {
                              borderColor: "rgba(255,255,255,.12)",
                            },
                          },
                          "& .MuiAutocomplete-popupIndicator": {
                            color: "rgba(255,255,255,.5)",
                          },
                        }}
                      />

                      <TextField
                        label="Jumlah"
                        type="number"
                        size="small"
                        value={material.quantity}
                        onChange={(event) =>
                          updateMaterial(index, "quantity", event.target.value)
                        }
                        sx={inputSx}
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            step: 0.01,
                            max: availableStock || undefined,
                          },
                        }}
                        helperText={
                          selectedItem
                            ? `Stok: ${formatQuantity(
                                availableStock,
                              )} ${selectedItem.unit}`
                            : "Pilih material"
                        }
                        />

                      <TextField
                        label="Catatan Material"
                        size="small"
                        value={material.notes}
                        onChange={(event) =>
                          updateMaterial(index, "notes", event.target.value)
                        }
                        sx={inputSx}
                        placeholder="Opsional"
                      />

                      <IconButton
                        disabled={materials.length === 1}
                        onClick={() => removeMaterial(index)}
                        sx={{
                          color:
                            materials.length === 1
                              ? "rgba(255,255,255,.15)"
                              : "#ff6b6b",
                          "&:hover": {
                            background: "rgba(255,80,80,.08)",
                          },
                        }}
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            borderTop: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <Button
            onClick={() => setOpenCreate(false)}
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
                <CircularProgress
                  size={16}
                  sx={{
                    color: "#001b0d",
                  }}
                />
              ) : (
                <BuildOutlined />
              )
            }
            sx={{
              background: "#00e676",
              color: "#001b0d",
              fontWeight: 800,
              textTransform: "none",
              borderRadius: 2,
              "&:hover": {
                background: "#00c968",
              },
            }}
          >
            {formLoading ? "Menyimpan..." : "Simpan Pemasangan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===================================== */}
      {/* DETAIL DIALOG */}
      {/* ===================================== */}

      <Dialog
        open={Boolean(selectedInstallation)}
        onClose={() => setSelectedInstallation(null)}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              background: "#0f172a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 3,
              backgroundImage:
                "radial-gradient(circle at top right, rgba(0,230,118,.08), transparent 35%)",
            },
          },
        }}
      >
        {selectedInstallation && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#00e676",
                  }}
                >
                  {selectedInstallation.installationCode}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 12,
                    color: "rgba(255,255,255,.4)",
                  }}
                >
                  Detail pemasangan
                </Typography>
              </Box>

              <IconButton
                onClick={() => setSelectedInstallation(null)}
                sx={{
                  color: "rgba(255,255,255,.5)",
                }}
              >
                <CloseOutlined />
              </IconButton>
            </DialogTitle>

            <DialogContent>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 1.5,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    background: "rgba(2,6,23,.5)",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,.35)",
                      letterSpacing: ".7px",
                    }}
                  >
                    Customer
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.7,
                      fontWeight: 800,
                    }}
                  >
                    {selectedInstallation.customer.name}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.3,
                      fontSize: 12,
                      color: "#00e676",
                    }}
                  >
                    {selectedInstallation.customer.customerCode}
                  </Typography>

                  {selectedInstallation.customer.phone && (
                    <Typography
                      sx={{
                        mt: 0.8,
                        fontSize: 12,
                        color: "rgba(255,255,255,.5)",
                      }}
                    >
                      {selectedInstallation.customer.phone}
                    </Typography>
                  )}
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    background: "rgba(2,6,23,.5)",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,.35)",
                      letterSpacing: ".7px",
                    }}
                  >
                    Teknisi
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.7,
                      fontWeight: 800,
                    }}
                  >
                    {selectedInstallation.technician.name}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.3,
                      fontSize: 12,
                      color: "rgba(255,255,255,.45)",
                    }}
                  >
                    @{selectedInstallation.technician.username}
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    background: "rgba(2,6,23,.5)",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 2,
                    gridColumn: {
                      xs: "auto",
                      sm: "1 / -1",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,.35)",
                      letterSpacing: ".7px",
                    }}
                  >
                    Lokasi & Waktu
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.8,
                      fontSize: 13,
                    }}
                  >
                    {selectedInstallation.address}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.6,
                      fontSize: 12,
                      color: "rgba(255,255,255,.45)",
                    }}
                  >
                    {formatDate(selectedInstallation.installationDate)}
                  </Typography>
                </Paper>
              </Box>

              <Box
                sx={{
                  mt: 3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 800,
                    mb: 1.2,
                  }}
                >
                  Material Digunakan
                </Typography>

                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    background: "rgba(2,6,23,.5)",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 2,
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            color: "rgba(255,255,255,.38)",
                            borderColor: "rgba(255,255,255,.06)",
                          }}
                        >
                          Material
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color: "rgba(255,255,255,.38)",
                            borderColor: "rgba(255,255,255,.06)",
                          }}
                        >
                          Jumlah
                        </TableCell>

                        <TableCell
                          sx={{
                            color: "rgba(255,255,255,.38)",
                            borderColor: "rgba(255,255,255,.06)",
                          }}
                        >
                          Catatan
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {selectedInstallation.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell
                            sx={{
                              borderColor: "rgba(255,255,255,.06)",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {item.item.name}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 10,
                                color: "rgba(255,255,255,.35)",
                              }}
                            >
                              {item.item.code}
                            </Typography>
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              borderColor: "rgba(255,255,255,.06)",
                              fontWeight: 700,
                            }}
                          >
                            {formatQuantity(item.quantity)} {item.item.unit}
                          </TableCell>

                          <TableCell
                            sx={{
                              borderColor: "rgba(255,255,255,.06)",
                              color: "rgba(255,255,255,.45)",
                              fontSize: 11,
                            }}
                          >
                            {item.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {selectedInstallation.notes && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 2,
                    p: 2,
                    background: "rgba(0,230,118,.035)",
                    border: "1px solid rgba(0,230,118,.08)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: "rgba(255,255,255,.35)",
                      textTransform: "uppercase",
                      letterSpacing: ".7px",
                    }}
                  >
                    Catatan Pemasangan
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.7,
                      fontSize: 13,
                      color: "rgba(255,255,255,.7)",
                    }}
                  >
                    {selectedInstallation.notes}
                  </Typography>
                </Paper>
              )}
            </DialogContent>

            <DialogActions
              sx={{
                p: 2,
                borderTop: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <Button
                onClick={() => setSelectedInstallation(null)}
                sx={{
                  color: "rgba(255,255,255,.55)",
                  textTransform: "none",
                }}
              >
                Tutup
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ===================================== */}
      {/* SIMPLE SNACKBAR */}
      {/* ===================================== */}

      {snackbar.open && (
        <Box
          sx={{
            position: "fixed",
            right: {
              xs: 16,
              md: 24,
            },
            bottom: {
              xs: 16,
              md: 24,
            },
            zIndex: 2000,
            maxWidth: {
              xs: "calc(100% - 32px)",
              md: 420,
            },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 2,
              background:
                snackbar.severity === "success"
                  ? "rgba(0,70,38,.95)"
                  : "rgba(90,20,25,.95)",
              border:
                snackbar.severity === "success"
                  ? "1px solid rgba(0,230,118,.25)"
                  : "1px solid rgba(255,80,90,.25)",
              backdropFilter: "blur(15px)",
              boxShadow: "0 20px 50px rgba(0,0,0,.35)",
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {snackbar.message}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
