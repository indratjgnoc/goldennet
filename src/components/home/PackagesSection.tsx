'use client';
import Link from 'next/link';

import {
  Box,
  Button,
  Container,
} from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import SectionHeading from '@/components/ui/SectionHeading';
import PackageCard from '@/components/cards/PackageCard';

import { internetPackages } from '@/data/packages';

export default function PackagesSection() {
  return (
    <Box
      component="section"
      sx={{
        py: {
          xs: 9,
          md: 12,
        },
        backgroundColor: '#080B09',
      }}
    >
      <Container maxWidth="xl">
        <SectionHeading
          eyebrow="INTERNET PACKAGES"
          title="Pilih koneksi yang sesuai."
          description="Berbagai pilihan paket internet untuk kebutuhan rumah dan aktivitas digital Anda."
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {internetPackages.map((item) => (
            <PackageCard
              key={item.id}
              packageData={item}
            />
          ))}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 5,
          }}
        >
          <Button
            component={Link}
            href="/paket"
            variant="text"
            endIcon={<ArrowForwardRoundedIcon />}
          >
            Lihat Semua Paket
          </Button>
        </Box>
      </Container>
    </Box>
  );
}