"use client";

import {
  AccountCircleOutlined,
  BusinessOutlined,
  CheckCircleOutlined,
  EmailOutlined,
  LanguageOutlined,
  LockOutlined,
  PhoneOutlined,
  SaveOutlined,
  SettingsOutlined,
  ShieldOutlined,
  TuneOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const green = "#00e676";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    companyName: "Golden Net",
    applicationName: "Golden Net Management",
    email: "",
    phone: "",
    address: "",
    timezone: "Asia/Jakarta",
    registrationOpen: true,
    maintenanceMode: false,
  });

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 3500);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(0,230,118,0.08), transparent 30%), #020617",
        color: "#fff",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                mb: 1,
              }}
            >
              <SettingsOutlined
                sx={{
                  color: green,
                  fontSize: 28,
                }}
              />

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                Settings
              </Typography>
            </Box>

            <Typography
              sx={{
                color: "rgba(255,255,255,.52)",
                fontSize: 14,
              }}
            >
              Kelola konfigurasi dan informasi sistem Golden Net.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<SaveOutlined />}
            onClick={handleSave}
            sx={{
              minWidth: 150,
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 800,
              background: green,
              color: "#001b0c",
              boxShadow: "0 10px 30px rgba(0,230,118,.16)",
              "&:hover": {
                background: "#00c965",
              },
            }}
          >
            Simpan Perubahan
          </Button>
        </Box>

        {saved && (
          <Alert
            icon={<CheckCircleOutlined />}
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2.5,
              background: "rgba(0,230,118,.08)",
              border: "1px solid rgba(0,230,118,.2)",
              color: "#b8ffd8",
              "& .MuiAlert-icon": {
                color: green,
              },
            }}
          >
            Pengaturan berhasil disimpan.
          </Alert>
        )}

        {/* General */}
        <Card
          sx={{
            mb: 3,
            background: "rgba(15,23,42,.72)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 4,
            backdropFilter: "blur(18px)",
            color: "#fff",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 1,
              }}
            >
              <BusinessOutlined sx={{ color: green }} />

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                }}
              >
                General
              </Typography>
            </Box>

            <Typography
              sx={{
                color: "rgba(255,255,255,.45)",
                fontSize: 13,
                mb: 3,
              }}
            >
              Informasi dasar perusahaan dan aplikasi.
            </Typography>

            <Divider
              sx={{
                borderColor: "rgba(255,255,255,.07)",
                mb: 3,
              }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1fr 1fr",
                },
                gap: 2.5,
              }}
            >
              <TextField
                fullWidth
                label="Nama Perusahaan"
                value={form.companyName}
                onChange={(event) =>
                  updateField("companyName", event.target.value)
                }
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: "rgba(255,255,255,.45)",
                    },
                  },
                }}
                sx={fieldSx}
              />

              <TextField
                fullWidth
                label="Nama Aplikasi"
                value={form.applicationName}
                onChange={(event) =>
                  updateField("applicationName", event.target.value)
                }
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: "rgba(255,255,255,.45)",
                    },
                  },
                }}
                sx={fieldSx}
              />

              <TextField
                fullWidth
                label="Email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="admin@goldennet.id"
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: "rgba(255,255,255,.45)",
                    },
                  },
                  input: {
                    startAdornment: (
                      <EmailOutlined
                        sx={{
                          mr: 1,
                          color: "rgba(255,255,255,.3)",
                          fontSize: 20,
                        }}
                      />
                    ),
                  },
                }}
                sx={fieldSx}
              />

              <TextField
                fullWidth
                label="Nomor Telepon"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="08xxxxxxxxxx"
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: "rgba(255,255,255,.45)",
                    },
                  },
                  input: {
                    startAdornment: (
                      <PhoneOutlined
                        sx={{
                          mr: 1,
                          color: "rgba(255,255,255,.3)",
                          fontSize: 20,
                        }}
                      />
                    ),
                  },
                }}
                sx={fieldSx}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Alamat"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: "rgba(255,255,255,.45)",
                    },
                  },
                }}
                sx={{
                  ...fieldSx,
                  gridColumn: {
                    xs: "auto",
                    md: "1 / -1",
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* System + Account */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "1.15fr .85fr",
            },
            gap: 3,
          }}
        >
          {/* System */}
          <Card
            sx={{
              background: "rgba(15,23,42,.72)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 4,
              backdropFilter: "blur(18px)",
              color: "#fff",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 1,
                }}
              >
                <TuneOutlined sx={{ color: green }} />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                  }}
                >
                  System
                </Typography>
              </Box>

              <Typography
                sx={{
                  color: "rgba(255,255,255,.45)",
                  fontSize: 13,
                  mb: 3,
                }}
              >
                Pengaturan operasional sistem.
              </Typography>

              <Divider
                sx={{
                  borderColor: "rgba(255,255,255,.07)",
                  mb: 2,
                }}
              />

              <FormControl fullWidth sx={selectSx}>
                <InputLabel>Timezone</InputLabel>

                <Select
                  value={form.timezone}
                  label="Timezone"
                  onChange={(event) =>
                    updateField("timezone", event.target.value)
                  }
                  startAdornment={
                    <LanguageOutlined
                      sx={{
                        mr: 1,
                        color: "rgba(255,255,255,.3)",
                        fontSize: 20,
                      }}
                    />
                  }
                >
                  <MenuItem value="Asia/Jakarta">Asia/Jakarta — WIB</MenuItem>

                  <MenuItem value="Asia/Makassar">
                    Asia/Makassar — WITA
                  </MenuItem>

                  <MenuItem value="Asia/Jayapura">Asia/Jayapura — WIT</MenuItem>
                </Select>
              </FormControl>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2.5,
                  border: "1px solid rgba(255,255,255,.06)",
                  background: "rgba(255,255,255,.025)",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.registrationOpen}
                      onChange={(event) =>
                        updateField("registrationOpen", event.target.checked)
                      }
                      sx={switchSx}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        Pendaftaran pelanggan
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(255,255,255,.4)",
                          fontSize: 12,
                        }}
                      >
                        Izinkan pendaftaran pelanggan baru.
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2.5,
                  border: "1px solid rgba(255,255,255,.06)",
                  background: "rgba(255,255,255,.025)",
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.maintenanceMode}
                      onChange={(event) =>
                        updateField("maintenanceMode", event.target.checked)
                      }
                      sx={switchSx}
                    />
                  }
                  label={
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        Maintenance Mode
                      </Typography>

                      <Typography
                        sx={{
                          color: "rgba(255,255,255,.4)",
                          fontSize: 12,
                        }}
                      >
                        Nonaktifkan sementara akses publik.
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </CardContent>
          </Card>

          {/* Account */}
          <Card
            sx={{
              background: "rgba(15,23,42,.72)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: 4,
              backdropFilter: "blur(18px)",
              color: "#fff",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 1,
                }}
              >
                <ShieldOutlined sx={{ color: green }} />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                  }}
                >
                  Account & Security
                </Typography>
              </Box>

              <Typography
                sx={{
                  color: "rgba(255,255,255,.45)",
                  fontSize: 13,
                  mb: 3,
                }}
              >
                Kelola akun administrator yang sedang digunakan.
              </Typography>

              <Divider
                sx={{
                  borderColor: "rgba(255,255,255,.07)",
                  mb: 2,
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: 3,
                  background: "rgba(0,230,118,.045)",
                  border: "1px solid rgba(0,230,118,.1)",
                }}
              >
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(0,230,118,.1)",
                    border: "1px solid rgba(0,230,118,.18)",
                  }}
                >
                  <AccountCircleOutlined
                    sx={{
                      color: green,
                      fontSize: 28,
                    }}
                  />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Administrator
                  </Typography>

                  <Chip
                    label="SUPER_ADMIN"
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 22,
                      fontSize: 10,
                      fontWeight: 800,
                      color: green,
                      background: "rgba(0,230,118,.08)",
                      border: "1px solid rgba(0,230,118,.15)",
                    }}
                  />
                </Box>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<LockOutlined />}
                sx={{
                  mt: 2,
                  py: 1.2,
                  borderRadius: 2.5,
                  borderColor: "rgba(255,255,255,.12)",
                  color: "rgba(255,255,255,.8)",
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": {
                    borderColor: green,
                    color: green,
                    background: "rgba(0,230,118,.04)",
                  },
                }}
              >
                Ganti Password
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: 2.5,
    background: "rgba(255,255,255,.025)",
    "& fieldset": {
      borderColor: "rgba(255,255,255,.1)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0,230,118,.35)",
    },
    "&.Mui-focused fieldset": {
      borderColor: green,
    },
  },

  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,.45)",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: green,
  },
};

const selectSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: 2.5,
    background: "rgba(255,255,255,.025)",
    "& fieldset": {
      borderColor: "rgba(255,255,255,.1)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(0,230,118,.35)",
    },
    "&.Mui-focused fieldset": {
      borderColor: green,
    },
  },

  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,.45)",
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: green,
  },

  "& .MuiSvgIcon-root": {
    color: "rgba(255,255,255,.5)",
  },
};

const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: green,
  },

  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: green,
  },
};
