'use client';

import {
  Add,
  Autorenew,
  CheckCircle,
  Close,
  Edit,
  PauseCircle,
  Search,
  StopCircle,
  Wifi,
} from '@mui/icons-material';
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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Paper from '@mui/material/Paper';
import { useCallback, useEffect, useMemo, useState } from 'react';

type SubscriptionStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'TERMINATED';

type Customer = {
  id: number;
  customerCode: string;
  name: string;
  phone: string;
  status: string;
};

type Package = {
  id: number;
  name: string;
  code: string;
  speed: number;
  price: number;
  isActive: boolean;
};

type Subscription = {
  id: number;
  subscriptionCode: string;
  status: SubscriptionStatus;
  startDate: string | null;
  endDate: string | null;
  customerId: number;
  packageId: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  package: Package;
};

type FormData = {
  subscriptionCode: string;
  customerId: string;
  packageId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
};

const initialForm: FormData = {
  subscriptionCode: '',
  customerId: '',
  packageId: '',
  status: 'PENDING',
  startDate: '',
  endDate: '',
};

const statusConfig: Record<
  SubscriptionStatus,
  {
    label: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  PENDING: {
    label: 'Pending',
    color: '#f4c542',
    icon: <Autorenew fontSize="small" />,
  },
  ACTIVE: {
    label: 'Aktif',
    color: '#00e676',
    icon: <CheckCircle fontSize="small" />,
  },
  SUSPENDED: {
    label: 'Suspended',
    color: '#ffb300',
    icon: <PauseCircle fontSize="small" />,
  },
  TERMINATED: {
    label: 'Terminated',
    color: '#ef5350',
    icon: <StopCircle fontSize="small" />,
  },
};

const fieldStyle = {
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.65)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#00e676',
  },
  '& .MuiOutlinedInput-root': {
    color: '#f8fafc',
    background: 'rgba(255,255,255,0.025)',
    borderRadius: 2,
    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.1)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0,230,118,0.45)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#00e676',
    },
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255,255,255,0.6)',
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function toInputDate(value: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().slice(0, 10);
}

