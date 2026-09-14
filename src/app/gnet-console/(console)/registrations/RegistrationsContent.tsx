'use client';

import {
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  AssignmentRounded,
  CheckCircleRounded,
  CloseRounded,
  DoneAllRounded,
  EngineeringRounded,
  EventRounded,
  FilterAltRounded,
  GroupsRounded,
  HourglassTopRounded,
  InfoOutlined,
  LocationOnRounded,
  ManageSearchRounded,
  PhoneRounded,
  RefreshRounded,
  SearchRounded,
  VerifiedRounded,
  VisibilityRounded,
  WarningAmberRounded,
} from '@mui/icons-material';

type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'TEKNISI'
  | 'CUSTOMER_SERVICE'
  | 'FINANCE';

type RegistrationStatus =
  | 'PENDING'
  | 'SURVEY'
  | 'APPROVED'
  | 'INSTALLATION'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

type User = {
  id: number;
  name: string;
  username: string;
  role: UserRole;
};

type Branch = {
  id: number;
  name: string;
  code: string;
};

type InternetPackage = {
  id: number;
  name: string;
  code: string;
  speed: number;
  price: number;
  isPopular: boolean;
};

type RegistrationCustomer = {
  id: number;
  customerCode: string;
  name: string;
  phone: string;
  status:
    | 'PROSPECT'
    | 'ACTIVE'
    | 'SUSPENDED'
    | 'INACTIVE';
};

type Registration = {
  id: number;
  registrationCode: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  notes: string | null;
  status: RegistrationStatus;
  customerId: number | null;

  package: {
    id: number;
    name: string;
    code: string;
    speed: number;
    price: number;
    isPopular: boolean;
  };

  branch: Branch | null;

  customer: RegistrationCustomer | null;

  createdAt: string;
  updatedAt: string;
};

type Props = {
  user: User;
  initialRegistrations: Registration[];
  branches: Branch[];
  packages: InternetPackage[];
};

const STATUS_ORDER: RegistrationStatus[] = [
  'PENDING',
  'SURVEY',
  'APPROVED',
  'INSTALLATION',
  'COMPLETED',
];

const STATUS_CONFIG: Record<
  RegistrationStatus,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  PENDING: {
    label: 'Menunggu',
    color: '#fbbf24',
    icon: <HourglassTopRounded />,
  },

  SURVEY: {
    label: 'Survey',
    color: '#38bdf8',
    icon: <ManageSearchRounded />,
  },

  APPROVED: {
    label: 'Disetujui',
    color: '#a78bfa',
    icon: <VerifiedRounded />,
  },

  INSTALLATION: {
    label: 'Instalasi',
    color: '#fb923c',
    icon: <EngineeringRounded />,
  },

  COMPLETED: {
    label: 'Selesai',
    color: '#00e676',
    icon: <DoneAllRounded />,
  },

  REJECTED: {
    label: 'Ditolak',
    color: '#f87171',
    icon: <WarningAmberRounded />,
  },

  CANCELLED: {
    label: 'Dibatalkan',
    color: '#94a3b8',
    icon: <CloseRounded />,
  },
};

