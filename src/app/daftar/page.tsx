'use client';

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
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import SendRoundedIcon from '@mui/icons-material/SendRounded';

import { useEffect, useState } from 'react';

import { useFormik } from 'formik';

import * as Yup from 'yup';

interface InternetPackage {
  id: number;
  name: string;
  code: string;
  speed: number;
  price: number;
  description: string | null;
  isPopular: boolean;
}

interface CoverageArea {
  id: number;
  name: string;
  description: string | null;

  branch: {
    id: number;
    name: string;
    code: string;
    address: string;
  };
}

const validationSchema = Yup.object({
  packageId: Yup.number()
    .required(
      'Paket internet wajib dipilih.',
    )
    .moreThan(
      0,
      'Paket internet wajib dipilih.',
    ),

  coverageId: Yup.number()
    .required(
      'Area pemasangan wajib dipilih.',
    )
    .moreThan(
      0,
      'Area pemasangan wajib dipilih.',
    ),

  name: Yup.string()
    .min(
      3,
      'Nama minimal 3 karakter.',
    )
    .required(
      'Nama wajib diisi.',
    ),

  phone: Yup.string()
    .matches(
      /^[0-9+\-\s]+$/,
      'Nomor WhatsApp tidak valid.',
    )
    .min(
      10,
      'Nomor WhatsApp terlalu pendek.',
    )
    .required(
      'Nomor WhatsApp wajib diisi.',
    ),

  email: Yup.string()
    .email(
      'Format email tidak valid.',
    )
    .required(
      'Email wajib diisi.',
    ),

  address: Yup.string()
    .min(
      10,
      'Alamat minimal 10 karakter.',
    )
    .required(
      'Alamat pemasangan wajib diisi.',
    ),

  notes: Yup.string().max(
    500,
    'Catatan maksimal 500 karakter.',
  ),
});

