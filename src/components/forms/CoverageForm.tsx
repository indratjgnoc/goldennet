'use client';

import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { useFormik } from 'formik';
import * as Yup from 'yup';

const areas = [
  'Biaro',
  'Bukittinggi',
  'Agam',
  'Payakumbuh',
  'Area lainnya',
];

const validationSchema = Yup.object({
  area: Yup.string()
    .required('Silakan pilih area'),

  address: Yup.string()
    .min(
      10,
      'Alamat minimal 10 karakter',
    )
    .required('Alamat wajib diisi'),
});

export default function CoverageForm() {
  const formik = useFormik({
    initialValues: {
      area: '',
      address: '',
    },

    validationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log(
          'Coverage request:',
          values,
        );

        /*
         * Sementara kita tampilkan simulasi.
         * Nanti bagian ini akan diganti dengan API.
         */

        alert(
          `Permintaan coverage diterima.\n\nArea: ${values.area}\nAlamat: ${values.address}`,
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        width: '100%',
      }}
    >
      <Stack spacing={2.5}>
        <TextField
          fullWidth
          select
          label="Area"
          name="area"
          value={formik.values.area}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.area &&
            Boolean(formik.errors.area)
          }
          helperText={
            formik.touched.area &&
            formik.errors.area
          }
        >
          <MenuItem value="">
            Pilih area
          </MenuItem>

          {areas.map((area) => (
            <MenuItem
              key={area}
              value={area}
            >
              {area}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Alamat pemasangan"
          name="address"
          placeholder="Masukkan alamat lengkap lokasi pemasangan..."
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

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={formik.isSubmitting}
          startIcon={
            <SearchRoundedIcon />
          }
          sx={{
            minHeight: 52,
            fontWeight: 800,
          }}
        >
          {formik.isSubmitting
            ? 'Memeriksa...'
            : 'Cek Coverage'}
        </Button>
      </Stack>
    </Box>
  );
}