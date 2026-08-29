'use client';

import {
  Alert,
  Button,
  Stack,
  TextField,
} from '@mui/material';

import SendRoundedIcon from '@mui/icons-material/SendRounded';

import { useFormik } from 'formik';
import * as Yup from 'yup';

interface RegistrationFormProps {
  packageId: number | null;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .min(3, 'Nama minimal 3 karakter')
    .required('Nama wajib diisi'),

  phone: Yup.string()
    .matches(
      /^[0-9+\-\s]+$/,
      'Nomor telepon tidak valid',
    )
    .min(10, 'Nomor telepon terlalu pendek')
    .required('Nomor telepon wajib diisi'),

  email: Yup.string()
    .email('Format email tidak valid')
    .required('Email wajib diisi'),

  address: Yup.string()
    .min(10, 'Alamat minimal 10 karakter')
    .required('Alamat pemasangan wajib diisi'),

  notes: Yup.string().max(
    500,
    'Catatan maksimal 500 karakter',
  ),
});

export default function RegistrationForm({
  packageId,
}: RegistrationFormProps) {
  const formik = useFormik({
    initialValues: {
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
        const response = await fetch(
          '/api/registrations',
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json',
            },

            body: JSON.stringify({
              packageId,
              ...values,
            }),
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              'Pendaftaran gagal dikirim.',
          );
        }

        alert(
          `${result.message}\nNomor pendaftaran: ${result.data.id}`,
        );

        resetForm();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan.';

        alert(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Stack
      component="form"
      spacing={2.5}
      onSubmit={formik.handleSubmit}
    >
      {packageId === null && (
        <Alert severity="warning">
          Anda belum memilih paket internet.
        </Alert>
      )}

      <TextField
        fullWidth
        label="Nama lengkap"
        name="name"
        placeholder="Masukkan nama lengkap"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.name &&
          Boolean(formik.errors.name)
        }
        helperText={
          formik.touched.name &&
          formik.errors.name
        }
      />

      <TextField
        fullWidth
        label="Nomor WhatsApp"
        name="phone"
        type="tel"
        placeholder="08xxxxxxxxxx"
        value={formik.values.phone}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.phone &&
          Boolean(formik.errors.phone)
        }
        helperText={
          formik.touched.phone &&
          formik.errors.phone
        }
      />

      <TextField
        fullWidth
        type="email"
        label="Email"
        name="email"
        placeholder="nama@email.com"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.email &&
          Boolean(formik.errors.email)
        }
        helperText={
          formik.touched.email &&
          formik.errors.email
        }
      />

      <TextField
        fullWidth
        multiline
        minRows={4}
        label="Alamat pemasangan"
        name="address"
        placeholder="Masukkan alamat lengkap lokasi pemasangan"
        value={formik.values.address}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.address &&
          Boolean(formik.errors.address)
        }
        helperText={
          formik.touched.address &&
          formik.errors.address
        }
      />

      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Catatan tambahan"
        name="notes"
        placeholder="Contoh: patokan lokasi, waktu yang diinginkan, dan sebagainya."
        value={formik.values.notes}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.notes &&
          Boolean(formik.errors.notes)
        }
        helperText={
          formik.touched.notes &&
          formik.errors.notes
        }
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={
          formik.isSubmitting ||
          packageId === null
        }
        startIcon={<SendRoundedIcon />}
        sx={{
          mt: 1,
          minHeight: 52,
          fontWeight: 800,
          borderRadius: 2.5,
        }}
      >
        {formik.isSubmitting
          ? 'Mengirim...'
          : 'Kirim Pendaftaran'}
      </Button>
    </Stack>
  );
}