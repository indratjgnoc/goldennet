"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  AddBoxOutlined,
  ArrowBackOutlined,
  AssignmentOutlined,
  BuildOutlined,
  CalendarMonthOutlined,
  CheckCircleOutlined,
  DeleteOutlineOutlined,
  LocationOnOutlined,
  PersonOutlined,
  PlayArrowOutlined,
  SaveOutlined,
} from "@mui/icons-material";

type WorkOrder = {
  id: number;
  workOrderCode: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  priority: string;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  technicianNotes?: string | null;
  completionNotes?: string | null;
  createdAt: string;

  customer: {
    id: number;
    customerCode: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  };

  technician?: {
    id: number;
    name: string;
  } | null;

  installation?: {
    id: number;
  } | null;

  materials?: WorkOrderMaterial[];
};

type WorkOrderMaterial = {
  id: number;
  itemId: number;
  quantity: number | string;
  notes?: string | null;
  item: {
    id: number;
    name: string;
    sku?: string | null;
    unit: string;
  };
};

type InventoryItem = {
  id: number;
  name: string;
  sku?: string | null;
  unit: string;
  stock: number | string;
};

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
  }
> = {
  OPEN: {
    label: "Open",
    color: "#fbbf24",
    bg: "rgba(251,191,36,.12)",
  },
  ASSIGNED: {
    label: "Assigned",
    color: "#60a5fa",
    bg: "rgba(96,165,250,.12)",
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "#22c55e",
    bg: "rgba(34,197,94,.12)",
  },
  PENDING: {
    label: "Pending",
    color: "#f97316",
    bg: "rgba(249,115,22,.12)",
  },
  COMPLETED: {
    label: "Completed",
    color: "#4ade80",
    bg: "rgba(74,222,128,.12)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#ef4444",
    bg: "rgba(239,68,68,.12)",
  },
};

const priorityConfig: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
  }
> = {
  LOW: {
    label: "Low",
    color: "#94a3b8",
    bg: "rgba(148,163,184,.1)",
  },
  NORMAL: {
    label: "Normal",
    color: "#60a5fa",
    bg: "rgba(96,165,250,.1)",
  },
  HIGH: {
    label: "High",
    color: "#f59e0b",
    bg: "rgba(245,158,11,.12)",
  },
  URGENT: {
    label: "Urgent",
    color: "#ef4444",
    bg: "rgba(239,68,68,.12)",
  },
};

