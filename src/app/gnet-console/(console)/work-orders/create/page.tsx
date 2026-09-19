"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBackOutlined,
  AssignmentOutlined,
  SaveOutlined,
} from "@mui/icons-material";

type Customer = {
  id: number;
  customerCode: string;
  name: string;
  phone?: string | null;
  address?: string | null;
};

type Technician = {
  id: number;
  name: string;
};

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
  "& input::placeholder": {
    color: "rgba(255,255,255,.35)",
    opacity: 1,
  },
  "& textarea::placeholder": {
    color: "rgba(255,255,255,.35)",
    opacity: 1,
  },
};

const selectSx = {
  color: "#fff",
  background: "rgba(255,255,255,.025)",
  borderRadius: 2,
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

const labelSx = {
  color: "rgba(255,255,255,.4)",
  "&.Mui-focused": {
    color: "#00e676",
  },
};

export default function CreateWorkOrderPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerId: "",
    technicianId: "",
    type: "TROUBLESHOOTING",
    priority: "NORMAL",
    title: "",
    description: "",
    scheduledAt: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [customersResponse, techniciansResponse] =
          await Promise.all([
            fetch("/api/customers?limit=1000", {
              credentials: "include",
              cache: "no-store",
            }),
            fetch("/api/users?role=TEKNISI&limit=1000", {
              credentials: "include",
              cache: "no-store",
            }),
          ]);

        const customersResult = await customersResponse.json();
        const techniciansResult = await techniciansResponse.json();

        if (!customersResponse.ok) {
          throw new Error(
            customersResult?.message ||
              "Gagal mengambil data pelanggan."
          );
        }

        if (!techniciansResponse.ok) {
          throw new Error(
            techniciansResult?.message ||
              "Gagal mengambil data teknisi."
          );
        }

        setCustomers(
          customersResult?.data ??
            customersResult?.customers ??
            []
        );

        setTechnicians(
          techniciansResult?.data ??
            techniciansResult?.users ??
            []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data form."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  const updateForm = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.customerId) {
      setError("Customer wajib dipilih.");
      return;
    }

    if (!form.title.trim()) {
      setError("Judul pekerjaan wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        customerId: Number(form.customerId),
        technicianId: form.technicianId
          ? Number(form.technicianId)
          : null,
        type: form.type,
        priority: form.priority,
        title: form.title.trim(),
        description: form.description.trim() || null,
        scheduledAt: form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : null,
      };

      const response = await fetch("/api/work-orders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Gagal membuat Work Order."
        );
      }

      const createdId =
        result?.data?.id ??
        result?.workOrder?.id ??
        result?.id;

      if (createdId) {
        router.push(`/gnet-console/work-orders/${createdId}`);
        return;
      }

      router.push("/gnet-console/work-orders");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat membuat Work Order."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
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
      <Container maxWidth="lg">
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Button
              onClick={() =>
                router.push("/gnet-console/work-orders")
              }
              startIcon={<ArrowBackOutlined />}
              sx={{
                color: "rgba(255,255,255,.5)",
                textTransform: "none",
                mb: 1,
                px: 0,
                "&:hover": {
                  color: "#00e676",
                  background: "transparent",
                },
              }}
            >
              Kembali ke Work Order
            </Button>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "#fff",
              }}
            >
              Buat Work Order
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: "rgba(255,255,255,.45)",
                fontSize: 14,
              }}
            >
              Buat pekerjaan baru untuk customer Golden Net.
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1.7fr) minmax(280px, .8fr)",
            },
            gap: 3,
          }}
        >
          {/* FORM */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
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
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#00e676",
                  background: "rgba(0,230,118,.08)",
                }}
              >
                <AssignmentOutlined />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                  }}
                >
                  Informasi Pekerjaan
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,.38)",
                    fontSize: 11,
                  }}
                >
                  Tentukan customer dan detail pekerjaan.
                </Typography>
              </Box>
            </Box>

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
              {/* CUSTOMER */}
              <FormControl
                fullWidth
                size="small"
                sx={{ gridColumn: { sm: "span 2" } }}
              >
                <InputLabel sx={labelSx}>
                  Customer
                </InputLabel>

                <Select
                  value={form.customerId}
                  label="Customer"
                  onChange={(event) =>
                    updateForm(
                      "customerId",
                      event.target.value
                    )
                  }
                  sx={selectSx}
                >
                  <MenuItem value="">
                    Pilih Customer
                  </MenuItem>

                  {customers.map((customer) => (
                    <MenuItem
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.customerCode} —{" "}
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>

                <FormHelperText
                  sx={{
                    color: "rgba(255,255,255,.3)",
                    fontSize: 10,
                  }}
                >
                  Pilih customer yang membutuhkan pekerjaan.
                </FormHelperText>
              </FormControl>

              {/* TECHNICIAN */}
              <FormControl fullWidth size="small">
                <InputLabel sx={labelSx}>
                  Teknisi
                </InputLabel>

                <Select
                  value={form.technicianId}
                  label="Teknisi"
                  onChange={(event) =>
                    updateForm(
                      "technicianId",
                      event.target.value
                    )
                  }
                  sx={selectSx}
                >
                  <MenuItem value="">
                    Belum ditugaskan
                  </MenuItem>

                  {technicians.map((technician) => (
                    <MenuItem
                      key={technician.id}
                      value={technician.id}
                    >
                      {technician.name}
                    </MenuItem>
                  ))}
                </Select>

                <FormHelperText
                  sx={{
                    color: "rgba(255,255,255,.3)",
                    fontSize: 10,
                  }}
                >
                  Bisa ditentukan sekarang atau nanti.
                </FormHelperText>
              </FormControl>

              {/* TYPE */}
              <FormControl fullWidth size="small">
                <InputLabel sx={labelSx}>
                  Tipe Pekerjaan
                </InputLabel>

                <Select
                  value={form.type}
                  label="Tipe Pekerjaan"
                  onChange={(event) =>
                    updateForm("type", event.target.value)
                  }
                  sx={selectSx}
                >
                  <MenuItem value="INSTALLATION">
                    Installation
                  </MenuItem>

                  <MenuItem value="TROUBLESHOOTING">
                    Troubleshooting
                  </MenuItem>

                  <MenuItem value="REPAIR">
                    Repair
                  </MenuItem>

                  <MenuItem value="MAINTENANCE">
                    Maintenance
                  </MenuItem>

                  <MenuItem value="UPGRADE">
                    Upgrade
                  </MenuItem>

                  <MenuItem value="DOWNGRADE">
                    Downgrade
                  </MenuItem>
                </Select>
              </FormControl>

              {/* PRIORITY */}
              <FormControl fullWidth size="small">
                <InputLabel sx={labelSx}>
                  Prioritas
                </InputLabel>

                <Select
                  value={form.priority}
                  label="Prioritas"
                  onChange={(event) =>
                    updateForm(
                      "priority",
                      event.target.value
                    )
                  }
                  sx={selectSx}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="NORMAL">
                    Normal
                  </MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">
                    Urgent
                  </MenuItem>
                </Select>
              </FormControl>

              {/* SCHEDULE */}
              <TextField
                fullWidth
                size="small"
                label="Jadwal Pekerjaan"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) =>
                  updateForm(
                    "scheduledAt",
                    event.target.value
                  )
                }
                sx={{
                  ...fieldSx,
                  "& input": {
                    colorScheme: "dark",
                  },
                }}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              {/* TITLE */}
              <TextField
                fullWidth
                size="small"
                label="Judul Pekerjaan"
                placeholder="Contoh: Internet customer tidak stabil"
                value={form.title}
                onChange={(event) =>
                  updateForm("title", event.target.value)
                }
                sx={{
                  ...fieldSx,
                  gridColumn: { sm: "span 2" },
                }}
              />

              {/* DESCRIPTION */}
              <TextField
                fullWidth
                multiline
                minRows={5}
                label="Deskripsi Pekerjaan"
                placeholder="Jelaskan masalah atau pekerjaan yang harus dilakukan teknisi..."
                value={form.description}
                onChange={(event) =>
                  updateForm(
                    "description",
                    event.target.value
                  )
                }
                sx={{
                  ...fieldSx,
                  gridColumn: { sm: "span 2" },
                }}
              />
            </Box>

            {/* ACTION */}
            <Box
              sx={{
                mt: 3,
                pt: 2.5,
                borderTop:
                  "1px solid rgba(255,255,255,.06)",
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.5,
              }}
            >
              <Button
                onClick={() =>
                  router.push(
                    "/gnet-console/work-orders"
                  )
                }
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
                    <CircularProgress
                      size={17}
                      sx={{ color: "#001b0d" }}
                    />
                  ) : (
                    <SaveOutlined />
                  )
                }
                sx={{
                  minHeight: 42,
                  px: 2.5,
                  borderRadius: 2,
                  textTransform: "none",
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
                {saving
                  ? "Menyimpan..."
                  : "Simpan Work Order"}
              </Button>
            </Box>
          </Paper>

          {/* SIDE INFORMATION */}
          <Box>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                background:
                  "linear-gradient(145deg, rgba(0,230,118,.08), rgba(15,23,42,.75))",
                border:
                  "1px solid rgba(0,230,118,.12)",
              }}
            >
              <Typography
                sx={{
                  color: "#00e676",
                  fontWeight: 900,
                  fontSize: 13,
                  mb: 1.5,
                }}
              >
                Alur Work Order
              </Typography>

              <FlowItem
                number="01"
                title="Customer"
                description="Tentukan customer yang membutuhkan layanan."
              />

              <FlowItem
                number="02"
                title="Penugasan"
                description="Assign pekerjaan kepada teknisi."
              />

              <FlowItem
                number="03"
                title="Pengerjaan"
                description="Teknisi menjalankan pekerjaan di lapangan."
              />

              <FlowItem
                number="04"
                title="Penyelesaian"
                description="Teknisi mengisi hasil dan menandai pekerjaan selesai."
                last
              />
            </Paper>

            {form.customerId && (
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 2.5,
                  borderRadius: 3,
                  background: "rgba(15,23,42,.72)",
                  border:
                    "1px solid rgba(255,255,255,.07)",
                }}
              >
                <Typography
                  sx={{
                    color: "rgba(255,255,255,.4)",
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: ".6px",
                    mb: 1,
                  }}
                >
                  Customer Terpilih
                </Typography>

                {(() => {
                  const customer = customers.find(
                    (item) =>
                      item.id === Number(form.customerId)
                  );

                  if (!customer) return null;

                  return (
                    <>
                      <Typography
                        sx={{
                          color: "#fff",
                          fontWeight: 900,
                          fontSize: 16,
                        }}
                      >
                        {customer.name}
                      </Typography>

                      <Typography
                        sx={{
                          color: "#00e676",
                          fontSize: 11,
                          mt: 0.4,
                          fontWeight: 700,
                        }}
                      >
                        {customer.customerCode}
                      </Typography>

                      {customer.phone && (
                        <Typography
                          sx={{
                            color:
                              "rgba(255,255,255,.5)",
                            fontSize: 12,
                            mt: 1,
                          }}
                        >
                          {customer.phone}
                        </Typography>
                      )}

                      {customer.address && (
                        <Typography
                          sx={{
                            color:
                              "rgba(255,255,255,.42)",
                            fontSize: 11,
                            mt: 0.7,
                            lineHeight: 1.5,
                          }}
                        >
                          {customer.address}
                        </Typography>
                      )}
                    </>
                  );
                })()}
              </Paper>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function FlowItem({
  number,
  title,
  description,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        position: "relative",
        pb: last ? 0 : 2.5,
        mb: last ? 0 : 2.5,
      }}
    >
      {!last && (
        <Box
          sx={{
            position: "absolute",
            left: 15,
            top: 31,
            bottom: 0,
            width: 1,
            background: "rgba(0,230,118,.15)",
          }}
        />
      )}

      <Box
        sx={{
          flexShrink: 0,
          width: 31,
          height: 31,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,230,118,.1)",
          border: "1px solid rgba(0,230,118,.2)",
          color: "#00e676",
          fontSize: 9,
          fontWeight: 900,
          zIndex: 1,
        }}
      >
        {number}
      </Box>

      <Box>
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: "rgba(255,255,255,.4)",
            fontSize: 11,
            lineHeight: 1.5,
            mt: 0.3,
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
}