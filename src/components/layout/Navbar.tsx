'use client';

import { useState } from 'react';
import Link from 'next/link';

import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const menus = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Layanan',
    href: '/layanan',
  },
  {
    label: 'Paket',
    href: '/paket',
  },
  {
    label: 'Coverage',
    href: '/coverage',
  },
  {
    label: 'Cabang',
    href: '/cabang',
  },
  {
    label: 'Tentang',
    href: '/tentang',
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  /**
   * Buka mobile drawer.
   *
   * Blur tombol hamburger terlebih dahulu
   * sebelum Drawer dibuka untuk menghindari
   * warning aria-hidden dari MUI.
   */
  const handleOpen = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.currentTarget.blur();
    setOpen(true);
  };

  /**
   * Tutup Drawer.
   */
  const handleClose = () => {
    setOpen(false);
  };

  /**
   * Navigasi dari Drawer.
   */
  const handleNavigate = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    const element = event.currentTarget;

    if (element instanceof HTMLElement) {
      element.blur();
    }

    setOpen(false);
  };

  return (
    <>
      {/* =====================================
          NAVBAR
      ====================================== */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(5, 8, 6, 0.88)',
          backdropFilter: 'blur(18px)',
          borderBottom:
            '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            /*
             * Padding mobile dibuat sedikit lebih lega
             * supaya logo dan hamburger tidak terlihat
             * berdempetan.
             */
            px: {
              xs: 2,
              sm: 3,
              md: 4,
            },
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 68,
                md: 78,
              },

              /*
               * MOBILE
               */
              display: {
                xs: 'flex',
                md: 'grid',
              },

              /*
               * DESKTOP
               *
               * Logo | Navigation | CTA
               */
              gridTemplateColumns: {
                md: '1fr auto 1fr',
              },

              alignItems: 'center',

              /*
               * Mobile:
               * logo kiri, hamburger kanan.
               */
              justifyContent: {
                xs: 'space-between',
                md: 'initial',
              },
            }}
          >
            {/* =================================
                LOGO
            ================================== */}
            <Box
              component={Link}
              href="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',

                display: 'flex',
                alignItems: 'center',

                flexShrink: 0,

                justifySelf: {
                  md: 'start',
                },
              }}
            >
              <Typography
                component="div"
                sx={{
                  fontWeight: 900,

                  fontSize: {
                    xs: '1.2rem',
                    md: '1.4rem',
                  },

                  letterSpacing: '-0.04em',
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
            </Box>

            {/* =================================
                DESKTOP NAVIGATION
            ================================== */}
            <Box
              sx={{
                display: {
                  xs: 'none',
                  md: 'flex',
                },

                alignItems: 'center',
                justifyContent: 'center',

                gap: 0.5,

                justifySelf: 'center',
              }}
            >
              {menus.map((menu) => (
                <Button
                  key={menu.href}
                  component={Link}
                  href={menu.href}
                  sx={{
                    color: 'text.secondary',

                    px: 1.25,

                    fontSize: '0.9rem',
                    fontWeight: 500,

                    whiteSpace: 'nowrap',

                    transition:
                      'all 0.2s ease',

                    '&:hover': {
                      color: 'primary.main',

                      backgroundColor:
                        'rgba(34,197,94,0.06)',
                    },
                  }}
                >
                  {menu.label}
                </Button>
              ))}
            </Box>

            {/* =================================
                DESKTOP CTA
            ================================== */}
            <Box
              sx={{
                display: {
                  xs: 'none',
                  md: 'flex',
                },

                justifyContent: 'flex-end',
                alignItems: 'center',

                justifySelf: 'end',
              }}
            >
              <Button
                component={Link}
                href="/coverage"
                variant="contained"
                sx={{
                  px: 2.5,

                  whiteSpace: 'nowrap',
                }}
              >
                Cek Coverage
              </Button>
            </Box>

            {/* =================================
                MOBILE MENU BUTTON
            ================================== */}
            <IconButton
              onClick={handleOpen}
              aria-label="Buka menu"
              aria-expanded={open}
              sx={{
                display: {
                  xs: 'flex',
                  md: 'none',
                },

                color: 'white',

                /*
                 * Pastikan hamburger tetap di kanan.
                 */
                flexShrink: 0,

                ml: 2,

                width: 44,
                height: 44,

                borderRadius: 2,

                '&:hover': {
                  backgroundColor:
                    'rgba(255,255,255,0.06)',
                },
              }}
            >
              <MenuRoundedIcon
                sx={{
                  fontSize: 28,
                }}
              />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* =====================================
          MOBILE DRAWER
      ====================================== */}
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: {
                xs: '82vw',
                sm: 340,
              },

              maxWidth: 360,

              backgroundColor: '#080B09',

              borderLeft:
                '1px solid rgba(255,255,255,0.08)',
            },
          },
        }}
      >
        {/* =================================
            DRAWER HEADER
        ================================== */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            px: 2,
            py: 2,
          }}
        >
          <Typography
            component="div"
            sx={{
              fontWeight: 900,
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

          <IconButton
            onClick={handleClose}
            aria-label="Tutup menu"
            sx={{
              color: 'white',
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        {/* =================================
            MOBILE MENU
        ================================== */}
        <List
          sx={{
            px: 1,
          }}
        >
          {menus.map((menu) => (
            <ListItem
              key={menu.href}
              disablePadding
            >
              <ListItemButton
                component={Link}
                href={menu.href}
                onClick={handleNavigate}
                sx={{
                  borderRadius: 2,

                  mb: 0.5,

                  py: 1.5,

                  '&:hover': {
                    backgroundColor:
                      'rgba(34,197,94,0.08)',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {menu.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* =================================
            MOBILE CTA
        ================================== */}
        <Box
          sx={{
            p: 2,
            mt: 'auto',
          }}
        >
          <Button
            fullWidth
            component={Link}
            href="/coverage"
            variant="contained"
            size="large"
            onClick={handleNavigate}
          >
            Cek Coverage
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
