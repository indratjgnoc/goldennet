"use client";

import {
  Business,
  DashboardRounded,
  Inventory2,
  LogoutRounded,
  Menu,
  People,
  PersonAdd,
  Settings,
  Wifi,
  Close,
  Subscriptions,
  LocationOn,
} from "@mui/icons-material";

import { Box, Button, Divider, IconButton, Typography } from "@mui/material";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type ConsoleUser = {
  id: number;
  name: string;
  username: string;
  role: string;
};

type Props = {
  user: ConsoleUser;
  children: React.ReactNode;
};

const menuItems = [
  {
    label: "Dashboard",
    href: "/gnet-console/dashboard",
    icon: <DashboardRounded />,
  },
  {
    label: "Users",
    href: "/gnet-console/users",
    icon: <People />,
  },
  {
    label: "Pelanggan",
    href: "/gnet-console/customers",
    icon: <People />,
  },
  {
    label: "Pendaftaran",
    href: "/gnet-console/registrations",
    icon: <PersonAdd />,
  },
  {
    label: "Paket Internet",
    href: "/gnet-console/packages",
    icon: <Wifi />,
  },
  {
    label: "Subscription",
    href: "/gnet-console/subscriptions",
    icon: <Subscriptions />,
  },
  {
    label: "Cabang",
    href: "/gnet-console/branches",
    icon: <Business />,
  },
  {
    label: 'Coverage Area',
    href: '/gnet-console/coverage',
    icon: <LocationOn />,
  },
  {
    label: "Inventory",
    href: "/gnet-console/inventory",
    icon: <Inventory2 />,
  },
];

function getRoleLabel(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";

    case "ADMIN":
      return "Administrator";

    case "TEKNISI":
      return "Teknisi";

    case "CUSTOMER_SERVICE":
      return "Customer Service";

    case "FINANCE":
      return "Finance";

    default:
      return role;
  }
}

export default function ConsoleShell({ user, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/gnet-console/login");
      router.refresh();
    }
  };

  const sidebarWidth = 270;

  const sidebar = (
    <Box
      sx={{
        width: sidebarWidth,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",

        background:
          "linear-gradient(180deg, rgba(2,6,23,0.99) 0%, rgba(4,12,25,0.99) 100%)",

        borderRight: "1px solid rgba(255,255,255,0.07)",

        boxShadow: "15px 0 50px rgba(0,0,0,0.25)",
      }}
    >
      {/* BRAND */}
      <Box
        sx={{
          height: 78,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: 2,
              color: "#fff",
            }}
          >
            FIANDRA
            <Box
              component="span"
              sx={{
                color: "#00e676",
                ml: 0.7,
              }}
            >
              NET
            </Box>
          </Typography>

          <Typography
            sx={{
              mt: 0.2,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 2,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
            }}
          >
            Operations Console
          </Typography>
        </Box>

        <IconButton
          onClick={() => setMobileOpen(false)}
          sx={{
            display: {
              xs: "flex",
              md: "none",
            },
            color: "rgba(255,255,255,0.7)",
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* USER */}
      <Box
        sx={{
          mx: 2,
          mt: 2,
          p: 1.7,
          borderRadius: 3,
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(2,6,23,0.95))",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Typography
          sx={{
            color: "#fff",
            fontSize: 14,
            fontWeight: 800,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.name}
        </Typography>

        <Typography
          sx={{
            mt: 0.3,
            color: "#00e676",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {getRoleLabel(user.role)}
        </Typography>
      </Box>

      {/* MENU */}
      <Box
        sx={{
          flex: 1,
          px: 1.5,
          py: 2,
          overflowY: "auto",
        }}
      >
        <Typography
          sx={{
            px: 1.5,
            mb: 1,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
          }}
        >
          Main Menu
        </Typography>

        {menuItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/gnet-console/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Box
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setMobileOpen(false);
              }}
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 1.5,

                px: 1.7,
                py: 1.35,
                mb: 0.5,

                borderRadius: 2,

                cursor: "pointer",

                color: active ? "#00e676" : "rgba(255,255,255,0.62)",

                background: active
                  ? "linear-gradient(90deg, rgba(0,230,118,0.14), rgba(0,230,118,0.04))"
                  : "transparent",

                transition: "all .2s ease",

                "&:hover": {
                  color: "#00e676",
                  background: "rgba(0,230,118,0.08)",
                  transform: "translateX(2px)",
                },

                "&::before": active
                  ? {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      height: "60%",
                      width: 3,
                      borderRadius: 5,
                      background: "#00e676",
                      boxShadow: "0 0 12px rgba(0,230,118,0.8)",
                    }
                  : {},
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  "& svg": {
                    fontSize: 21,
                  },
                }}
              >
                {item.icon}
              </Box>

              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: active ? 800 : 600,
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}

        <Divider
          sx={{
            my: 2,
            borderColor: "rgba(255,255,255,0.06)",
          }}
        />

        <Typography
          sx={{
            px: 1.5,
            mb: 1,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
          }}
        >
          System
        </Typography>

        <Box
          onClick={() => {
            router.push("/gnet-console/settings");
            setMobileOpen(false);
          }}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 1.7,
            py: 1.35,
            borderRadius: 2,
            cursor: "pointer",
            color: "rgba(255,255,255,0.62)",

            "&:hover": {
              color: "#00e676",
              background: "rgba(0,230,118,0.08)",
            },
          }}
        >
          <Settings sx={{ fontSize: 21 }} />

          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Settings
          </Typography>
        </Box>
      </Box>

      {/* LOGOUT */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Button
          fullWidth
          startIcon={<LogoutRounded />}
          onClick={handleLogout}
          sx={{
            justifyContent: "flex-start",
            px: 1.7,
            py: 1.25,
            borderRadius: 2,

            color: "rgba(255,255,255,0.55)",

            textTransform: "none",
            fontWeight: 700,

            "&:hover": {
              color: "#ff6b6b",
              background: "rgba(255,80,80,0.08)",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(0,230,118,0.09), transparent 28%), #020617",
        color: "#fff",
      }}
    >
      {/* DESKTOP SIDEBAR */}
      <Box
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
        }}
      >
        {sidebar}
      </Box>

      {/* MOBILE MENU BUTTON */}
      <IconButton
        onClick={() => setMobileOpen(true)}
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1100,

          display: {
            xs: "flex",
            md: "none",
          },

          color: "#00e676",
          background: "rgba(2,6,23,0.9)",
          border: "1px solid rgba(0,230,118,0.2)",

          "&:hover": {
            background: "rgba(0,230,118,0.1)",
          },
        }}
      >
        <Menu />
      </IconButton>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <>
          <Box
            onClick={() => setMobileOpen(false)}
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 1190,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
            }}
          />

          <Box
            sx={{
              display: {
                xs: "block",
                md: "none",
              },
            }}
          >
            {sidebar}
          </Box>
        </>
      )}

      {/* PAGE CONTENT */}
      <Box
        component="main"
        sx={{
          minHeight: "100vh",

          ml: {
            xs: 0,
            md: `${sidebarWidth}px`,
          },

          width: {
            xs: "100%",
            md: `calc(100% - ${sidebarWidth}px)`,
          },

          boxSizing: "border-box",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