const ROLE_CAN_MANAGE: UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'CUSTOMER_SERVICE',
  'TEKNISI',
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    'id-ID',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(
    'id-ID',
    {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function getStatusChip(
  status: RegistrationStatus,
) {
  const config =
    STATUS_CONFIG[status];

  return (
    <Chip
      size="small"
      icon={config.icon as React.ReactElement}
      label={config.label}
      sx={{
        height: 30,
        color: config.color,
        backgroundColor: `${config.color}14`,
        border: `1px solid ${config.color}38`,
        fontWeight: 700,
        '& .MuiChip-icon': {
          color: config.color,
          fontSize: 17,
        },
      }}
    />
  );
}

function getNextStatuses(
  status: RegistrationStatus,
) {
  const transitions: Record<
    RegistrationStatus,
    RegistrationStatus[]
  > = {
    PENDING: [
      'SURVEY',
      'CANCELLED',
    ],

    SURVEY: [
      'APPROVED',
      'REJECTED',
      'CANCELLED',
    ],

    APPROVED: [
      'INSTALLATION',
      'CANCELLED',
    ],

    INSTALLATION: [
      'COMPLETED',
      'CANCELLED',
    ],

    COMPLETED: [],
    REJECTED: [],
    CANCELLED: [],
  };

  return transitions[status];
}

function canManageStatus(
  role: UserRole,
  currentStatus: RegistrationStatus,
  nextStatus: RegistrationStatus,
) {
  if (
    role === 'SUPER_ADMIN' ||
    role === 'ADMIN'
  ) {
    return true;
  }

  if (
    role === 'CUSTOMER_SERVICE'
  ) {
    return [
      'PENDING:SURVEY',
      'PENDING:CANCELLED',
      'SURVEY:REJECTED',
      'SURVEY:CANCELLED',
    ].includes(
      `${currentStatus}:${nextStatus}`,
    );
  }

  if (role === 'TEKNISI') {
    return [
      'SURVEY:APPROVED',
      'APPROVED:INSTALLATION',
      'INSTALLATION:COMPLETED',
      'INSTALLATION:CANCELLED',
    ].includes(
      `${currentStatus}:${nextStatus}`,
    );
  }

  return false;
}

export default function RegistrationsContent({
  user,
  initialRegistrations,
  branches,
  packages,
}: Props) {
  const [
    registrations,
    setRegistrations,
  ] = useState<Registration[]>(
    initialRegistrations,
  );

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<RegistrationStatus | ''>(
      '',
    );

  const [branchFilter, setBranchFilter] =
    useState('');

  const [packageFilter, setPackageFilter] =
    useState('');

  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);

  const [confirmStatus, setConfirmStatus] =
    useState<RegistrationStatus | null>(
      null,
    );

  const [loading, setLoading] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const filteredRegistrations =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      return registrations.filter(
        (registration) => {
          const matchesSearch =
            !keyword ||
            [
              registration.registrationCode,
              registration.name,
              registration.phone,
              registration.email ?? '',
              registration.address,
              registration.package.name,
              registration.branch?.name ?? '',
              registration.branch?.code ?? '',
            ]
              .join(' ')
              .toLowerCase()
              .includes(keyword);

          const matchesStatus =
            !statusFilter ||
            registration.status ===
              statusFilter;

          const matchesBranch =
            !branchFilter ||
            String(
              registration.branch?.id ?? '',
            ) === branchFilter;

          const matchesPackage =
            !packageFilter ||
            String(
              registration.package.id,
            ) === packageFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesBranch &&
            matchesPackage
          );
        },
      );
    }, [
      registrations,
      search,
      statusFilter,
      branchFilter,
      packageFilter,
    ]);

  const stats = useMemo(
    () => ({
      total: registrations.length,

      pending: registrations.filter(
        (item) =>
          item.status === 'PENDING',
      ).length,

      survey: registrations.filter(
        (item) =>
          item.status === 'SURVEY',
      ).length,

      approved: registrations.filter(
        (item) =>
          item.status === 'APPROVED',
      ).length,

      installation:
        registrations.filter(
          (item) =>
            item.status ===
            'INSTALLATION',
        ).length,

      completed: registrations.filter(
        (item) =>
          item.status === 'COMPLETED',
      ).length,
    }),
    [registrations],
  );

  const refreshRegistrations =
    async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          '/api/registrations',
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              'Gagal mengambil data pendaftaran.',
          );
        }

        setRegistrations(
          result.data ?? [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengambil data pendaftaran.',
        );
      } finally {
        setLoading(false);
      }
    };

  const updateStatus =
    async () => {
      if (
        !selectedRegistration ||
        !confirmStatus
      ) {
        return;
      }

      setUpdating(true);
      setError('');

      try {
        const response = await fetch(
          `/api/registrations/${selectedRegistration.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              status:
                confirmStatus,
            }),
          },
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              'Gagal memperbarui status.',
          );
        }

        const updatedStatus =
          result.data?.status ??
          confirmStatus;

        setRegistrations(
          (current) =>
            current.map(
              (registration) =>
                registration.id ===
                selectedRegistration.id
                  ? {
                      ...registration,
                      status:
                        updatedStatus,
                      updatedAt:
                        result.data
                          ?.updatedAt ??
                        new Date().toISOString(),
                    }
                  : registration,
            ),
        );

        setSelectedRegistration(
          (current) =>
            current
              ? {
                  ...current,
                  status:
                    updatedStatus,
                  updatedAt:
                    result.data
                      ?.updatedAt ??
                    new Date().toISOString(),
                }
              : current,
        );

        setSuccess(
          `Status ${selectedRegistration.registrationCode} berhasil diubah menjadi ${STATUS_CONFIG[updatedStatus as RegistrationStatus].label}.`,
        );

        setConfirmStatus(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal memperbarui status.',
        );
      } finally {
        setUpdating(false);
      }
    };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setBranchFilter('');
    setPackageFilter('');
  };

  const hasFilters =
    Boolean(
      search ||
        statusFilter ||
        branchFilter ||
        packageFilter,
    );

  return (
    <Box
      sx={{
        minHeight: '100%',
        width: '100%',
        color: '#f8fafc',
        background:
          'radial-gradient(circle at top right, rgba(0,230,118,0.09), transparent 28%), #020617',
        px: {
          xs: 1.5,
          sm: 2,
          md: 3,
          lg: 4,
        },
        py: {
          xs: 2,
          sm: 3,
          md: 4,
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          maxWidth: 1500,
          mx: 'auto',
          display: 'flex',
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
          justifyContent:
            'space-between',
          gap: 2,
          mb: 3,
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
        }}
      >
        <Box>
          <Typography
            sx={{
              color:
                'rgba(0,230,118,0.85)',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.8,
              mb: 0.8,
            }}
          >
            GOLDEN NET / REGISTRATION
            MANAGEMENT
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: 26,
                md: 32,
              },
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: -0.8,
            }}
          >
            Pendaftaran
          </Typography>

          <Typography
            sx={{
              mt: 0.8,
              color:
                'rgba(226,232,240,0.62)',
              fontSize: 14,
            }}
          >
            Kelola calon pelanggan dan
            proses pemasangan Golden Net.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Chip
            icon={
              <CheckCircleRounded />
            }
            label="System Online"
            sx={{
              color: '#00e676',
              backgroundColor:
                'rgba(0,230,118,0.08)',
              border:
                '1px solid rgba(0,230,118,0.2)',
              fontWeight: 700,
              '& .MuiChip-icon': {
                color: '#00e676',
              },
            }}
          />

          <Tooltip title="Refresh data">
            <span>
              <IconButton
                onClick={
                  refreshRegistrations
                }
                disabled={loading}
                sx={{
                  width: 42,
                  height: 42,
                  color:
                    'rgba(255,255,255,0.75)',
                  border:
                    '1px solid rgba(255,255,255,0.08)',
                  backgroundColor:
                    'rgba(15,23,42,0.75)',
                  '&:hover': {
                    color: '#00e676',
                    borderColor:
                      'rgba(0,230,118,0.35)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={19}
                    sx={{
                      color: '#00e676',
                    }}
                  />
                ) : (
                  <RefreshRounded />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 1500,
          mx: 'auto',
        }}
      >
        {/* ALERTS */}
        {error && (
          <Alert
            severity="error"
            onClose={() =>
              setError('')
            }
            sx={{
              mb: 2,
              color: '#fecaca',
              backgroundColor:
                'rgba(127,29,29,0.35)',
              border:
                '1px solid rgba(248,113,113,0.2)',
              '& .MuiAlert-icon': {
                color: '#f87171',
              },
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            onClose={() =>
              setSuccess('')
            }
            sx={{
              mb: 2,
              color: '#bbf7d0',
              backgroundColor:
                'rgba(20,83,45,0.3)',
              border:
                '1px solid rgba(0,230,118,0.2)',
              '& .MuiAlert-icon': {
                color: '#00e676',
              },
            }}
          >
            {success}
          </Alert>
        )}

        {/* STATS */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(6, minmax(0, 1fr))',
            },
            gap: 1.5,
            mb: 2,
          }}
        >
          <StatCard
            label="Total"
            value={stats.total}
            icon={
              <GroupsRounded />
            }
            accent="#00e676"
          />

          <StatCard
            label="Menunggu"
            value={stats.pending}
            icon={
              <HourglassTopRounded />
            }
            accent="#fbbf24"
          />

          <StatCard
            label="Survey"
            value={stats.survey}
            icon={
              <ManageSearchRounded />
            }
            accent="#38bdf8"
          />

          <StatCard
            label="Disetujui"
            value={stats.approved}
            icon={
              <VerifiedRounded />
            }
            accent="#a78bfa"
          />

          <StatCard
            label="Instalasi"
            value={stats.installation}
            icon={
              <EngineeringRounded />
            }
            accent="#fb923c"
          />

          <StatCard
            label="Selesai"
            value={stats.completed}
            icon={
              <DoneAllRounded />
            }
            accent="#00e676"
          />
        </Box>

        {/* MAIN CARD */}
        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            borderRadius: 2,
            border:
              '1px solid rgba(255,255,255,0.07)',
            background:
              'linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))',
            boxShadow:
              '0 25px 80px rgba(0,0,0,0.35)',
          }}
        >
          {/* TOOLBAR */}
          <Box
            sx={{
              p: {
                xs: 1.5,
                md: 2,
              },
              display: 'flex',
              flexDirection: {
                xs: 'column',
                md: 'row',
              },
              gap: 1.2,
              borderBottom:
                '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Cari kode, nama, telepon, email, alamat..."
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchRounded
                      sx={{
                        mr: 1,
                        fontSize: 20,
                        color:
                          'rgba(255,255,255,0.4)',
                      }}
                    />
                  ),
                },
              }}
              sx={fieldStyle}
            />

            <Select
              size="small"
              displayEmpty
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as RegistrationStatus | '',
                )
              }
              sx={selectStyle}
            >
              <MenuItem value="">
                Semua Status
              </MenuItem>

              {Object.entries(
                STATUS_CONFIG,
              ).map(
                ([
                  value,
                  config,
                ]) => (
                  <MenuItem
                    key={value}
                    value={value}
                  >
                    {config.label}
                  </MenuItem>
                ),
              )}
            </Select>

            <Select
              size="small"
              displayEmpty
              value={branchFilter}
              onChange={(event) =>
                setBranchFilter(
                  event.target.value,
                )
              }
              sx={selectStyle}
            >
              <MenuItem value="">
                Semua Branch
              </MenuItem>

              {branches.map(
                (branch) => (
                  <MenuItem
                    key={branch.id}
                    value={String(
                      branch.id,
                    )}
                  >
                    {branch.name}
                  </MenuItem>
                ),
              )}
            </Select>

            <Select
              size="small"
              displayEmpty
              value={packageFilter}
              onChange={(event) =>
                setPackageFilter(
                  event.target.value,
                )
              }
              sx={selectStyle}
            >
              <MenuItem value="">
                Semua Paket
              </MenuItem>

              {packages.map(
                (item) => (
                  <MenuItem
                    key={item.id}
                    value={String(
                      item.id,
                    )}
                  >
                    {item.name}
                  </MenuItem>
                ),
              )}
            </Select>

            {hasFilters && (
              <Button
                onClick={
                  resetFilters
                }
                startIcon={
                  <CloseRounded />
                }
                sx={{
                  minWidth: 100,
                  color:
                    'rgba(255,255,255,0.65)',
                  textTransform:
                    'none',
                  whiteSpace:
                    'nowrap',
                }}
              >
                Reset
              </Button>
            )}
          </Box>

          {/* RESULT INFO */}
          <Box
            sx={{
              px: 2,
              py: 1.4,
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'space-between',
              gap: 2,
              borderBottom:
                '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems:
                  'center',
                gap: 1,
              }}
            >
              <FilterAltRounded
                sx={{
                  fontSize: 18,
                  color:
                    '#00e676',
                }}
              />

              <Typography
                sx={{
                  color:
                    'rgba(226,232,240,0.65)',
                  fontSize: 13,
                }}
              >
                Menampilkan{' '}
                <Box
                  component="span"
                  sx={{
                    color: '#f8fafc',
                    fontWeight: 800,
                  }}
                >
                  {
                    filteredRegistrations.length
                  }
                </Box>{' '}
                pendaftaran
              </Typography>
            </Box>

            <Typography
              sx={{
                display: {
                  xs: 'none',
                  sm: 'block',
                },
                color:
                  'rgba(148,163,184,0.55)',
                fontSize: 12,
              }}
            >
              Role: {user.role}
            </Typography>
          </Box>

          {/* DESKTOP TABLE */}
          <Box
            sx={{
              display: {
                xs: 'none',
                md: 'block',
              },
              overflowX: 'auto',
            }}
          >
            <Box
              sx={{
                minWidth: 1050,
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1.45fr 2fr 1.55fr 1.35fr 1.2fr 110px',
                  gap: 2,
                  px: 2.5,
                  py: 1.5,
                  color:
                    'rgba(148,163,184,0.7)',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform:
                    'uppercase',
                  borderBottom:
                    '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <Box>
                  Pendaftaran
                </Box>

                <Box>
                  Calon Pelanggan
                </Box>

                <Box>
                  Paket
                </Box>

                <Box>
                  Branch
                </Box>

                <Box>
                  Status
                </Box>

                <Box
                  sx={{
                    textAlign:
                      'right',
                  }}
                >
                  Aksi
                </Box>
              </Box>

              {filteredRegistrations.length ===
              0 ? (
                <EmptyState />
              ) : (
                filteredRegistrations.map(
                  (registration) => (
                    <RegistrationRow
                      key={
                        registration.id
                      }
                      registration={
                        registration
                      }
                      onView={() =>
                        setSelectedRegistration(
                          registration,
                        )
                      }
                    />
                  ),
                )
              )}
            </Box>
          </Box>

          {/* MOBILE */}
          <Box
            sx={{
              display: {
                xs: 'block',
                md: 'none',
              },
              p: 1.25,
            }}
          >
            {filteredRegistrations.length ===
            0 ? (
              <EmptyState />
            ) : (
              filteredRegistrations.map(
                (registration) => (
                  <MobileRegistrationCard
                    key={
                      registration.id
                    }
                    registration={
                      registration
                    }
                    onView={() =>
                      setSelectedRegistration(
                        registration,
                      )
                    }
                  />
                ),
              )
            )}
          </Box>
        </Paper>

        {/* FOOTER */}
        <Box
          sx={{
            mt: 2,
            px: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              color:
                'rgba(148,163,184,0.45)',
            }}
          >
            Golden Net Management System
          </Typography>

          <Typography
            sx={{
              fontSize: 11,
              color:
                'rgba(148,163,184,0.45)',
            }}
          >
            Registration Management
          </Typography>
        </Box>
      </Box>

      {/* DETAIL DIALOG */}
      <Dialog
        open={
          Boolean(
            selectedRegistration,
          )
        }
        onClose={() =>
          !updating &&
          setSelectedRegistration(
            null,
          )
        }
        fullWidth
        maxWidth="md"
        slotProps={{
            paper: {
          sx: {
            color: '#f8fafc',
            borderRadius: 2,
            border:
              '1px solid rgba(255,255,255,0.08)',
            background:
              'linear-gradient(145deg, #0f172a, #020617)',
            boxShadow:
              '0 30px 100px rgba(0,0,0,0.55)',
            backgroundImage:
              'linear-gradient(145deg, #0f172a, #020617)',
          },
        },
        }}
      >
        {selectedRegistration && (
          <>
            <DialogTitle
              sx={{
                px: {
                  xs: 2,
                  md: 3,
                },
                py: 2,
                borderBottom:
                  '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems:
                    'flex-start',
                  justifyContent:
                    'space-between',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color:
                        '#00e676',
                      fontWeight: 800,
                      letterSpacing: 1.2,
                    }}
                  >
                    DETAIL PENDAFTARAN
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.6,
                      fontSize: {
                        xs: 18,
                        md: 22,
                      },
                      fontWeight: 800,
                    }}
                  >
                    {
                      selectedRegistration.registrationCode
                    }
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.4,
                      fontSize: 13,
                      color:
                        'rgba(226,232,240,0.55)',
                    }}
                  >
                    Dibuat{' '}
                    {formatDate(
                      selectedRegistration.createdAt,
                    )}
                  </Typography>
                </Box>

                <IconButton
                  onClick={() =>
                    setSelectedRegistration(
                      null,
                    )
                  }
                  disabled={updating}
                  sx={{
                    color:
                      'rgba(255,255,255,0.65)',
                    '&:hover': {
                      color: '#fff',
                      backgroundColor:
                        'rgba(255,255,255,0.06)',
                    },
                  }}
                >
                  <CloseRounded />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
              }}
            >
              {/* PROFILE */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: '1.25fr 0.75fr',
                  },
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <InfoCard
                  title="Calon Pelanggan"
                  icon={
                    <GroupsRounded />
                  }
                >
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 800,
                    }}
                  >
                    {
                      selectedRegistration.name
                    }
                  </Typography>

                  <Box
                    sx={{
                      mt: 1.4,
                      display: 'grid',
                      gap: 0.8,
                    }}
                  >
                    <InfoLine
                      icon={
                        <PhoneRounded />
                      }
                      text={
                        selectedRegistration.phone
                      }
                    />

                    {selectedRegistration.email && (
                      <InfoLine
                        icon={
                          <InfoOutlined />
                        }
                        text={
                          selectedRegistration.email
                        }
                      />
                    )}

                    <InfoLine
                      icon={
                        <LocationOnRounded />
                      }
                      text={
                        selectedRegistration.address
                      }
                    />
                  </Box>
                </InfoCard>

                <InfoCard
                  title="Paket Internet"
                  icon={
                    <AssignmentRounded />
                  }
                >
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    {
                      selectedRegistration.package.name
                    }
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: '#00e676',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {
                      selectedRegistration.package.speed
                    }{' '}
                    Mbps
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.8,
                      color:
                        'rgba(226,232,240,0.65)',
                      fontSize: 13,
                    }}
                  >
                    {formatCurrency(
                      selectedRegistration.package.price,
                    )}{' '}
                    / bulan
                  </Typography>

                  {selectedRegistration
                    .package
                    .isPopular && (
                    <Chip
                      size="small"
                      label="POPULAR"
                      sx={{
                        mt: 1.2,
                        width:
                          'fit-content',
                        color:
                          '#f4c542',
                        backgroundColor:
                          'rgba(244,197,66,0.08)',
                        border:
                          '1px solid rgba(244,197,66,0.22)',
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    />
                  )}
                </InfoCard>
              </Box>

              {/* AREA */}
              <InfoCard
                title="Area & Branch"
                icon={
                  <LocationOnRounded />
                }
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: '1fr 1fr',
                    },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color:
                          'rgba(148,163,184,0.65)',
                        textTransform:
                          'uppercase',
                        letterSpacing: 0.8,
                      }}
                    >
                      Branch
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontWeight: 700,
                      }}
                    >
                      {selectedRegistration
                        .branch
                        ?.name ??
                        'Belum tersedia'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color:
                          'rgba(148,163,184,0.65)',
                        textTransform:
                          'uppercase',
                        letterSpacing: 0.8,
                      }}
                    >
                      Kode Branch
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontWeight: 700,
                      }}
                    >
                      {selectedRegistration
                        .branch
                        ?.code ??
                        '-'}
                    </Typography>
                  </Box>
                </Box>
              </InfoCard>

              {/* TIMELINE */}
              <InfoCard
                title="Proses Pendaftaran"
                icon={
                  <EventRounded />
                }
                sx={{
                  mt: 1.5,
                }}
              >
                <RegistrationTimeline
                  status={
                    selectedRegistration.status
                  }
                />
              </InfoCard>

              {/* NOTES */}
              {selectedRegistration.notes && (
                <InfoCard
                  title="Catatan"
                  icon={
                    <InfoOutlined />
                  }
                  sx={{
                    mt: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      color:
                        'rgba(226,232,240,0.7)',
                      fontSize: 13,
                      lineHeight: 1.7,
                      whiteSpace:
                        'pre-wrap',
                    }}
                  >
                    {
                      selectedRegistration.notes
                    }
                  </Typography>
                </InfoCard>
              )}

              {/* CUSTOMER LINK */}
              {selectedRegistration.customer && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 2,
                    borderRadius: 1.5,
                    border:
                      '1px solid rgba(0,230,118,0.18)',
                    background:
                      'rgba(0,230,118,0.05)',
                  }}
                >
                  <Typography
                    sx={{
                      color:
                        '#00e676',
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 0.8,
                    }}
                  >
                    SUDAH TERHUBUNG KE
                    CUSTOMER
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 15,
                      fontWeight: 800,
                    }}
                  >
                    {
                      selectedRegistration.customer.name
                    }
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.2,
                      color:
                        'rgba(226,232,240,0.55)',
                      fontSize: 12,
                    }}
                  >
                    {
                      selectedRegistration.customer.customerCode
                    }
                  </Typography>
                </Box>
              )}
            </DialogContent>

            <DialogActions
              sx={{
                px: {
                  xs: 2,
                  md: 3,
                },
                py: 2,
                gap: 1,
                borderTop:
                  '1px solid rgba(255,255,255,0.07)',
                flexWrap: 'wrap',
                justifyContent:
                  'space-between',
              }}
            >
              <Box>
                {getStatusChip(
                  selectedRegistration.status,
                )}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                {getNextStatuses(
                  selectedRegistration.status,
                )
                  .filter(
                    (nextStatus) =>
                      canManageStatus(
                        user.role,
                        selectedRegistration.status,
                        nextStatus,
                      ),
                  )
                  .map(
                    (nextStatus) => {
                      const config =
                        STATUS_CONFIG[
                          nextStatus
                        ];

                      return (
                        <Button
                          key={
                            nextStatus
                          }
                          onClick={() =>
                            setConfirmStatus(
                              nextStatus,
                            )
                          }
                          disabled={
                            updating
                          }
                          startIcon={
                            config.icon
                          }
                          sx={{
                            color:
                              config.color,
                            border:
                              `1px solid ${config.color}40`,
                            backgroundColor:
                              `${config.color}0d`,
                            textTransform:
                              'none',
                            fontWeight: 800,
                            '&:hover':
                              {
                                backgroundColor:
                                  `${config.color}18`,
                              },
                          }}
                        >
                          {config.label}
                        </Button>
                      );
                    },
                  )}

                {getNextStatuses(
                  selectedRegistration.status,
                ).length === 0 && (
                  <Typography
                    sx={{
                      alignSelf:
                        'center',
                      color:
                        'rgba(148,163,184,0.55)',
                      fontSize: 12,
                    }}
                  >
                    Tidak ada aksi status
                    berikutnya.
                  </Typography>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* CONFIRM STATUS */}
      <Dialog
        open={
          Boolean(confirmStatus)
        }
        onClose={() =>
          !updating &&
          setConfirmStatus(null)
        }
        maxWidth="xs"
        fullWidth
        slotProps={{
            paper: {

          sx: {
            color: '#f8fafc',
            borderRadius: 2,
            border:
              '1px solid rgba(255,255,255,0.08)',
            background:
              'linear-gradient(145deg, #0f172a, #020617)',
          },
        },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Konfirmasi Perubahan
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color:
                'rgba(226,232,240,0.68)',
              lineHeight: 1.7,
            }}
          >
            Apakah Anda yakin ingin
            mengubah status pendaftaran
            ini menjadi{' '}
            <Box
              component="span"
              sx={{
                color:
                  confirmStatus
                    ? STATUS_CONFIG[
                        confirmStatus
                      ].color
                    : '#fff',
                fontWeight: 800,
              }}
            >
              {confirmStatus
                ? STATUS_CONFIG[
                    confirmStatus
                  ].label
                : ''}
            </Box>
            ?
          </Typography>

          {selectedRegistration && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor:
                  'rgba(255,255,255,0.035)',
                border:
                  '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {
                  selectedRegistration.registrationCode
                }
              </Typography>

              <Typography
                sx={{
                  mt: 0.3,
                  color:
                    'rgba(226,232,240,0.55)',
                  fontSize: 12,
                }}
              >
                {
                  selectedRegistration.name
                }
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={() =>
              setConfirmStatus(null)
            }
            disabled={updating}
            sx={{
              color:
                'rgba(255,255,255,0.65)',
              textTransform: 'none',
            }}
          >
            Batal
          </Button>

          <Button
            onClick={updateStatus}
            disabled={updating}
            startIcon={
              updating ? (
                <CircularProgress
                  size={16}
                  sx={{
                    color: '#001b0d',
                  }}
                />
              ) : (
                <CheckCircleRounded />
              )
            }
            sx={{
              color: '#001b0d',
              background:
                'linear-gradient(135deg, #00e676, #00b85c)',
              textTransform: 'none',
              fontWeight: 800,
              '&:hover': {
                background:
                  'linear-gradient(135deg, #19ff88, #00d96b)',
              },
            }}
          >
            {updating
              ? 'Memproses...'
              : 'Ya, Ubah Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        minWidth: 0,
        p: {
          xs: 1.4,
          md: 1.7,
        },
        borderRadius: 1.8,
        border:
          '1px solid rgba(255,255,255,0.07)',
        background:
          'linear-gradient(145deg, rgba(15,23,42,0.94), rgba(2,6,23,0.98))',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          gap: 1,
        }}
      >
        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              color:
                'rgba(148,163,184,0.7)',
              fontWeight: 800,
              textTransform:
                'uppercase',
              letterSpacing: 0.7,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow:
                'ellipsis',
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: {
                xs: 22,
                md: 25,
              },
              fontWeight: 850,
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: 1.2,
            display: 'grid',
            placeItems: 'center',
            color: accent,
            backgroundColor:
              `${accent}12`,
            border:
              `1px solid ${accent}25`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

function RegistrationRow({
  registration,
  onView,
}: {
  registration: Registration;
  onView: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns:
          '1.45fr 2fr 1.55fr 1.35fr 1.2fr 110px',
        gap: 2,
        px: 2.5,
        py: 1.7,
        alignItems: 'center',
        borderBottom:
          '1px solid rgba(255,255,255,0.045)',
        transition:
          'background-color 0.2s ease',
        '&:hover': {
          backgroundColor:
            'rgba(255,255,255,0.025)',
        },
      }}
    >
      <Box>
        <Typography
          sx={{
            color: '#00e676',
            fontSize: 12,
            fontWeight: 800,
            fontFamily:
              'monospace',
          }}
        >
          {registration.registrationCode}
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color:
              'rgba(148,163,184,0.55)',
            fontSize: 11,
          }}
        >
          {formatDate(
            registration.createdAt,
          )}
        </Typography>
      </Box>

      <Box
        sx={{
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 750,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow:
              'ellipsis',
          }}
        >
          {registration.name}
        </Typography>

        <Typography
          sx={{
            mt: 0.35,
            color:
              'rgba(226,232,240,0.5)',
            fontSize: 12,
          }}
        >
          {registration.phone}
        </Typography>
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {registration.package.name}
        </Typography>

        <Typography
          sx={{
            mt: 0.3,
            color: '#00e676',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {registration.package.speed}{' '}
          Mbps
        </Typography>
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {registration.branch
            ?.name ?? '-'}
        </Typography>

        <Typography
          sx={{
            mt: 0.25,
            color:
              'rgba(148,163,184,0.5)',
            fontSize: 11,
          }}
        >
          {registration.branch
            ?.code ?? ''}
        </Typography>
      </Box>

      <Box>
        {getStatusChip(
          registration.status,
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent:
            'flex-end',
        }}
      >
        <Tooltip title="Lihat detail">
          <IconButton
            onClick={onView}
            sx={{
              color:
                'rgba(255,255,255,0.65)',
              border:
                '1px solid rgba(255,255,255,0.07)',
              width: 38,
              height: 38,
              '&:hover': {
                color: '#00e676',
                borderColor:
                  'rgba(0,230,118,0.3)',
                backgroundColor:
                  'rgba(0,230,118,0.05)',
              },
            }}
          >
            <VisibilityRounded
              sx={{
                fontSize: 19,
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function MobileRegistrationCard({
  registration,
  onView,
}: {
  registration: Registration;
  onView: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.7,
        mb: 1.2,
        borderRadius: 1.7,
        border:
          '1px solid rgba(255,255,255,0.07)',
        background:
          'linear-gradient(145deg, rgba(15,23,42,0.94), rgba(2,6,23,0.98))',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent:
            'space-between',
          gap: 1,
        }}
      >
        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              color: '#00e676',
              fontSize: 11,
              fontWeight: 800,
              fontFamily:
                'monospace',
            }}
          >
            {registration.registrationCode}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            {registration.name}
          </Typography>
        </Box>

        <IconButton
          onClick={onView}
          sx={{
            flexShrink: 0,
            color: '#00e676',
            backgroundColor:
              'rgba(0,230,118,0.06)',
          }}
        >
          <VisibilityRounded
            sx={{
              fontSize: 19,
            }}
          />
        </IconButton>
      </Box>

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          gap: 1.2,
        }}
      >
        <MobileField
          label="Telepon"
          value={registration.phone}
        />

        <MobileField
          label="Paket"
          value={`${registration.package.name} · ${registration.package.speed} Mbps`}
        />

        <MobileField
          label="Branch"
          value={
            registration.branch
              ?.name ?? '-'
          }
        />

        <MobileField
          label="Tanggal"
          value={formatDate(
            registration.createdAt,
          )}
        />
      </Box>

      <Box
        sx={{
          mt: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'space-between',
          gap: 1,
        }}
      >
        {getStatusChip(
          registration.status,
        )}

        {registration.customer && (
          <Typography
            sx={{
              color: '#00e676',
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            CUSTOMER TERHUBUNG
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function MobileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: 9,
          color:
            'rgba(148,163,184,0.55)',
          textTransform:
            'uppercase',
          letterSpacing: 0.6,
          fontWeight: 800,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          fontSize: 12,
          color:
            'rgba(226,232,240,0.75)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow:
            'ellipsis',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function InfoCard({
  title,
  icon,
  children,
  sx,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  sx?: Record<string, unknown>;
}) {
  return (
    <Box
      sx={{
        p: {
          xs: 1.6,
          md: 2,
        },
        borderRadius: 1.6,
        border:
          '1px solid rgba(255,255,255,0.065)',
        backgroundColor:
          'rgba(255,255,255,0.025)',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          mb: 1.4,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 0.9,
            color: '#00e676',
            backgroundColor:
              'rgba(0,230,118,0.08)',
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 800,
            color:
              'rgba(226,232,240,0.65)',
            textTransform:
              'uppercase',
            letterSpacing: 0.8,
          }}
        >
          {title}
        </Typography>
      </Box>

      {children}
    </Box>
  );
}

function InfoLine({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems:
          'flex-start',
        gap: 0.8,
      }}
    >
      <Box
        sx={{
          color:
            'rgba(148,163,184,0.55)',
          mt: 0.1,
          display: 'flex',
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          color:
            'rgba(226,232,240,0.68)',
          fontSize: 13,
          lineHeight: 1.55,
          wordBreak:
            'break-word',
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

function RegistrationTimeline({
  status,
}: {
  status: RegistrationStatus;
}) {
  const isTerminal =
    status === 'REJECTED' ||
    status === 'CANCELLED';

  if (isTerminal) {
    return (
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1.2,
          border:
            `1px solid ${STATUS_CONFIG[status].color}30`,
          backgroundColor:
            `${STATUS_CONFIG[status].color}08`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems:
              'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              color:
                STATUS_CONFIG[
                  status
                ].color,
              display: 'flex',
            }}
          >
            {
              STATUS_CONFIG[
                status
              ].icon
            }
          </Box>

          <Typography
            sx={{
              fontWeight: 800,
              color:
                STATUS_CONFIG[
                  status
                ].color,
            }}
          >
            Pendaftaran{' '}
            {
              STATUS_CONFIG[
                status
              ].label.toLowerCase()
            }
          </Typography>
        </Box>

        <Typography
          sx={{
            mt: 0.7,
            color:
              'rgba(226,232,240,0.55)',
            fontSize: 12,
          }}
        >
          Proses pendaftaran
          berhenti pada status ini.
        </Typography>
      </Box>
    );
  }

  const currentIndex =
    STATUS_ORDER.indexOf(status);

  return (
    <Box>
      {STATUS_ORDER.map(
        (item, index) => {
          const config =
            STATUS_CONFIG[item];

          const completed =
            index <= currentIndex;

          const current =
            item === status;

          return (
            <Box
              key={item}
              sx={{
                display: 'flex',
                gap: 1.5,
                position:
                  'relative',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  flexShrink: 0,
                  display: 'flex',
                  justifyContent:
                    'center',
                  position:
                    'relative',
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius:
                      '50%',
                    display: 'grid',
                    placeItems:
                      'center',
                    zIndex: 1,
                    color:
                      completed
                        ? config.color
                        : 'rgba(148,163,184,0.35)',
                    backgroundColor:
                      completed
                        ? `${config.color}12`
                        : 'rgba(255,255,255,0.025)',
                    border:
                      `1px solid ${
                        completed
                          ? `${config.color}40`
                          : 'rgba(255,255,255,0.07)'
                      }`,
                  }}
                >
                  {completed ? (
                    config.icon
                  ) : (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius:
                          '50%',
                        backgroundColor:
                          'rgba(148,163,184,0.35)',
                      }}
                    />
                  )}
                </Box>

                {index <
                  STATUS_ORDER.length -
                    1 && (
                  <Box
                    sx={{
                      position:
                        'absolute',
                      top: 30,
                      bottom: 0,
                      width: 1,
                      backgroundColor:
                        index <
                        currentIndex
                          ? `${config.color}45`
                          : 'rgba(255,255,255,0.07)',
                    }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  pb:
                    index <
                    STATUS_ORDER.length -
                      1
                      ? 2.1
                      : 0,
                  pt: 0.3,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight:
                      current
                        ? 800
                        : 650,
                    color:
                      completed
                        ? config.color
                        : 'rgba(148,163,184,0.45)',
                  }}
                >
                  {config.label}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,
                    fontSize: 11,
                    color:
                      current
                        ? 'rgba(226,232,240,0.65)'
                        : 'rgba(148,163,184,0.35)',
                  }}
                >
                  {getTimelineDescription(
                    item,
                  )}
                </Typography>
              </Box>
            </Box>
          );
        },
      )}
    </Box>
  );
}

function getTimelineDescription(
  status: RegistrationStatus,
) {
  const descriptions: Record<
    RegistrationStatus,
    string
  > = {
    PENDING:
      'Pendaftaran diterima dan menunggu proses.',
    SURVEY:
      'Kelayakan lokasi sedang diperiksa.',
    APPROVED:
      'Pendaftaran disetujui untuk pemasangan.',
    INSTALLATION:
      'Proses instalasi jaringan sedang berjalan.',
    COMPLETED:
      'Pemasangan selesai.',
    REJECTED:
      'Pendaftaran ditolak.',
    CANCELLED:
      'Pendaftaran dibatalkan.',
  };

  return descriptions[status];
}

function EmptyState() {
  return (
    <Box
      sx={{
        py: 7,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 58,
          height: 58,
          mx: 'auto',
          display: 'grid',
          placeItems: 'center',
          borderRadius: 2,
          color:
            'rgba(0,230,118,0.65)',
          backgroundColor:
            'rgba(0,230,118,0.06)',
          border:
            '1px solid rgba(0,230,118,0.12)',
        }}
      >
        <AssignmentRounded />
      </Box>

      <Typography
        sx={{
          mt: 1.8,
          fontSize: 15,
          fontWeight: 800,
        }}
      >
        Tidak ada pendaftaran
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          color:
            'rgba(148,163,184,0.55)',
          fontSize: 12,
        }}
      >
        Belum ada data yang sesuai
        dengan filter yang dipilih.
      </Typography>
    </Box>
  );
}

const fieldStyle = {
  minWidth: {
    xs: '100%',
    md: 280,
  },

  '& .MuiOutlinedInput-root': {
    color: '#f8fafc',
    backgroundColor:
      'rgba(2,6,23,0.75)',
    borderRadius: 1.2,

    '& fieldset': {
      borderColor:
        'rgba(255,255,255,0.1)',
    },

    '&:hover fieldset': {
      borderColor:
        'rgba(0,230,118,0.4)',
    },

    '&.Mui-focused fieldset': {
      borderColor: '#00e676',
    },
  },

  '& .MuiInputBase-input': {
    fontSize: 13,
  },

  '& .MuiInputBase-input::placeholder': {
    color:
      'rgba(148,163,184,0.5)',
    opacity: 1,
  },
};

const selectStyle = {
  minWidth: {
    xs: '100%',
    md: 160,
  },

  color: '#f8fafc',

  backgroundColor:
    'rgba(2,6,23,0.75)',

  borderRadius: 1.2,

  '& .MuiOutlinedInput-notchedOutline':
    {
      borderColor:
        'rgba(255,255,255,0.1)',
    },

  '&:hover .MuiOutlinedInput-notchedOutline':
    {
      borderColor:
        'rgba(0,230,118,0.4)',
    },

  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
    {
      borderColor: '#00e676',
    },

  '& .MuiSelect-icon': {
    color:
      'rgba(255,255,255,0.5)',
  },
};