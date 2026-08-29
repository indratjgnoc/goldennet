import Link from "next/link";

import { Box, Button, Container, Stack, Typography } from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import NetworkCheckRoundedIcon from "@mui/icons-material/NetworkCheckRounded";
import LinkButton from "@/components/ui/LinkButton";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import ServicesSection from "@/components/home/ServicesSection";
import PackagesSection from "@/components/home/PackagesSection";
import CoverageCTA from "@/components/home/CoverageCTA";

const stats = [
  {
    icon: <SpeedRoundedIcon />,
    value: "High Speed",
    label: "Koneksi Cepat",
  },
  {
    icon: <WifiRoundedIcon />,
    value: "Stable",
    label: "Koneksi Stabil",
  },
  {
    icon: <NetworkCheckRoundedIcon />,
    value: "24/7",
    label: "Network Monitoring",
  },
  {
    icon: <SupportAgentRoundedIcon />,
    value: "Support",
    label: "Customer Support",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <Box
          component="section"
          sx={{
            minHeight: {
              xs: "auto",
              md: "calc(100vh - 76px)",
            },
            display: "flex",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* BACKGROUND GRID */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.25,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />

          {/* GREEN GLOW */}
          <Box
            sx={{
              position: "absolute",
              width: 650,
              height: 650,
              borderRadius: "50%",
              backgroundColor: "rgba(34,197,94,0.09)",
              filter: "blur(120px)",
              top: -200,
              right: -150,
            }}
          />

          <Container maxWidth="xl">
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                py: {
                  xs: 10,
                  md: 14,
                },
                maxWidth: 950,
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.8,
                  py: 0.8,
                  borderRadius: 10,
                  backgroundColor: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.16)",
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                    boxShadow: "0 0 15px rgba(34,197,94,0.8)",
                  }}
                />

                <Typography
                  component="span"
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    letterSpacing: "0.12em",
                  }}
                >
                  GOLDEN NET • BIARO
                </Typography>
              </Box>

              <Typography
                component="h1"
                sx={{
                  mt: 3,
                  fontSize: {
                    xs: "3.2rem",
                    sm: "4.5rem",
                    md: "6.5rem",
                  },
                  lineHeight: 0.94,
                  fontWeight: 900,
                  letterSpacing: "-0.055em",
                }}
              >
                INTERNET
                <br />
                <Box
                  component="span"
                  sx={{
                    color: "primary.main",
                  }}
                >
                  WITHOUT
                </Box>
                <br />
                LIMITS.
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 4,
                  maxWidth: 650,
                  fontSize: {
                    xs: "1rem",
                    md: "1.15rem",
                  },
                  lineHeight: 1.8,
                }}
              >
                Koneksi internet cepat, stabil, dan terpercaya untuk rumah,
                bisnis, pendidikan, dan kebutuhan profesional.
              </Typography>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
                sx={{ mt: 5 }}
              >
                <LinkButton
                  href="/paket"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    px: 3,
                    py: 1.5,
                  }}
                >
                  Lihat Paket Internet
                </LinkButton>

                <LinkButton
                  href="/coverage"
                  variant="outlined"
                  color="inherit"
                  size="large"
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderColor: "rgba(255,255,255,0.18)",
                  }}
                >
                  Cek Coverage
                </LinkButton>
              </Stack>
            </Box>
          </Container>
        </Box>

        {/* STATS */}
        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backgroundColor: "#080B09",
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
              }}
            >
              {stats.map((stat, index) => (
                <Box
                  key={stat.label}
                  sx={{
                    py: 3,
                    px: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.8,
                    borderRight:
                      index !== stats.length - 1
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "none",
                  }}
                >
                  <Box
                    sx={{
                      color: "primary.main",
                      display: "flex",
                    }}
                  >
                    {stat.icon}
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "0.9rem",
                      }}
                    >
                      {stat.value}
                    </Typography>

                    <Typography
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.72rem",
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        <ServicesSection />

        <PackagesSection />

        <CoverageCTA />
      </main>

      <Footer />
    </>
  );
}
