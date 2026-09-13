"use client";

import { useMemo, useState } from "react";

import {
  AddRounded,
  EditRounded,
  SearchRounded,
  PeopleAltRounded,
  CheckCircleRounded,
  PendingActionsRounded,
  BlockRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

type Customer = {
  id: number;
  customerCode: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  status: "PROSPECT" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
  branch: {
    id: number;
    name: string;
    code: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type Branch = {
  id: number;
  name: string;
  code: string;
};

type Props = {
  user: {
    id: number;
    name: string;
    username: string;
    role: string;
  };
  initialCustomers: Customer[];
  branches: Branch[];
};

const statusConfig = {
  PROSPECT: {
    label: "Prospect",
    color: "#f59e0b",
  },
  ACTIVE: {
    label: "Aktif",
    color: "#00e676",
  },
  SUSPENDED: {
    label: "Suspended",
    color: "#ef4444",
  },
  INACTIVE: {
    label: "Tidak Aktif",
    color: "#94a3b8",
  },
};

export default function CustomersContent({ initialCustomers }: Props) {
  const [customers] = useState<Customer[]>(initialCustomers);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredCustomers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return customers.filter((customer) => {
      const matchesSearch =
        !keyword ||
        customer.customerCode.toLowerCase().includes(keyword) ||
        customer.name.toLowerCase().includes(keyword) ||
        customer.phone.toLowerCase().includes(keyword) ||
        customer.email?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "ACTIVE",
  ).length;

  const prospects = customers.filter(
    (customer) => customer.status === "PROSPECT",
  ).length;

  const suspendedCustomers = customers.filter(
    (customer) => customer.status === "SUSPENDED",
  ).length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: {
            xs: 2,
            md: 4,
          },
        }}
      >
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
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "#00e676",
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              GOLDEN NET
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: {
                  xs: "2rem",
                  md: "2.8rem",
                },
              }}
            >
              Customer Management
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Kelola seluruh data pelanggan Golden Net.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            sx={{
              borderRadius: 2.5,
              minHeight: 46,
              px: 2.5,
              fontWeight: 800,
              textTransform: "none",
              background: "linear-gradient(135deg, #00e676, #00a152)",
              color: "#001b0d",
              "&:hover": {
                background: "linear-gradient(135deg, #00f58a, #00b35b)",
              },
            }}
          >
            Tambah Customer
          </Button>
        </Box>

        {/* STATISTICS */}
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
            title="Total Customer"
            value={totalCustomers}
            icon={<PeopleAltRounded />}
          />

          <StatCard
            title="Customer Aktif"
            value={activeCustomers}
            icon={<CheckCircleRounded />}
          />

          <StatCard
            title="Prospect"
            value={prospects}
            icon={<PendingActionsRounded />}
          />

          <StatCard
            title="Suspended"
            value={suspendedCustomers}
            icon={<BlockRounded />}
          />
        </Box>

        {/* SEARCH & FILTER */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)",
            mb: 3,
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "2fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, kode customer, nomor telepon..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                select
                fullWidth
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
              >
                <option value="ALL">Semua Status</option>
                <option value="PROSPECT">Prospect</option>
                <option value="ACTIVE">Aktif</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="INACTIVE">Tidak Aktif</option>
              </TextField>
            </Box>
          </CardContent>
        </Card>

        {/* CUSTOMER LIST */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.025)",
            overflow: "hidden",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                mb: 2,
              }}
            >
              Daftar Customer
            </Typography>

            {filteredCustomers.length === 0 ? (
              <Box
                sx={{
                  py: 8,
                  textAlign: "center",
                }}
              >
                <PeopleAltRounded
                  sx={{
                    fontSize: 48,
                    color: "text.secondary",
                    mb: 1,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Tidak ada customer ditemukan
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Coba ubah kata pencarian atau filter.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {filteredCustomers.map((customer) => (
                  <Box
                    key={customer.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "2fr 1.5fr 1.5fr 1fr auto",
                      },
                      gap: 2,
                      alignItems: "center",
                      p: 2,
                      borderRadius: 3,
                      border: "1px solid rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.015)",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                        }}
                      >
                        {customer.name}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {customer.customerCode}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2">{customer.phone}</Typography>

                      <Typography variant="caption" color="text.secondary">
                        {customer.email || "-"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2">
                        {customer.branch?.name || "Belum ada branch"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {customer.branch?.code || "-"}
                      </Typography>
                    </Box>

                    <Chip
                      label={statusConfig[customer.status].label}
                      size="small"
                      sx={{
                        width: "fit-content",
                        color: statusConfig[customer.status].color,
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${statusConfig[customer.status].color}33`,
                        fontWeight: 700,
                      }}
                    />

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditRounded />}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.025)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2.5,
            background: "rgba(46,125,50,0.14)",
            color: "#00e676",
            mb: 2,
          }}
        >
          {icon}
        </Box>

        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            mt: 0.5,
          }}
        >
          {value.toLocaleString("id-ID")}
        </Typography>
      </CardContent>
    </Card>
  );
}
