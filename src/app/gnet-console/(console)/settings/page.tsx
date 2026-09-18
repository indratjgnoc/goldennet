"use client";

import { useEffect, useState } from "react";
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
  CircularProgress,
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

const green = "#00e676";

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

  "& .MuiInputBase-input::placeholder": {
    color: "rgba(255,255,255,.25)",
    opacity: 1,
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

type SettingsForm = {
  companyName: string;
  applicationName: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
  registrationOpen: boolean;
  maintenanceMode: boolean;
};

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    companyName: "Fiandra Net",
    applicationName: "Fiandra Net Management",
    email: "",
    phone: "",
    address: "",
    timezone: "Asia/Jakarta",
    registrationOpen: true,
    maintenanceMode: false,
  });

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Update satu field form.
   */
  const updateField = <K extends keyof SettingsForm>(
    field: K,
    value: SettingsForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
    setErrorMessage("");
  };

  /**
   * Ambil settings dari database.
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoadingSettings(true);
        setErrorMessage("");

        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              result.error ||
              `Gagal mengambil pengaturan sistem (${response.status})`,
          );
        }

        const data = result.data ?? {};

        setForm({
          companyName: data.company_name ?? "Fiandra Net",
          applicationName: data.application_name ?? "Fiandra Net Management",
          email: data.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          timezone: data.timezone ?? "Asia/Jakarta",

          registrationOpen:
            data.registration_open === true ||
            data.registration_open === "true",

          maintenanceMode:
            data.maintenance_mode === true || data.maintenance_mode === "true",
        });
      } catch (error) {
        console.error("Load settings error:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil pengaturan sistem",
        );
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  /**
   * Simpan settings ke database.
   */
  const handleSave = async () => {
    try {
      setSavingSettings(true);
      setSaved(false);
      setErrorMessage("");

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: form.companyName,
          application_name: form.applicationName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          timezone: form.timezone,
          registration_open: form.registrationOpen,
          maintenance_mode: form.maintenanceMode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan pengaturan sistem");
      }

      /*
       * Sinkronkan kembali state dengan response database.
       */
      const data = result.data ?? {};

      setForm({
        companyName: data.company_name ?? form.companyName,
        applicationName: data.application_name ?? form.applicationName,
        email: data.email ?? form.email,
        phone: data.phone ?? form.phone,
        address: data.address ?? form.address,
        timezone: data.timezone ?? form.timezone,

        registrationOpen:
          data.registration_open === true || data.registration_open === "true",

        maintenanceMode:
          data.maintenance_mode === true || data.maintenance_mode === "true",
      });

      setSaved(true);

      /*
       * Hilangkan status berhasil setelah beberapa detik.
       */
      window.setTimeout(() => {
        setSaved(false);
      }, 4000);
    } catch (error) {
      console.error("Save settings error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan pengaturan sistem",
      );
    } finally {
      setSavingSettings(false);
    }
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
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

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
              Kelola konfigurasi dan informasi sistem Fiandra Net.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={
              savingSettings ? (
                <CircularProgress
                  size={18}
                  sx={{
                    color: "#001b0c",
                  }}
                />
              ) : (
                <SaveOutlined />
              )
            }
            onClick={handleSave}
            disabled={loadingSettings || savingSettings}
            sx={{
              minWidth: { xs: "100%", md: 170 },
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 800,
              background: green,
              color: "#001b0c",
              boxShadow: "0 10px 30px rgba(0,230,118,.16)",

              "&:hover": {
                background: "#00c965",
              },

              "&.Mui-disabled": {
                background: "rgba(0,230,118,.25)",
                color: "rgba(0,0,0,.45)",
              },
            }}
          >
            {savingSettings ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </Box>

        {/* ========================================================= */}
        {/* STATUS */}
        {/* ========================================================= */}

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
            Pengaturan berhasil disimpan ke database.
          </Alert>
        )}

        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2.5,
              background: "rgba(244,67,54,.07)",
              border: "1px solid rgba(244,67,54,.18)",
              color: "#ffb4ab",
            }}
          >
            {errorMessage}
          </Alert>
        )}

        {/* ========================================================= */}
        {/* LOADING */}
        {/* ========================================================= */}

        {loadingSettings ? (
          <Box
            sx={{
              minHeight: 400,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress
              size={38}
              thickness={3}
              sx={{
                color: green,
              }}
            />

            <Typography
              sx={{
                color: "rgba(255,255,255,.45)",
                fontSize: 13,
              }}
            >
              Memuat pengaturan sistem...
            </Typography>
          </Box>
        ) : (
          <>
            {/* ===================================================== */}
            {/* GENERAL */}
            {/* ===================================================== */}

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
              <CardContent
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                }}
              >
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
                  {/* Nama Perusahaan */}

                  <TextField
                    fullWidth
                    label="Nama Perusahaan"
                    value={form.companyName}
                    onChange={(event) =>
                      updateField("companyName", event.target.value)
                    }
                    disabled={savingSettings}
                    sx={fieldSx}
                  />

                  {/* Nama Aplikasi */}

                  <TextField
                    fullWidth
                    label="Nama Aplikasi"
                    value={form.applicationName}
                    onChange={(event) =>
                      updateField("applicationName", event.target.value)
                    }
                    disabled={savingSettings}
                    sx={fieldSx}
                  />

                  {/* Email */}

                  <TextField
                    fullWidth
                    label="Email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="admin@fiandraneet.id"
                    type="email"
                    disabled={savingSettings}
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

                  {/* Nomor Telepon */}

                  <TextField
                    fullWidth
                    label="Nomor Telepon"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder="08xxxxxxxxxx"
                    disabled={savingSettings}
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

                  {/* Alamat */}

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Alamat"
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    disabled={savingSettings}
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

            {/* ===================================================== */}
            {/* SYSTEM + ACCOUNT */}
            {/* ===================================================== */}

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
              {/* =================================================== */}
              {/* SYSTEM */}
              {/* =================================================== */}

              <Card
                sx={{
                  background: "rgba(15,23,42,.72)",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 4,
                  backdropFilter: "blur(18px)",
                  color: "#fff",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                  }}
                >
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

                  {/* TIMEZONE */}

                  <FormControl
                    fullWidth
                    sx={selectSx}
                    disabled={savingSettings}
                  >
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
                      <MenuItem value="Asia/Jakarta">
                        Asia/Jakarta — WIB
                      </MenuItem>

                      <MenuItem value="Asia/Makassar">
                        Asia/Makassar — WITA
                      </MenuItem>

                      <MenuItem value="Asia/Jayapura">
                        Asia/Jayapura — WIT
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {/* REGISTRATION */}

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
                            updateField(
                              "registrationOpen",
                              event.target.checked,
                            )
                          }
                          disabled={savingSettings}
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

                  {/* MAINTENANCE */}

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
                          disabled={savingSettings}
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

              {/* =================================================== */}
              {/* ACCOUNT */}
              {/* =================================================== */}

              <Card
                sx={{
                  background: "rgba(15,23,42,.72)",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 4,
                  backdropFilter: "blur(18px)",
                  color: "#fff",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                  }}
                >
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

                  {/* ACCOUNT INFO */}

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
                        flexShrink: 0,
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

                    <Box
                      sx={{
                        minWidth: 0,
                      }}
                    >
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

                  {/* CHANGE PASSWORD */}

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
          </>
        )}
      </Box>
    </Box>
  );
}
