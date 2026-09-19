"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  AddOutlined,
  AssignmentOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  ErrorOutlined,
  SearchOutlined,
  ScheduleOutlined,
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
  createdAt: string;
  customer: {
    id: number;
    customerCode: string;
    name: string;
    phone?: string | null;
  };
  technician?: {
    id: number;
    name: string;
  } | null;
};

type ApiResponse = {
  data: WorkOrder[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
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
  { label: string; color: string; bg: string }
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

function StatusChip({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    color: "#cbd5e1",
    bg: "rgba(203,213,225,.1)",
  };

  return (
    <Chip
      size="small"
      label={config.label}
      sx={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}30`,
        fontWeight: 700,
        fontSize: 11,
      }}
    />
  );
}

function PriorityChip({ priority }: { priority: string }) {
  const config = priorityConfig[priority] ?? {
    label: priority,
    color: "#cbd5e1",
    bg: "rgba(203,213,225,.1)",
  };

  return (
    <Chip
      size="small"
      label={config.label}
      sx={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}30`,
        fontWeight: 700,
        fontSize: 11,
      }}
    />
  );
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "20");

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      if (priority) {
        params.set("priority", priority);
      }

      if (type) {
        params.set("type", type);
      }

      const response = await fetch(`/api/work-orders?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Gagal mengambil data work order.");
      }

      const payload = result as ApiResponse;

      setWorkOrders(payload.data ?? []);
      setTotalPages(payload.pagination?.totalPages ?? 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil work order.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, priority, search, status, type]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadWorkOrders();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadWorkOrders]);

  const summary = useMemo(() => {
    return {
      total: workOrders.length,
      open: workOrders.filter((item) => item.status === "OPEN").length,
      assigned: workOrders.filter((item) => item.status === "ASSIGNED").length,
      progress: workOrders.filter((item) => item.status === "IN_PROGRESS")
        .length,
      completed: workOrders.filter((item) => item.status === "COMPLETED")
        .length,
    };
  }, [workOrders]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setType("");
    setPage(1);
  };

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
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-.5px",
              }}
            >
              Work Order
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "rgba(255,255,255,.5)",
                fontSize: 14,
              }}
            >
              Kelola pekerjaan teknisi Golden Net secara terpusat.
            </Typography>
          </Box>

          <Button
            component={Link}
            href="/gnet-console/work-orders/create"
            variant="contained"
            startIcon={<AddOutlined />}
            sx={{
              minHeight: 44,
              px: 2.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              background: "linear-gradient(135deg, #00e676 0%, #00b85c 100%)",
              color: "#001b0d",
              boxShadow: "0 8px 30px rgba(0,230,118,.16)",
              "&:hover": {
                background: "linear-gradient(135deg, #19f080 0%, #00c965 100%)",
              },
            }}
          >
            Buat Work Order
          </Button>
        </Box>

        {/* SUMMARY */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <SummaryCard
            icon={<AssignmentOutlined />}
            title="Total"
            value={summary.total}
          />

          <SummaryCard
            icon={<ScheduleOutlined />}
            title="Open"
            value={summary.open}
          />

          <SummaryCard
            icon={<BuildOutlined />}
            title="Assigned"
            value={summary.assigned}
          />

          <SummaryCard
            icon={<BuildOutlined />}
            title="In Progress"
            value={summary.progress}
          />

          <SummaryCard
            icon={<CheckCircleOutlined />}
            title="Completed"
            value={summary.completed}
          />
        </Box>

        {/* FILTER */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            background: "rgba(15,23,42,.72)",
            border: "1px solid rgba(255,255,255,.07)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "2fr 1fr 1fr 1fr auto",
              },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Cari kode WO, customer, judul..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchOutlined
                      sx={{
                        mr: 1,
                        color: "rgba(255,255,255,.4)",
                      }}
                    />
                  ),
                },
              }}
              sx={darkFieldSx}
            />

            <FormControl fullWidth size="small">
              <InputLabel sx={darkLabelSx}>Status</InputLabel>

              <Select
                value={status}
                label="Status"
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                sx={darkSelectSx}
              >
                <MenuItem value="">Semua Status</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="ASSIGNED">Assigned</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={darkLabelSx}>Prioritas</InputLabel>

              <Select
                value={priority}
                label="Prioritas"
                onChange={(event) => {
                  setPriority(event.target.value);
                  setPage(1);
                }}
                sx={darkSelectSx}
              >
                <MenuItem value="">Semua Prioritas</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="NORMAL">Normal</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={darkLabelSx}>Tipe</InputLabel>

              <Select
                value={type}
                label="Tipe"
                onChange={(event) => {
                  setType(event.target.value);
                  setPage(1);
                }}
                sx={darkSelectSx}
              >
                <MenuItem value="">Semua Tipe</MenuItem>
                <MenuItem value="INSTALLATION">Installation</MenuItem>
                <MenuItem value="TROUBLESHOOTING">Troubleshooting</MenuItem>
                <MenuItem value="REPAIR">Repair</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                <MenuItem value="UPGRADE">Upgrade</MenuItem>
                <MenuItem value="DOWNGRADE">Downgrade</MenuItem>
              </Select>
            </FormControl>

            <Button
              onClick={resetFilters}
              sx={{
                height: 40,
                color: "rgba(255,255,255,.6)",
                textTransform: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              Reset
            </Button>
          </Box>
        </Paper>

        {/* ERROR */}
        {error && (
          <Alert
            severity="error"
            icon={<ErrorOutlined />}
            sx={{
              mb: 3,
              borderRadius: 2,
              background: "rgba(239,68,68,.08)",
              color: "#fecaca",
              border: "1px solid rgba(239,68,68,.2)",
            }}
          >
            {error}
          </Alert>
        )}

        {/* TABLE */}
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: 3,
            background: "rgba(15,23,42,.72)",
            border: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <Box
            sx={{
              overflowX: "auto",
              "&::-webkit-scrollbar": {
                height: 7,
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255,255,255,.12)",
                borderRadius: 10,
              },
            }}
          >
            <Box sx={{ minWidth: 1050 }}>
              {/* TABLE HEADER */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "150px minmax(220px, 1.5fr) 170px 150px 130px 150px 100px",
                  gap: 1,
                  px: 2.5,
                  py: 1.8,
                  background: "rgba(255,255,255,.025)",
                  borderBottom: "1px solid rgba(255,255,255,.07)",
                }}
              >
                <TableHeader>WO</TableHeader>
                <TableHeader>Customer / Pekerjaan</TableHeader>
                <TableHeader>Teknisi</TableHeader>
                <TableHeader>Jadwal</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Prioritas</TableHeader>
                <TableHeader>Aksi</TableHeader>
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
                  <CircularProgress size={30} sx={{ color: "#00e676" }} />
                </Box>
              ) : workOrders.length === 0 ? (
                <Box
                  sx={{
                    minHeight: 300,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 3,
                  }}
                >
                  <AssignmentOutlined
                    sx={{
                      fontSize: 46,
                      color: "rgba(255,255,255,.15)",
                      mb: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.7)",
                      fontWeight: 700,
                    }}
                  >
                    Belum ada Work Order
                  </Typography>

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.4)",
                      fontSize: 13,
                      mt: 0.5,
                    }}
                  >
                    Work Order yang sesuai filter akan muncul di sini.
                  </Typography>
                </Box>
              ) : (
                workOrders.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "150px minmax(220px, 1.5fr) 170px 150px 130px 150px 100px",
                      gap: 1,
                      px: 2.5,
                      py: 2,
                      alignItems: "center",
                      borderBottom: "1px solid rgba(255,255,255,.05)",
                      transition: "background .2s ease",
                      "&:hover": {
                        background: "rgba(0,230,118,.025)",
                      },
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color: "#00e676",
                          fontSize: 12,
                          fontWeight: 900,
                        }}
                      >
                        {item.workOrderCode}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.3,
                          color: "rgba(255,255,255,.35)",
                          fontSize: 10,
                        }}
                      >
                        {typeLabels[item.type] ?? item.type}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {item.customer.name}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.35,
                          color: "rgba(255,255,255,.45)",
                          fontSize: 11,
                        }}
                      >
                        {item.customer.customerCode}
                        {item.customer.phone ? ` • ${item.customer.phone}` : ""}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.7,
                          color: "rgba(255,255,255,.7)",
                          fontSize: 12,
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          color: item.technician
                            ? "#fff"
                            : "rgba(255,255,255,.3)",
                          fontSize: 12,
                          fontWeight: item.technician ? 700 : 500,
                        }}
                      >
                        {item.technician?.name ?? "Belum ditugaskan"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          color: item.scheduledAt
                            ? "#fff"
                            : "rgba(255,255,255,.3)",
                          fontSize: 11,
                        }}
                      >
                        {formatDate(item.scheduledAt)}
                      </Typography>
                    </Box>

                    <Box>
                      <StatusChip status={item.status} />
                    </Box>

                    <Box>
                      <PriorityChip priority={item.priority} />
                    </Box>

                    <Button
                      component={Link}
                      href={`/gnet-console/work-orders/${item.id}`}
                      size="small"
                      sx={{
                        color: "#00e676",
                        textTransform: "none",
                        fontWeight: 800,
                        fontSize: 11,
                      }}
                    >
                      Detail
                    </Button>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* PAGINATION */}
          {!loading && workOrders.length > 0 && (
            <Box
              sx={{
                px: 2.5,
                py: 1.8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <Typography
                sx={{
                  color: "rgba(255,255,255,.4)",
                  fontSize: 11,
                }}
              >
                Halaman {page} dari {totalPages}
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                  size="small"
                  sx={paginationButtonSx}
                >
                  Sebelumnya
                </Button>

                <Button
                  disabled={page >= totalPages}
                  onClick={() => setPage((value) => value + 1)}
                  size="small"
                  sx={paginationButtonSx}
                >
                  Berikutnya
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

function SummaryCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        background: "rgba(15,23,42,.72)",
        border: "1px solid rgba(255,255,255,.07)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
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
            color: "#00e676",
            background: "rgba(0,230,118,.08)",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            sx={{
              color: "rgba(255,255,255,.42)",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: "#fff",
              fontSize: 21,
              fontWeight: 900,
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        color: "rgba(255,255,255,.38)",
        fontSize: 10,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: ".6px",
      }}
    >
      {children}
    </Typography>
  );
}

const darkFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    background: "rgba(255,255,255,.025)",
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
  "& input::placeholder": {
    color: "rgba(255,255,255,.35)",
    opacity: 1,
  },
};

const darkLabelSx = {
  color: "rgba(255,255,255,.4)",
  "&.Mui-focused": {
    color: "#00e676",
  },
};

const darkSelectSx = {
  color: "#fff",
  background: "rgba(255,255,255,.025)",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,.1)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(0,230,118,.35)",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#00e676",
  },
  "& .MuiSvgIcon-root": {
    color: "rgba(255,255,255,.5)",
  },
};

const paginationButtonSx = {
  color: "#00e676",
  border: "1px solid rgba(0,230,118,.2)",
  borderRadius: 1.5,
  textTransform: "none",
  fontSize: 11,
  fontWeight: 700,
  "&:disabled": {
    color: "rgba(255,255,255,.2)",
    borderColor: "rgba(255,255,255,.05)",
  },
};