export default function RegistrationPage() {
  const [packages, setPackages] =
    useState<InternetPackage[]>([]);

  const [coverageAreas, setCoverageAreas] =
    useState<CoverageArea[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState('');

  const [successData, setSuccessData] =
    useState<{
      registrationCode: string;
      name: string;
    } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [
          packagesResponse,
          coverageResponse,
        ] = await Promise.all([
          fetch('/api/packages'),
          fetch('/api/coverage'),
        ]);

        const packagesResult =
          await packagesResponse.json();

        const coverageResult =
          await coverageResponse.json();

        if (
          !packagesResponse.ok ||
          !packagesResult.success
        ) {
          throw new Error(
            'Gagal mengambil data paket.',
          );
        }

        if (
          !coverageResponse.ok ||
          !coverageResult.success
        ) {
          throw new Error(
            'Gagal mengambil data coverage.',
          );
        }

        setPackages(
          packagesResult.data,
        );

        setCoverageAreas(
          coverageResult.data,
        );
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : 'Gagal memuat data.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const formik = useFormik({
    initialValues: {
      packageId: '',
      coverageId: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    },

    validationSchema,

    onSubmit: async (
      values,
      { setSubmitting, resetForm },
    ) => {
      try {
        const response =
          await fetch(
            '/api/registrations',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                ...values,

                packageId:
                  Number(
                    values.packageId,
                  ),

                coverageId:
                  Number(
                    values.coverageId,
                  ),
              }),
            },
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              'Pendaftaran gagal.',
          );
        }

        setSuccessData({
          registrationCode:
            result.data
              .registrationCode,

          name:
            result.data.name,
        });

        resetForm();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan.',
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 8 }}
      >
        <Alert severity="error">
          {loadError}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        py: {
          xs: 5,
          md: 9,
        },

        minHeight: '80vh',
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4}>
          {/* HEADER */}

          <Stack spacing={1}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 800,
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
                  xs: '2rem',
                  md: '3rem',
                },
              }}
            >
              Daftar Internet
            </Typography>

            <Typography
              color="text.secondary"
            >
              Isi data berikut untuk
              mengajukan pemasangan
              internet Golden Net.
            </Typography>
          </Stack>

          {/* SUCCESS */}

          {successData && (
            <Alert
              severity="success"
              sx={{
                borderRadius: 3,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                }}
              >
                Pendaftaran berhasil!
              </Typography>

              <Typography>
                Terima kasih,{' '}
                {successData.name}.
              </Typography>

              <Typography>
                Nomor pendaftaran Anda:
              </Typography>

              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '1.2rem',
                }}
              >
                {
                  successData.registrationCode
                }
              </Typography>

              <Typography
                variant="body2"
                sx={{ mt: 1 }}
              >
                Simpan nomor ini untuk
                keperluan pengecekan
                status pendaftaran.
              </Typography>
            </Alert>
          )}

          {/* FORM */}

          <Box
            component="form"
            onSubmit={
              formik.handleSubmit
            }
          >
            <Stack spacing={2.5}>
              {/* PACKAGE */}

              <FormControl
                fullWidth
                error={
                  formik.touched
                    .packageId &&
                  Boolean(
                    formik.errors
                      .packageId,
                  )
                }
              >
                <InputLabel>
                  Paket Internet
                </InputLabel>

                <Select
                  name="packageId"
                  value={
                    formik.values
                      .packageId
                  }
                  label="Paket Internet"
                  onChange={
                    formik.handleChange
                  }
                  onBlur={
                    formik.handleBlur
                  }
                >
                  <MenuItem value="">
                    Pilih paket internet
                  </MenuItem>

                  {packages.map(
                    (item) => (
                      <MenuItem
                        key={item.id}
                        value={item.id}
                      >
                        {item.name} —{' '}
                        {item.speed} Mbps
                      </MenuItem>
                    ),
                  )}
                </Select>

                {formik.touched
                  .packageId &&
                  formik.errors
                    .packageId && (
                    <FormHelperText>
                      {
                        formik.errors
                          .packageId
                      }
                    </FormHelperText>
                  )}
              </FormControl>

              {/* COVERAGE */}

              <FormControl
                fullWidth
                error={
                  formik.touched
                    .coverageId &&
                  Boolean(
                    formik.errors
                      .coverageId,
                  )
                }
              >
                <InputLabel>
                  Area Pemasangan
                </InputLabel>

                <Select
                  name="coverageId"
                  value={
                    formik.values
                      .coverageId
                  }
                  label="Area Pemasangan"
                  onChange={
                    formik.handleChange
                  }
                  onBlur={
                    formik.handleBlur
                  }
                >
                  <MenuItem value="">
                    Pilih area pemasangan
                  </MenuItem>

                  {coverageAreas.map(
                    (item) => (
                      <MenuItem
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </MenuItem>
                    ),
                  )}
                </Select>

                {formik.touched
                  .coverageId &&
                  formik.errors
                    .coverageId && (
                    <FormHelperText>
                      {
                        formik.errors
                          .coverageId
                      }
                    </FormHelperText>
                  )}
              </FormControl>

              {/* NAME */}

              <TextField
                fullWidth
                label="Nama Lengkap"
                name="name"
                placeholder="Masukkan nama lengkap"
                value={
                  formik.values.name
                }
                onChange={
                  formik.handleChange
                }
                onBlur={
                  formik.handleBlur
                }
                error={
                  formik.touched.name &&
                  Boolean(
                    formik.errors.name,
                  )
                }
                helperText={
                  formik.touched.name &&
                  formik.errors.name
                }
              />

              {/* PHONE */}

              <TextField
                fullWidth
                label="Nomor WhatsApp"
                name="phone"
                placeholder="08xxxxxxxxxx"
                value={
                  formik.values.phone
                }
                onChange={
                  formik.handleChange
                }
                onBlur={
                  formik.handleBlur
                }
                error={
                  formik.touched.phone &&
                  Boolean(
                    formik.errors.phone,
                  )
                }
                helperText={
                  formik.touched.phone &&
                  formik.errors.phone
                }
              />

              {/* EMAIL */}

              <TextField
                fullWidth
                type="email"
                label="Email"
                name="email"
                placeholder="nama@email.com"
                value={
                  formik.values.email
                }
                onChange={
                  formik.handleChange
                }
                onBlur={
                  formik.handleBlur
                }
                error={
                  formik.touched.email &&
                  Boolean(
                    formik.errors.email,
                  )
                }
                helperText={
                  formik.touched.email &&
                  formik.errors.email
                }
              />

              {/* ADDRESS */}

              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Alamat Pemasangan"
                name="address"
                placeholder="Masukkan alamat lengkap lokasi pemasangan"
                value={
                  formik.values
                    .address
                }
                onChange={
                  formik.handleChange
                }
                onBlur={
                  formik.handleBlur
                }
                error={
                  formik.touched
                    .address &&
                  Boolean(
                    formik.errors
                      .address,
                  )
                }
                helperText={
                  formik.touched
                    .address &&
                  formik.errors
                    .address
                }
              />

              {/* NOTES */}

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Catatan Tambahan"
                name="notes"
                placeholder="Patokan lokasi, waktu pemasangan, atau informasi lainnya."
                value={
                  formik.values.notes
                }
                onChange={
                  formik.handleChange
                }
                onBlur={
                  formik.handleBlur
                }
                error={
                  formik.touched.notes &&
                  Boolean(
                    formik.errors.notes,
                  )
                }
                helperText={
                  formik.touched.notes &&
                  formik.errors.notes
                }
              />

              {/* SUBMIT */}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={
                  formik.isSubmitting
                }
                startIcon={
                  formik.isSubmitting ? (
                    <CircularProgress
                      size={20}
                      color="inherit"
                    />
                  ) : (
                    <SendRoundedIcon />
                  )
                }
                sx={{
                  minHeight: 54,
                  borderRadius: 3,
                  fontWeight: 800,
                  textTransform:
                    'none',
                }}
              >
                {formik.isSubmitting
                  ? 'Mengirim Pendaftaran...'
                  : 'Kirim Pendaftaran'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}