export default function SubscriptionContent() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SubscriptionStatus>(
    'ALL',
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [selected, setSelected] = useState<Subscription | null>(null);

  const [form, setForm] = useState<FormData>(initialForm);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Subscription | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<
    'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | null
  >(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const showMessage = useCallback((
    message: string,
    severity: 'success' | 'error' = 'success',
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [subscriptionResponse, customerResponse, packageResponse] =
        await Promise.all([
          fetch('/api/subscriptions', {
            cache: 'no-store',
          }),
          fetch('/api/customers', {
            cache: 'no-store',
          }),
          fetch('/api/packages?admin=true', {
            cache: 'no-store',
          }),
        ]);

      if (!subscriptionResponse.ok) {
        throw new Error('Gagal mengambil data subscription');
      }

      if (!customerResponse.ok) {
        throw new Error('Gagal mengambil data pelanggan');
      }

      if (!packageResponse.ok) {
        throw new Error('Gagal mengambil data paket');
      }

      const [subscriptionData, customerData, packageData] =
        await Promise.all([
          subscriptionResponse.json(),
          customerResponse.json(),
          packageResponse.json(),
        ]);

      setSubscriptions(subscriptionData.data ?? subscriptionData);
      setCustomers(customerData.data ?? customerData);
      setPackages(packageData.data ?? packageData);
    } catch (error) {
      console.error(error);

      showMessage(
        error instanceof Error
          ? error.message
          : 'Gagal memuat data subscription',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadData]);

  const filteredSubscriptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const matchesStatus =
        statusFilter === 'ALL' || subscription.status === statusFilter;

      const matchesSearch =
        !keyword ||
        subscription.subscriptionCode.toLowerCase().includes(keyword) ||
        subscription.customer.name.toLowerCase().includes(keyword) ||
        subscription.customer.customerCode.toLowerCase().includes(keyword) ||
        subscription.package.name.toLowerCase().includes(keyword) ||
        subscription.package.code.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [subscriptions, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: subscriptions.length,
      pending: subscriptions.filter((item) => item.status === 'PENDING').length,
      active: subscriptions.filter((item) => item.status === 'ACTIVE').length,
      suspended: subscriptions.filter(
        (item) => item.status === 'SUSPENDED',
      ).length,
      terminated: subscriptions.filter(
        (item) => item.status === 'TERMINATED',
      ).length,
    }),
    [subscriptions],
  );

  const openCreate = () => {
    setEditing(null);

    const date = new Date().toISOString().slice(0, 10);

    setForm({
      ...initialForm,
      subscriptionCode: `GNET-SUB-${Date.now().toString().slice(-8)}`,
      startDate: date,
    });

    setDialogOpen(true);
  };

  const openEdit = (subscription: Subscription) => {
    setEditing(subscription);

    setForm({
      subscriptionCode: subscription.subscriptionCode,
      customerId: String(subscription.customerId),
      packageId: String(subscription.packageId),
      status: subscription.status,
      startDate: toInputDate(subscription.startDate),
      endDate: toInputDate(subscription.endDate),
    });

    setDialogOpen(true);
  };

  const openDetail = (subscription: Subscription) => {
    setSelected(subscription);
    setDetailOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditing(null);
    setForm(initialForm);
  };

  const handleSave = async () => {
    if (!form.subscriptionCode.trim()) {
      showMessage('Kode subscription wajib diisi', 'error');
      return;
    }

    if (!form.customerId) {
      showMessage('Pelanggan wajib dipilih', 'error');
      return;
    }

    if (!form.packageId) {
      showMessage('Paket internet wajib dipilih', 'error');
      return;
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) < new Date(form.startDate)
    ) {
      showMessage('Tanggal berakhir tidak boleh sebelum tanggal mulai', 'error');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        subscriptionCode: form.subscriptionCode.trim(),
        customerId: Number(form.customerId),
        packageId: Number(form.packageId),
        status: form.status,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      const response = await fetch(
        editing
          ? `/api/subscriptions/${editing.id}`
          : '/api/subscriptions',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal menyimpan subscription');
      }

      showMessage(
        editing
          ? 'Subscription berhasil diperbarui'
          : 'Subscription berhasil ditambahkan',
      );

      closeDialog();
      await loadData();
    } catch (error) {
      console.error(error);

      showMessage(
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan subscription',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  const openStatusConfirmation = (
    subscription: Subscription,
    action: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED',
  ) => {
    setConfirmTarget(subscription);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const closeConfirmation = () => {
    if (saving) return;

    setConfirmOpen(false);
    setConfirmTarget(null);
    setConfirmAction(null);
  };

  const executeStatusAction = async () => {
    if (!confirmTarget || !confirmAction) return;

    try {
      setSaving(true);

      const response = await fetch(
        `/api/subscriptions/${confirmTarget.id}`,
        {
          method: confirmAction === 'TERMINATED' ? 'DELETE' : 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          ...(confirmAction !== 'TERMINATED'
            ? {
                body: JSON.stringify({
                  status: confirmAction,
                }),
              }
            : {}),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengubah status');
      }

      showMessage(
        confirmAction === 'TERMINATED'
          ? 'Subscription berhasil dihentikan'
          : `Subscription berhasil diubah menjadi ${statusConfig[confirmAction].label}`,
      );

      closeConfirmation();
      await loadData();
    } catch (error) {
      console.error(error);

      showMessage(
        error instanceof Error
          ? error.message
          : 'Gagal mengubah status subscription',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  const renderStatus = (status: SubscriptionStatus) => {
    const config = statusConfig[status];

    return (
      <Chip
        size="small"
        icon={config.icon as React.ReactElement}
        label={config.label}
        sx={{
          color: config.color,
          backgroundColor: `${config.color}12`,
          border: `1px solid ${config.color}35`,
          fontWeight: 700,
          '& .MuiChip-icon': {
            color: config.color,
          },
        }}
      />
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        color: '#f8fafc',
        pl: { xs: 0, sm: 1, md: 2, lg: 3 },
        pb: 4,
        background:
          'radial-gradient(circle at top right, rgba(0,230,118,0.09), transparent 28%)',
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          pt: { xs: 2, sm: 2.5, md: 3 },
          mb: 4,
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 11,
              letterSpacing: 2,
              fontWeight: 800,
              color: '#00e676',
              mb: 1,
            }}
          >
            FIANDRA NET / CUSTOMER MANAGEMENT
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: 27, md: 34 },
              fontWeight: 900,
              letterSpacing: -1,
            }}
          >
            Subscription
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255,255,255,0.55)',
              mt: 0.5,
              fontSize: 14,
            }}
          >
            Kelola layanan internet aktif pelanggan Fiandra Net
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreate}
          sx={{
            minHeight: 46,
            px: 2.5,
            borderRadius: 2,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00e676, #00b85c)',
            color: '#001b0d',
            boxShadow: '0 12px 30px rgba(0,230,118,0.15)',
            '&:hover': {
              background: 'linear-gradient(135deg, #19ff88, #00d96b)',
            },
          }}
        >
          Tambah Subscription
        </Button>
      </Box>

      {/* STATS */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          ['Total', stats.total, '#f8fafc'],
          ['Pending', stats.pending, '#f4c542'],
          ['Aktif', stats.active, '#00e676'],
          ['Suspended', stats.suspended, '#ffb300'],
          ['Terminated', stats.terminated, '#ef5350'],
        ].map(([label, value, color]) => (
          <Paper
            key={label as string}
            sx={{
              p: 2.2,
              borderRadius: 2.5,
              color: '#f8fafc',
              background:
                'linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.22)',
            }}
          >
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 12,
                fontWeight: 700,
                mb: 1,
              }}
            >
              {label}
            </Typography>

            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 900,
                color,
              }}
            >
              {value}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* MAIN */}
      <Paper
        sx={{
          overflow: 'hidden',
          borderRadius: 3,
          color: '#f8fafc',
          background:
            'linear-gradient(145deg, rgba(15,23,42,0.97), rgba(2,6,23,0.99))',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.35)',
        }}
      >
        {/* TOOLBAR */}
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            display: 'flex',
            gap: 1.5,
            flexDirection: { xs: 'column', md: 'row' },
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Cari kode, pelanggan, atau paket..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={fieldStyle}
            slotProps={{
              input: {
                startAdornment: (
                  <Search
                    sx={{
                      mr: 1,
                      color: 'rgba(255,255,255,0.35)',
                    }}
                  />
                ),
              },
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: { xs: '100%', md: 190 },
              ...fieldStyle,
            }}
          >
            <InputLabel>Status</InputLabel>

            <Select
              value={statusFilter}
              label="Status"
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as 'ALL' | SubscriptionStatus,
                )
              }
            >
              <MenuItem value="ALL">Semua Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="ACTIVE">Aktif</MenuItem>
              <MenuItem value="SUSPENDED">Suspended</MenuItem>
              <MenuItem value="TERMINATED">Terminated</MenuItem>
            </Select>
          </FormControl>

          <IconButton
            onClick={() => void loadData()}
            sx={{
              color: '#00e676',
              border: '1px solid rgba(0,230,118,0.2)',
              borderRadius: 2,
              width: { xs: '100%', md: 42 },
              height: 42,
            }}
          >
            <Autorenew />
          </IconButton>
        </Box>

        {/* TABLE */}
        {loading ? (
          <Box
            sx={{
              py: 10,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CircularProgress sx={{ color: '#00e676' }} />
          </Box>
        ) : filteredSubscriptions.length === 0 ? (
          <Box
            sx={{
              py: 10,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Wifi
              sx={{
                fontSize: 50,
                color: 'rgba(255,255,255,0.15)',
                mb: 1,
              }}
            />

            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              Belum ada subscription
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.45)',
                mt: 0.5,
                fontSize: 14,
              }}
            >
              Tambahkan subscription pelanggan untuk mulai mengelola layanan.
            </Typography>
          </Box>
        ) : (
          <>
            {/* DESKTOP */}
            <TableContainer
              sx={{
                display: { xs: 'none', md: 'block' },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    {[
                      'Subscription',
                      'Pelanggan',
                      'Paket',
                      'Periode',
                      'Status',
                      'Aksi',
                    ].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          color: 'rgba(255,255,255,0.45)',
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: 1,
                          borderColor: 'rgba(255,255,255,0.06)',
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow
                      key={subscription.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.025)',
                        },
                        '& td': {
                          borderColor: 'rgba(255,255,255,0.055)',
                        },
                      }}
                      onClick={() => openDetail(subscription)}
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: 13,
                          }}
                        >
                          {subscription.subscriptionCode}
                        </Typography>

                        <Typography
                          sx={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: 11,
                            mt: 0.3,
                          }}
                        >
                          #{subscription.id}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {subscription.customer.name}
                        </Typography>

                        <Typography
                          sx={{
                            color: '#00e676',
                            fontSize: 11,
                            mt: 0.3,
                          }}
                        >
                          {subscription.customer.customerCode}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {subscription.package.name}
                        </Typography>

                        <Typography
                          sx={{
                            color: 'rgba(255,255,255,0.45)',
                            fontSize: 11,
                            mt: 0.3,
                          }}
                        >
                          {subscription.package.speed} Mbps ·{' '}
                          {formatCurrency(subscription.package.price)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: 12 }}>
                          {formatDate(subscription.startDate)}
                        </Typography>

                        <Typography
                          sx={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: 11,
                          }}
                        >
                          s/d {formatDate(subscription.endDate)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {renderStatus(subscription.status)}
                      </TableCell>

                      <TableCell
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => openEdit(subscription)}
                            sx={{ color: '#00e676' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>

                          {subscription.status === 'PENDING' && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                openStatusConfirmation(
                                  subscription,
                                  'ACTIVE',
                                )
                              }
                              sx={{ color: '#00e676' }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          )}

                          {subscription.status === 'ACTIVE' && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                openStatusConfirmation(
                                  subscription,
                                  'SUSPENDED',
                                )
                              }
                              sx={{ color: '#ffb300' }}
                            >
                              <PauseCircle fontSize="small" />
                            </IconButton>
                          )}

                          {subscription.status === 'SUSPENDED' && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                openStatusConfirmation(
                                  subscription,
                                  'ACTIVE',
                                )
                              }
                              sx={{ color: '#00e676' }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          )}

                          {subscription.status !== 'TERMINATED' && (
                            <IconButton
                              size="small"
                              onClick={() =>
                                openStatusConfirmation(
                                  subscription,
                                  'TERMINATED',
                                )
                              }
                              sx={{ color: '#ef5350' }}
                            >
                              <StopCircle fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* MOBILE */}
            <Box
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {filteredSubscriptions.map((subscription) => (
                <Box
                  key={subscription.id}
                  onClick={() => openDetail(subscription)}
                  sx={{
                    p: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {subscription.subscriptionCode}
                      </Typography>

                      <Typography
                        sx={{
                          color: '#00e676',
                          fontSize: 11,
                          mt: 0.3,
                        }}
                      >
                        {subscription.customer.customerCode}
                      </Typography>
                    </Box>

                    {renderStatus(subscription.status)}
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {subscription.customer.name}
                  </Typography>

                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.55)',
                      fontSize: 12,
                      mt: 0.5,
                    }}
                  >
                    {subscription.package.name} ·{' '}
                    {subscription.package.speed} Mbps
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: 11,
                      }}
                    >
                      {formatDate(subscription.startDate)} —{' '}
                      {formatDate(subscription.endDate)}
                    </Typography>

                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEdit(subscription);
                      }}
                      sx={{ color: '#00e676' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}

        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            Menampilkan {filteredSubscriptions.length} dari{' '}
            {subscriptions.length} subscription
          </Typography>
        </Box>
      </Paper>

      {/* CREATE / EDIT DIALOG */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              color: '#f8fafc',
              background:
                'linear-gradient(145deg, #0f172a, #020617)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 3,
              boxShadow: '0 30px 100px rgba(0,0,0,0.55)',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {editing ? 'Edit Subscription' : 'Tambah Subscription'}

          <IconButton
            onClick={closeDialog}
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: '24px !important' }}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Kode Subscription"
              value={form.subscriptionCode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  subscriptionCode: event.target.value,
                }))
              }
              sx={fieldStyle}
            />

            <FormControl fullWidth sx={fieldStyle}>
              <InputLabel>Pelanggan</InputLabel>

              <Select
                value={form.customerId}
                label="Pelanggan"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customerId: event.target.value,
                  }))
                }
              >
                {customers.map((customer) => (
                  <MenuItem
                    key={customer.id}
                    value={String(customer.id)}
                  >
                    {customer.customerCode} — {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={fieldStyle}>
              <InputLabel>Paket Internet</InputLabel>

              <Select
                value={form.packageId}
                label="Paket Internet"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    packageId: event.target.value,
                  }))
                }
              >
                {packages
                  .filter((item) => item.isActive)
                  .map((pkg) => (
                    <MenuItem
                      key={pkg.id}
                      value={String(pkg.id)}
                    >
                      {pkg.name} — {pkg.speed} Mbps ·{' '}
                      {formatCurrency(pkg.price)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={fieldStyle}>
              <InputLabel>Status</InputLabel>

              <Select
                value={form.status}
                label="Status"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as SubscriptionStatus,
                  }))
                }
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="ACTIVE">Aktif</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
                <MenuItem value="TERMINATED">Terminated</MenuItem>
              </Select>
            </FormControl>

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
              <TextField
                fullWidth
                type="date"
                label="Tanggal Mulai"
                value={form.startDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
                sx={fieldStyle}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              <TextField
                fullWidth
                type="date"
                label="Tanggal Berakhir"
                value={form.endDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
                sx={fieldStyle}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Button
            onClick={closeDialog}
            sx={{
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={saving}
            sx={{
              px: 3,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00e676, #00b85c)',
              color: '#001b0d',
              '&:hover': {
                background:
                  'linear-gradient(135deg, #19ff88, #00d96b)',
              },
            }}
          >
            {saving ? (
              <CircularProgress
                size={20}
                sx={{ color: '#001b0d' }}
              />
            ) : editing ? (
              'Simpan Perubahan'
            ) : (
              'Tambah Subscription'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              color: '#f8fafc',
              background:
                'linear-gradient(145deg, #0f172a, #020617)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 3,
            },
          },
        }}
      >
        {selected && (
          <>
            <DialogTitle
              sx={{
                fontWeight: 900,
                borderBottom:
                  '1px solid rgba(255,255,255,0.06)',
              }}
            >
              Detail Subscription

              <IconButton
                onClick={() => setDetailOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  color: 'rgba(255,255,255,0.55)',
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: '24px !important' }}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(0,230,118,0.05)',
                    border:
                      '1px solid rgba(0,230,118,0.12)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: '#00e676',
                      fontWeight: 800,
                      letterSpacing: 1,
                    }}
                  >
                    SUBSCRIPTION
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 900,
                      mt: 0.5,
                    }}
                  >
                    {selected.subscriptionCode}
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    {renderStatus(selected.status)}
                  </Box>
                </Box>

                {[
                  ['Pelanggan', selected.customer.name],
                  ['Customer Code', selected.customer.customerCode],
                  ['Telepon', selected.customer.phone],
                  ['Paket', selected.package.name],
                  ['Kecepatan', `${selected.package.speed} Mbps`],
                  ['Harga', formatCurrency(selected.package.price)],
                  ['Tanggal Mulai', formatDate(selected.startDate)],
                  ['Tanggal Berakhir', formatDate(selected.endDate)],
                  ['Dibuat', formatDate(selected.createdAt)],
                ].map(([label, value]) => (
                  <Box
                    key={label}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 2,
                      py: 1,
                      borderBottom:
                        '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: 12,
                      }}
                    >
                      {label}
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: 13,
                        textAlign: 'right',
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                p: 2.5,
                gap: 1,
                borderTop:
                  '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Button
                startIcon={<Edit />}
                onClick={() => {
                  setDetailOpen(false);
                  openEdit(selected);
                }}
                sx={{
                  color: '#00e676',
                  fontWeight: 800,
                }}
              >
                Edit
              </Button>

              {selected.status === 'PENDING' && (
                <Button
                  startIcon={<CheckCircle />}
                  onClick={() => {
                    setDetailOpen(false);
                    openStatusConfirmation(selected, 'ACTIVE');
                  }}
                  sx={{
                    color: '#00e676',
                    fontWeight: 800,
                  }}
                >
                  Aktifkan
                </Button>
              )}

              {selected.status === 'ACTIVE' && (
                <Button
                  startIcon={<PauseCircle />}
                  onClick={() => {
                    setDetailOpen(false);
                    openStatusConfirmation(selected, 'SUSPENDED');
                  }}
                  sx={{
                    color: '#ffb300',
                    fontWeight: 800,
                  }}
                >
                  Suspend
                </Button>
              )}

              {selected.status === 'SUSPENDED' && (
                <Button
                  startIcon={<CheckCircle />}
                  onClick={() => {
                    setDetailOpen(false);
                    openStatusConfirmation(selected, 'ACTIVE');
                  }}
                  sx={{
                    color: '#00e676',
                    fontWeight: 800,
                  }}
                >
                  Aktifkan
                </Button>
              )}

              {selected.status !== 'TERMINATED' && (
                <Button
                  startIcon={<StopCircle />}
                  onClick={() => {
                    setDetailOpen(false);
                    openStatusConfirmation(
                      selected,
                      'TERMINATED',
                    );
                  }}
                  sx={{
                    color: '#ef5350',
                    fontWeight: 800,
                  }}
                >
                  Hentikan
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* CONFIRM STATUS */}
      <Dialog
        open={confirmOpen}
        onClose={closeConfirmation}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              color: '#f8fafc',
              background:
                'linear-gradient(145deg, #0f172a, #020617)',
              border:
                '1px solid rgba(255,255,255,0.08)',
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          Konfirmasi Perubahan
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Apakah Anda yakin ingin mengubah status subscription{' '}
            <strong>
              {confirmTarget?.subscriptionCode}
            </strong>{' '}
            menjadi{' '}
            <strong>
              {confirmAction
                ? statusConfig[confirmAction].label
                : ''}
            </strong>
            ?
          </Typography>

          {confirmAction === 'TERMINATED' && (
            <Alert
              severity="warning"
              sx={{
                mt: 2,
                background: 'rgba(239,83,80,0.08)',
                color: '#ffb4b0',
                border:
                  '1px solid rgba(239,83,80,0.2)',
              }}
            >
              Subscription yang sudah Terminated tidak dapat
              diaktifkan kembali.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={closeConfirmation}
            sx={{
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            Batal
          </Button>

          <Button
            variant="contained"
            disabled={saving}
            onClick={() => void executeStatusAction()}
            sx={{
              fontWeight: 800,
              background:
                confirmAction === 'TERMINATED'
                  ? '#ef5350'
                  : '#00e676',
              color:
                confirmAction === 'TERMINATED'
                  ? '#fff'
                  : '#001b0d',
              '&:hover': {
                background:
                  confirmAction === 'TERMINATED'
                    ? '#e53935'
                    : '#19ff88',
              },
            }}
          >
            {saving ? (
              <CircularProgress
                size={20}
                sx={{
                  color: 'inherit',
                }}
              />
            ) : (
              'Ya, Lanjutkan'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar((current) => ({
            ...current,
            open: false,
          }))
        }
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((current) => ({
              ...current,
              open: false,
            }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}