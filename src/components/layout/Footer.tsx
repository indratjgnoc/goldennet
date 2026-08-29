"use client";
import Link from 'next/link';

import {
  Box,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

const footerMenus = [
  {
    title: 'Navigasi',
    links: [
      {
        label: 'Home',
        href: '/',
      },
      {
        label: 'Layanan',
        href: '/layanan',
      },
      {
        label: 'Paket Internet',
        href: '/paket',
      },
      {
        label: 'Coverage',
        href: '/coverage',
      },
    ],
  },
  {
    title: 'Golden Net',
    links: [
      {
        label: 'Tentang Kami',
        href: '/tentang',
      },
      {
        label: 'Cabang',
        href: '/cabang',
      },
      {
        label: 'Kontak',
        href: '/kontak',
      },
    ],
  },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#050806',
        borderTop:
          '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Container maxWidth="xl">
        {/* MAIN FOOTER */}
        <Box
          sx={{
            py: {
              xs: 6,
              sm: 7,
              md: 9,
            },
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1.5fr repeat(2, 1fr)',
              md: '2fr repeat(2, 1fr)',
            },
            gap: {
              xs: 5,
              sm: 4,
              md: 8,
            },
          }}
        >
          {/* BRAND */}
          <Box>
            <Typography
              component={Link}
              href="/"
              sx={{
                display: 'inline-block',
                textDecoration: 'none',
                color: 'white',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                fontSize: {
                  xs: '1.3rem',
                  md: '1.5rem',
                },
              }}
            >
              GOLDEN
              <Box
                component="span"
                sx={{
                  color: 'primary.main',
                  ml: 0.5,
                }}
              >
                NET
              </Box>
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 2,
                maxWidth: 420,
                lineHeight: 1.8,
                fontSize: {
                  xs: '0.88rem',
                  md: '0.92rem',
                },
              }}
            >
              Internet cepat dan stabil untuk
              masyarakat, rumah, bisnis, dan kebutuhan
              digital di wilayah layanan Golden Net.
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 2,
                fontSize: '0.8rem',
              }}
            >
              Pusat: Biaro, Bukittinggi
            </Typography>
          </Box>

          {/* MENU */}
          {footerMenus.map((group) => (
            <Box key={group.title}>
              <Typography
                sx={{
                  mb: 2,
                  fontWeight: 800,
                  fontSize: {
                    xs: '0.9rem',
                    md: '0.95rem',
                  },
                }}
              >
                {group.title}
              </Typography>

              <Stack spacing={1.25}>
                {group.links.map((link) => (
                  <Box
                    key={link.href}
                    component={Link}
                    href={link.href}
                    sx={{
                      color: 'text.secondary',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      transition: 'color .2s ease',

                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Divider
          sx={{
            borderColor:
              'rgba(255,255,255,0.06)',
          }}
        />

        {/* BOTTOM */}
        <Stack
          component="div"
          direction={{
            xs: 'column',
            sm: 'row',
          }}
          spacing={1.5}
          sx={{
            py: 3,
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              sm: 'center',
            },
          }}
        >
          <Typography
            color="text.secondary"
            sx={{
              fontSize: '0.75rem',
              lineHeight: 1.6,
            }}
          >
            © {new Date().getFullYear()} Golden Net.
            All rights reserved.
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: '0.75rem',
            }}
          >
            PT GNet Biaro
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}