const typeLabels: Record<string, string> = {
  INSTALLATION: "Installation",
  TROUBLESHOOTING: "Troubleshooting",
  REPAIR: "Repair",
  MAINTENANCE: "Maintenance",
  UPGRADE: "Upgrade",
  DOWNGRADE: "Downgrade",
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    color: "#cbd5e1",
    bg: "rgba(203,213,225,.1)",
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.5,
        py: 0.7,
        borderRadius: 2,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}35`,
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {config.label}
    </Box>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] ?? {
    label: priority,
    color: "#cbd5e1",
    bg: "rgba(203,213,225,.1)",
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        px: 1.5,
        py: 0.7,
        borderRadius: 2,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}35`,
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      {config.label}
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    background: "rgba(255,255,255,.025)",
    borderRadius: 2,

    "& fieldset": {
      borderColor: "rgba(255,255,255,.1)",
    },

    "&:hover fieldset": {
      borderColor: "rgba(0,230,118,.35)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#00e676",
    },
  },

  "& textarea::placeholder": {
    color: "rgba(255,255,255,.3)",
    opacity: 1,
  },
};

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [status, setStatus] = useState("");
  const [technicianNotes, setTechnicianNotes] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");

  /*
   * MATERIAL STATE
   */
  const [materialItems, setMaterialItems] = useState<InventoryItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] =
    useState<InventoryItem | null>(null);

  const [materialQuantity, setMaterialQuantity] = useState("1");
  const [materialNotes, setMaterialNotes] = useState("");

  const [materialLoading, setMaterialLoading] = useState(false);
  const [materialError, setMaterialError] = useState("");

  const loadWorkOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/work-orders/${id}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Gagal mengambil detail Work Order.",
        );
      }

      const data = result?.data ?? result;

      setWorkOrder(data);
      setStatus(data.status ?? "");
      setTechnicianNotes(data.technicianNotes ?? "");
      setCompletionNotes(data.completionNotes ?? "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil detail Work Order.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  /*
   * LOAD INVENTORY ITEMS
   */
  const loadInventoryItems = useCallback(async () => {
    try {
      const response = await fetch("/api/inventory/items?limit=1000", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengambil daftar inventory.");
      }

      /*
       * Dibuat fleksibel karena response API inventory
       * bisa menggunakan:
       *
       * { data: { items: [...] } }
       * { data: [...] }
       * { items: [...] }
       * atau langsung [...]
       */
      const items =
        result?.data?.items ?? result?.items ?? result?.data ?? result ?? [];

      if (Array.isArray(items)) {
        setMaterialItems(items);
      } else {
        setMaterialItems([]);
      }
    } catch (err) {
      console.error("LOAD INVENTORY ITEMS ERROR:", err);

      setMaterialItems([]);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const timeoutId = window.setTimeout(() => {
      void loadWorkOrder();
      void loadInventoryItems();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [id, loadWorkOrder, loadInventoryItems]);

  /*
   * UPDATE WORK ORDER
   */
  const updateWorkOrder = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/work-orders/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          technicianNotes: technicianNotes.trim() || null,
          completionNotes: completionNotes.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal memperbarui Work Order.");
      }

      const data = result?.data ?? result;

      setWorkOrder(data);
      setStatus(data.status ?? status);
      setTechnicianNotes(data.technicianNotes ?? technicianNotes);
      setCompletionNotes(data.completionNotes ?? completionNotes);

      setSuccess("Work Order berhasil diperbarui.");

      await loadWorkOrder();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memperbarui Work Order.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ADD MATERIAL
   */
  const handleAddMaterial = async () => {
    try {
      setMaterialError("");
      setSuccess("");

      if (!selectedMaterial) {
        setMaterialError("Pilih material terlebih dahulu.");
        return;
      }

      const quantity = Number(materialQuantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        setMaterialError("Quantity material harus lebih dari 0.");
        return;
      }

      const availableStock = Number(selectedMaterial.stock);

      if (Number.isFinite(availableStock) && quantity > availableStock) {
        setMaterialError(
          `Stok ${selectedMaterial.name} tidak mencukupi. Stok tersedia: ${availableStock} ${selectedMaterial.unit}.`,
        );
        return;
      }

      if (
        workOrder?.status === "COMPLETED" ||
        workOrder?.status === "CANCELLED"
      ) {
        setMaterialError(
          "Material tidak dapat diubah karena Work Order sudah selesai atau dibatalkan.",
        );
        return;
      }

      setMaterialLoading(true);

      const response = await fetch(`/api/work-orders/${id}/materials`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: selectedMaterial.id,
          quantity,
          notes: materialNotes.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal menambahkan material.");
      }

      setSelectedMaterial(null);
      setMaterialQuantity("1");
      setMaterialNotes("");

      setSuccess("Material berhasil ditambahkan ke Work Order.");

      await loadWorkOrder();
      await loadInventoryItems();
    } catch (err) {
      setMaterialError(
        err instanceof Error ? err.message : "Gagal menambahkan material.",
      );
    } finally {
      setMaterialLoading(false);
    }
  };

  /*
   * DELETE MATERIAL
   */
  const handleDeleteMaterial = async (materialId: number) => {
    try {
      setMaterialError("");
      setSuccess("");

      if (
        workOrder?.status === "COMPLETED" ||
        workOrder?.status === "CANCELLED"
      ) {
        setMaterialError(
          "Material tidak dapat dihapus karena Work Order sudah selesai atau dibatalkan.",
        );
        return;
      }

      setMaterialLoading(true);

      const response = await fetch(
        `/api/work-orders/${id}/materials/${materialId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal menghapus material.");
      }

      setSuccess("Material berhasil dihapus.");

      await loadWorkOrder();
      await loadInventoryItems();
    } catch (err) {
      setMaterialError(
        err instanceof Error ? err.message : "Gagal menghapus material.",
      );
    } finally {
      setMaterialLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#00e676" }} />
      </Box>
    );
  }

  if (!workOrder) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "#020617",
          color: "#fff",
          py: 5,
        }}
      >
        <Container maxWidth="lg">
          <Alert severity="error">
            {error || "Work Order tidak ditemukan."}
          </Alert>
        </Container>
      </Box>
    );
  }

  const materialEditingDisabled =
    workOrder.status === "COMPLETED" || workOrder.status === "CANCELLED";

  const selectedStock = selectedMaterial ? Number(selectedMaterial.stock) : 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(0,230,118,0.08), transparent 30%), #020617",
        color: "#fff",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
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
            <Button
              onClick={() => router.push("/gnet-console/work-orders")}
              startIcon={<ArrowBackOutlined />}
              sx={{
                color: "rgba(255,255,255,.5)",
                textTransform: "none",
                px: 0,
                mb: 1,
                "&:hover": {
                  color: "#00e676",
                  background: "transparent",
                },
              }}
            >
              Kembali ke Work Order
            </Button>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                }}
              >
                {workOrder.workOrderCode}
              </Typography>

              <StatusBadge status={workOrder.status} />

              <PriorityBadge priority={workOrder.priority} />
            </Box>

            <Typography
              sx={{
                color: "rgba(255,255,255,.45)",
                mt: 0.7,
                fontSize: 13,
              }}
            >
              {typeLabels[workOrder.type] ?? workOrder.type}
            </Typography>
          </Box>

          <Button
            onClick={updateWorkOrder}
            disabled={saving}
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={17} sx={{ color: "#001b0d" }} />
              ) : (
                <SaveOutlined />
              )
            }
            sx={{
              minHeight: 43,
              px: 2.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              background: "linear-gradient(135deg, #00e676 0%, #00b85c 100%)",
              color: "#001b0d",
              "&:hover": {
                background: "linear-gradient(135deg, #19f080 0%, #00c965 100%)",
              },
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 2,
              borderRadius: 2,
              background: "rgba(0,230,118,.08)",
              color: "#86efac",
              border: "1px solid rgba(0,230,118,.18)",
            }}
          >
            {success}
          </Alert>
        )}

        {/* MAIN GRID */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.6fr) minmax(320px, .8fr)",
            },
            gap: 3,
          }}
        >
          {/* LEFT */}
          <Box>
            {/* JOB INFO */}
            <Paper elevation={0} sx={paperSx}>
              <SectionTitle
                icon={<AssignmentOutlined />}
                title="Informasi Pekerjaan"
              />

              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: 19,
                  mb: 1,
                }}
              >
                {workOrder.title}
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,.52)",
                  fontSize: 13,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}
              >
                {workOrder.description || "Tidak ada deskripsi pekerjaan."}
              </Typography>

              <Divider
                sx={{
                  borderColor: "rgba(255,255,255,.07)",
                  my: 2.5,
                }}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <InfoItem
                  label="Dibuat"
                  value={formatDate(workOrder.createdAt)}
                />

                <InfoItem
                  label="Dijadwalkan"
                  value={formatDate(workOrder.scheduledAt)}
                />

                <InfoItem
                  label="Dimulai"
                  value={formatDate(workOrder.startedAt)}
                />
              </Box>
            </Paper>

            {/* STATUS */}
            <Paper
              elevation={0}
              sx={{
                ...paperSx,
                mt: 3,
              }}
            >
              <SectionTitle
                icon={<BuildOutlined />}
                title="Progress Pekerjaan"
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                  },
                  gap: 2,
                  mb: 2.5,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.4)",
                      fontSize: 11,
                      mb: 0.7,
                    }}
                  >
                    Status Saat Ini
                  </Typography>

                  <StatusBadge status={workOrder.status} />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.4)",
                      fontSize: 11,
                      mb: 0.7,
                    }}
                  >
                    Selesai
                  </Typography>

                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {formatDate(workOrder.completedAt)}
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Catatan Teknisi"
                placeholder="Tuliskan hasil pemeriksaan atau pekerjaan teknisi..."
                value={technicianNotes}
                onChange={(event) => setTechnicianNotes(event.target.value)}
                sx={fieldSx}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Catatan Penyelesaian"
                placeholder="Tuliskan hasil akhir pekerjaan..."
                value={completionNotes}
                onChange={(event) => setCompletionNotes(event.target.value)}
                sx={{
                  ...fieldSx,
                  mt: 2,
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Paper>

            {/* MATERIAL */}
            <Paper
              elevation={0}
              sx={{
                ...paperSx,
                mt: 3,
              }}
            >
              <SectionTitle
                icon={<BuildOutlined />}
                title="Material yang Digunakan"
              />

              {materialEditingDisabled && (
                <Alert
                  severity="info"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    background: "rgba(96,165,250,.06)",
                    color: "#93c5fd",
                    border: "1px solid rgba(96,165,250,.15)",
                  }}
                >
                  Material tidak dapat diubah karena Work Order sudah{" "}
                  {workOrder.status === "COMPLETED"
                    ? "selesai."
                    : "dibatalkan."}
                </Alert>
              )}

              {materialError && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                  }}
                >
                  {materialError}
                </Alert>
              )}

              {/* ADD MATERIAL FORM */}
              {!materialEditingDisabled && (
                <Box
                  sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: 2.5,
                    background: "rgba(255,255,255,.025)",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 800,
                      mb: 1.5,
                    }}
                  >
                    Tambahkan Material
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "minmax(0, 1.8fr) 130px",
                      },
                      gap: 1.5,
                    }}
                  >
                    <Autocomplete
                      fullWidth
                      options={materialItems}
                      value={selectedMaterial}
                      onChange={(_, value) => {
                        setSelectedMaterial(value);
                        setMaterialError("");
                      }}
                      getOptionLabel={(option) =>
                        `${option.name}${option.sku ? ` (${option.sku})` : ""}`
                      }
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      renderOption={(props, option) => {
                        const { key, ...optionProps } = props;

                        return (
                          <Box
                            component="li"
                            key={key}
                            {...optionProps}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 2,
                              py: 1.2,
                            }}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  color: "#fff",
                                  fontSize: 13,
                                  fontWeight: 700,
                                }}
                              >
                                {option.name}
                              </Typography>

                              {option.sku && (
                                <Typography
                                  sx={{
                                    color: "rgba(255,255,255,.4)",
                                    fontSize: 10,
                                    mt: 0.3,
                                  }}
                                >
                                  SKU: {option.sku}
                                </Typography>
                              )}
                            </Box>

                            <Typography
                              sx={{
                                color:
                                  Number(option.stock) > 0
                                    ? "#00e676"
                                    : "#ef4444",
                                fontSize: 11,
                                fontWeight: 800,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Stok: {option.stock}
                            </Typography>
                          </Box>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Pilih Material"
                          placeholder="Cari material..."
                          sx={fieldSx}
                        />
                      )}
                    />

                    <TextField
                      fullWidth
                      type="number"
                      label="Quantity"
                      value={materialQuantity}
                      onChange={(event) => {
                        setMaterialQuantity(event.target.value);
                        setMaterialError("");
                      }}
                      sx={fieldSx}
                      slotProps={{
                        htmlInput: {
                          min: 0.01,
                          step: 0.01,
                          max: selectedMaterial ? selectedStock : undefined,
                        },
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                    />
                  </Box>

                  {selectedMaterial && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: 1,
                        px: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          color: "rgba(255,255,255,.35)",
                        }}
                      >
                        Stok tersedia:{" "}
                        <Box
                          component="span"
                          sx={{
                            color: selectedStock > 0 ? "#00e676" : "#ef4444",
                            fontWeight: 800,
                          }}
                        >
                          {selectedStock} {selectedMaterial.unit}
                        </Box>
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 10,
                          color: "rgba(255,255,255,.35)",
                        }}
                      >
                        Satuan: {selectedMaterial.unit}
                      </Typography>
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Catatan Material"
                    placeholder="Contoh: Kabel dropcore untuk jalur utama..."
                    value={materialNotes}
                    onChange={(event) => setMaterialNotes(event.target.value)}
                    sx={{
                      ...fieldSx,
                      mt: 1.5,
                    }}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 1.5,
                    }}
                  >
                    <Button
                      onClick={handleAddMaterial}
                      disabled={materialLoading || !selectedMaterial}
                      variant="contained"
                      startIcon={
                        materialLoading ? (
                          <CircularProgress
                            size={16}
                            sx={{
                              color: "#001b0d",
                            }}
                          />
                        ) : (
                          <AddBoxOutlined />
                        )
                      }
                      sx={{
                        minHeight: 40,
                        px: 2,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: 12,
                        fontWeight: 800,
                        background:
                          "linear-gradient(135deg, #00e676 0%, #00b85c 100%)",
                        color: "#001b0d",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #19f080 0%, #00c965 100%)",
                        },
                      }}
                    >
                      {materialLoading ? "Memproses..." : "Tambah Material"}
                    </Button>
                  </Box>
                </Box>
              )}

              {/* MATERIAL LIST */}
              {!workOrder.materials || workOrder.materials.length === 0 ? (
                <Box
                  sx={{
                    py: 4,
                    textAlign: "center",
                    color: "rgba(255,255,255,.3)",
                  }}
                >
                  <BuildOutlined
                    sx={{
                      fontSize: 30,
                      opacity: 0.25,
                      mb: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 13,
                    }}
                  >
                    Belum ada material yang digunakan.
                  </Typography>

                  {!materialEditingDisabled && (
                    <Typography
                      sx={{
                        fontSize: 10,
                        mt: 0.5,
                        color: "rgba(255,255,255,.22)",
                      }}
                    >
                      Tambahkan material yang digunakan oleh teknisi di atas.
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box>
                  {workOrder.materials.map((material, index) => (
                    <Box
                      key={material.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: {
                          xs: "flex-start",
                          sm: "center",
                        },
                        gap: 2,
                        py: 1.5,
                        borderBottom:
                          index === workOrder.materials!.length - 1
                            ? "none"
                            : "1px solid rgba(255,255,255,.05)",
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {material.item.name}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 0.4,
                          }}
                        >
                          {material.item.sku && (
                            <Typography
                              sx={{
                                color: "rgba(255,255,255,.3)",
                                fontSize: 10,
                              }}
                            >
                              SKU: {material.item.sku}
                            </Typography>
                          )}

                          <Typography
                            sx={{
                              color: "rgba(255,255,255,.3)",
                              fontSize: 10,
                            }}
                          >
                            Unit: {material.item.unit}
                          </Typography>
                        </Box>

                        {material.notes && (
                          <Typography
                            sx={{
                              color: "rgba(255,255,255,.35)",
                              fontSize: 10,
                              mt: 0.6,
                              lineHeight: 1.5,
                            }}
                          >
                            {material.notes}
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#00e676",
                            fontWeight: 900,
                            fontSize: 13,
                          }}
                        >
                          {String(material.quantity)} {material.item.unit}
                        </Typography>

                        {!materialEditingDisabled && (
                          <IconButton
                            onClick={() => handleDeleteMaterial(material.id)}
                            disabled={materialLoading}
                            size="small"
                            sx={{
                              color: "rgba(255,255,255,.3)",
                              "&:hover": {
                                color: "#ef4444",
                                background: "rgba(239,68,68,.08)",
                              },
                            }}
                          >
                            <DeleteOutlineOutlined
                              sx={{
                                fontSize: 18,
                              }}
                            />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>

          {/* RIGHT */}
          <Box>
            {/* CUSTOMER */}
            <Paper elevation={0} sx={paperSx}>
              <SectionTitle icon={<PersonOutlined />} title="Customer" />

              <Typography
                sx={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                {workOrder.customer.name}
              </Typography>

              <Typography
                sx={{
                  color: "#00e676",
                  fontSize: 11,
                  fontWeight: 800,
                  mt: 0.4,
                }}
              >
                {workOrder.customer.customerCode}
              </Typography>

              {workOrder.customer.phone && (
                <InfoRow label="Telepon" value={workOrder.customer.phone} />
              )}

              {workOrder.customer.email && (
                <InfoRow label="Email" value={workOrder.customer.email} />
              )}

              {workOrder.customer.address && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <LocationOnOutlined
                    sx={{
                      fontSize: 17,
                      color: "#00e676",
                    }}
                  />

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.5)",
                      fontSize: 11,
                      lineHeight: 1.6,
                    }}
                  >
                    {workOrder.customer.address}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* TECHNICIAN */}
            <Paper
              elevation={0}
              sx={{
                ...paperSx,
                mt: 3,
              }}
            >
              <SectionTitle icon={<BuildOutlined />} title="Teknisi" />

              {workOrder.technician ? (
                <>
                  <Typography
                    sx={{
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: 16,
                    }}
                  >
                    {workOrder.technician.name}
                  </Typography>

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.4)",
                      fontSize: 11,
                      mt: 0.5,
                    }}
                  >
                    Teknisi yang ditugaskan
                  </Typography>
                </>
              ) : (
                <Typography
                  sx={{
                    color: "#fbbf24",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Belum ada teknisi yang ditugaskan.
                </Typography>
              )}
            </Paper>

            {/* TIMELINE */}
            <Paper
              elevation={0}
              sx={{
                ...paperSx,
                mt: 3,
              }}
            >
              <SectionTitle icon={<CalendarMonthOutlined />} title="Timeline" />

              <TimelineItem
                title="Work Order dibuat"
                value={formatDate(workOrder.createdAt)}
                active
              />

              <TimelineItem
                title="Pekerjaan dimulai"
                value={formatDate(workOrder.startedAt)}
                active={!!workOrder.startedAt}
              />

              <TimelineItem
                title="Pekerjaan selesai"
                value={formatDate(workOrder.completedAt)}
                active={!!workOrder.completedAt}
                last
              />
            </Paper>

            {/* QUICK STATUS */}
            {workOrder.status !== "COMPLETED" &&
              workOrder.status !== "CANCELLED" && (
                <Paper
                  elevation={0}
                  sx={{
                    ...paperSx,
                    mt: 3,
                  }}
                >
                  <SectionTitle
                    icon={<PlayArrowOutlined />}
                    title="Update Status"
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gap: 1,
                    }}
                  >
                    {[
                      ["ASSIGNED", "Assigned"],
                      ["IN_PROGRESS", "Mulai Pengerjaan"],
                      ["PENDING", "Pending"],
                      ["COMPLETED", "Selesaikan"],
                    ].map(([value, label]) => (
                      <Button
                        key={value}
                        onClick={() => setStatus(value)}
                        variant={status === value ? "contained" : "outlined"}
                        sx={{
                          justifyContent: "flex-start",
                          minHeight: 42,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 800,
                          color:
                            status === value
                              ? "#001b0d"
                              : "rgba(255,255,255,.65)",
                          background:
                            status === value ? "#00e676" : "transparent",
                          borderColor: "rgba(255,255,255,.1)",
                          "&:hover": {
                            borderColor: "rgba(0,230,118,.4)",
                            background:
                              status === value
                                ? "#00e676"
                                : "rgba(0,230,118,.05)",
                          },
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </Box>
                </Paper>
              )}

            {/* WORK ORDER COMPLETED INFO */}
            {workOrder.status === "COMPLETED" && (
              <Paper
                elevation={0}
                sx={{
                  ...paperSx,
                  mt: 3,
                  border: "1px solid rgba(74,222,128,.15)",
                  background: "rgba(74,222,128,.04)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <CheckCircleOutlined
                    sx={{
                      color: "#4ade80",
                      fontSize: 24,
                    }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        color: "#4ade80",
                        fontWeight: 900,
                        fontSize: 13,
                      }}
                    >
                      Work Order Selesai
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(255,255,255,.4)",
                        fontSize: 10,
                        mt: 0.3,
                      }}
                    >
                      Pekerjaan telah ditandai sebagai selesai.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 2.5,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#00e676",
          background: "rgba(0,230,118,.08)",
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          color: "#fff",
          fontSize: 14,
          fontWeight: 900,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        sx={{
          color: "rgba(255,255,255,.35)",
          fontSize: 10,
          textTransform: "uppercase",
          fontWeight: 800,
          letterSpacing: ".5px",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          mt: 0.5,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography
        sx={{
          color: "rgba(255,255,255,.32)",
          fontSize: 10,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          color: "rgba(255,255,255,.65)",
          fontSize: 12,
          mt: 0.3,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function TimelineItem({
  title,
  value,
  active,
  last = false,
}: {
  title: string;
  value: string;
  active: boolean;
  last?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        position: "relative",
        pb: last ? 0 : 2.5,
      }}
    >
      {!last && (
        <Box
          sx={{
            position: "absolute",
            left: 7,
            top: 16,
            bottom: 0,
            width: 1,
            background: active
              ? "rgba(0,230,118,.25)"
              : "rgba(255,255,255,.08)",
          }}
        />
      )}

      <Box
        sx={{
          width: 15,
          height: 15,
          borderRadius: "50%",
          flexShrink: 0,
          mt: 0.2,
          background: active ? "#00e676" : "rgba(255,255,255,.1)",
          border: active
            ? "3px solid rgba(0,230,118,.15)"
            : "3px solid rgba(255,255,255,.03)",
          zIndex: 1,
        }}
      />

      <Box>
        <Typography
          sx={{
            color: active ? "#fff" : "rgba(255,255,255,.3)",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: "rgba(255,255,255,.35)",
            fontSize: 10,
            mt: 0.3,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

const paperSx = {
  p: { xs: 2, md: 2.5 },
  borderRadius: 3,
  background: "rgba(15,23,42,.72)",
  border: "1px solid rgba(255,255,255,.07)",
};
