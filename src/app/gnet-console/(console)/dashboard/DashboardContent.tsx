"use client";

import React, { type ReactNode } from "react";
import {
  People,
  PersonAdd,
  Wifi,
  Inventory2,
  Business,
  PendingActions,
  TrendingUp,
  CheckCircle,
  AccountTreeRounded,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";

/* =========================================================
   TYPES
========================================================= */

type User = {
  id: number;
  name: string;
  username: string;
  role: string;
};

type Statistics = {
  totalUsers: number;
  activeUsers: number;
  totalCustomers: number;
  activeCustomers: number;
  pendingRegistrations: number;
  activeSubscriptions: number;
  totalPackages: number;
  totalBranches: number;
};

type Props = {
  user: User;
  statistics: Statistics;
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        background:
          "linear-gradient(145deg, rgba(15,23,42,.96), rgba(2,6,23,.99))",
        border: "1px solid rgba(148,163,184,.11)",
        borderRadius: 3,
        boxShadow: "0 15px 45px rgba(0,0,0,.22)",
        transition: "all .25s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "rgba(0,230,118,.25)",
          boxShadow: "0 20px 55px rgba(0,230,118,.08)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        {/* TOP */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          {/* ICON */}
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,230,118,.10)",
              color: "#00e676",
              border: "1px solid rgba(0,230,118,.08)",
            }}
          >
            {icon}
          </Box>

          {/* LIVE */}
          <Chip
            icon={<TrendingUp sx={{ fontSize: 15 }} />}
            label="Live"
            size="small"
            sx={{
              height: 25,
              color: "#00e676",
              background: "rgba(0,230,118,.07)",
              border: "1px solid rgba(0,230,118,.14)",
              fontSize: 11,
              fontWeight: 700,
              "& .MuiChip-icon": {
                color: "#00e676",
              },
            }}
          />
        </Box>

        {/* TITLE */}
        <Typography
          sx={{
            color: "#94a3b8",
            fontSize: 13,
            fontWeight: 500,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>

        {/* VALUE */}
        <Typography
          sx={{
            color: "#f8fafc",
            fontSize: {
              xs: 27,
              md: 30,
            },
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -0.5,
          }}
        >
          {value.toLocaleString("id-ID")}
        </Typography>

        {/* SUBTITLE */}
        <Typography
          sx={{
            color: "#64748b",
            fontSize: 12,
            mt: 1,
          }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        background:
          "linear-gradient(145deg, rgba(15,23,42,.88), rgba(2,6,23,.96))",
        border: "1px solid rgba(148,163,184,.10)",
        borderRadius: 3,
        transition: "all .25s ease",
        "&:hover": {
          borderColor: "rgba(0,230,118,.20)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,230,118,.08)",
            color: "#00e676",
            mb: 1.5,
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            color: "#94a3b8",
            fontSize: 13,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: "#f8fafc",
            fontSize: 25,
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              color: "#64748b",
              fontSize: 11,
              mt: 0.8,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================
   DASHBOARD CONTENT
========================================================= */

export default function DashboardContent({ user, statistics }: Props) {
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
      }}
    >
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

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
            xs: 1,
            sm: 2,
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
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              color: "#00e676",
              mb: 0.5,
            }}
          >
            GOLDEN NET / CUSTOMER MANAGEMENT
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: 25,
                sm: 28,
                md: 31,
              },
              fontWeight: 800,
              letterSpacing: -0.8,
              lineHeight: 1.15,
            }}
          >
            Dashboard
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              mt: 0.6,
              fontSize: 13,
            }}
          >
            Monitoring & management Golden Net
          </Typography>
        </Box>

        <Chip
          icon={<CheckCircle sx={{ fontSize: 17 }} />}
          label="System Online"
          sx={{
            height: 34,
            color: "#00e676",
            background: "rgba(0,230,118,.07)",
            border: "1px solid rgba(0,230,118,.16)",
            fontSize: 12,
            fontWeight: 700,
            "& .MuiChip-icon": {
              color: "#00e676",
            },
          }}
        />
      </Box>

      {/* =====================================================
          WELCOME CARD
      ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(0,230,118,.13), rgba(15,23,42,.95) 55%, rgba(2,6,23,.98))",
          border: "1px solid rgba(0,230,118,.15)",
          position: "relative",
        }}
      >
        {/* Decorative glow */}
        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            right: -90,
            top: -120,
            borderRadius: "50%",
            background: "rgba(0,230,118,.07)",
            filter: "blur(5px)",
            pointerEvents: "none",
          }}
        />

        <CardContent
          sx={{
            p: {
              xs: 2.5,
              sm: 3,
              md: 3.5,
            },
            "&:last-child": {
              pb: {
                xs: 2.5,
                sm: 3,
                md: 3.5,
              },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: {
                xs: "flex-start",
                md: "center",
              },
              justifyContent: "space-between",
              gap: 3,
              flexDirection: {
                xs: "column",
                md: "row",
              },
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "#00e676",
                  fontWeight: 800,
                  letterSpacing: 1,
                  mb: 1,
                }}
              >
                GOLDEN NET CONTROL CENTER
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: 20,
                    sm: 22,
                    md: 25,
                  },
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                Selamat datang, {user.name} 👋
              </Typography>

              <Typography
                sx={{
                  color: "#94a3b8",
                  fontSize: 13,
                  mt: 1,
                  maxWidth: 700,
                  lineHeight: 1.7,
                }}
              >
                Pantau kondisi operasional ISP dan kelola seluruh data Golden
                Net dari satu tempat.
              </Typography>
            </Box>

            <Box
              sx={{
                flexShrink: 0,
                px: 1.5,
                py: 1,
                borderRadius: 2,
                background: "rgba(2,6,23,.35)",
                border: "1px solid rgba(0,230,118,.12)",
              }}
            >
              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  mb: 0.3,
                }}
              >
                Login sebagai
              </Typography>

              <Typography
                sx={{
                  color: "#00e676",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {user.role}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* =====================================================
          PRIMARY STATISTICS
      ===================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          title="Total User"
          value={statistics.totalUsers}
          subtitle={`${statistics.activeUsers} user aktif`}
          icon={<People />}
        />

        <StatCard
          title="Total Customer"
          value={statistics.totalCustomers}
          subtitle={`${statistics.activeCustomers} customer aktif`}
          icon={<PersonAdd />}
        />

        <StatCard
          title="Subscription Aktif"
          value={statistics.activeSubscriptions}
          subtitle="Pelanggan berlangganan"
          icon={<Wifi />}
        />

        <StatCard
          title="Registrasi Pending"
          value={statistics.pendingRegistrations}
          subtitle="Menunggu proses"
          icon={<PendingActions />}
        />
      </Box>

      {/* =====================================================
          SECONDARY INFORMATION
      ===================================================== */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <InfoCard
          icon={<Inventory2 />}
          title="Paket Internet Aktif"
          value={statistics.totalPackages.toLocaleString("id-ID")}
          subtitle="Paket yang tersedia"
        />

        <InfoCard
          icon={<Business />}
          title="Branch Aktif"
          value={statistics.totalBranches.toLocaleString("id-ID")}
          subtitle="Lokasi operasional"
        />

        <InfoCard
          icon={<AccountTreeRounded />}
          title="Status Sistem"
          value="Operational"
          subtitle="Seluruh layanan berjalan normal"
        />
      </Box>

      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          background:
            "linear-gradient(145deg, rgba(15,23,42,.82), rgba(2,6,23,.95))",
          border: "1px solid rgba(148,163,184,.10)",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,
              md: 3,
            },
            "&:last-child": {
              pb: {
                xs: 2.5,
                md: 3,
              },
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              mb: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 800,
              }}
            >
              Aktivitas Terbaru
            </Typography>

            <Chip
              label="Coming Soon"
              size="small"
              sx={{
                color: "#94a3b8",
                background: "rgba(148,163,184,.06)",
                border: "1px solid rgba(148,163,184,.10)",
                fontSize: 10,
              }}
            />
          </Box>

          <Typography
            sx={{
              color: "#64748b",
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            Data aktivitas pelanggan dan operasional akan tampil di bagian ini.
          </Typography>

          <Divider
            sx={{
              borderColor: "rgba(148,163,184,.07)",
              my: 2.5,
            }}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              background: "rgba(0,230,118,.035)",
              border: "1px solid rgba(0,230,118,.06)",
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
                background: "rgba(0,230,118,.08)",
                color: "#00e676",
                flexShrink: 0,
              }}
            >
              <CheckCircle sx={{ fontSize: 18 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#cbd5e1",
                }}
              >
                Dashboard siap digunakan
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  color: "#64748b",
                  mt: 0.2,
                }}
              >
                Sistem berhasil memuat data operasional.
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Divider
        sx={{
          borderColor: "rgba(148,163,184,.07)",
          my: 4,
        }}
      />

      <Typography
        sx={{
          color: "#475569",
          fontSize: 11,
          textAlign: "center",
          pb: 1,
        }}
      >
        Golden Net ISP Management System
      </Typography>
    </Box>
  );
}
