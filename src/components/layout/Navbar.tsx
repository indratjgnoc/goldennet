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

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
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
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 68,
                md: 78,
              },
              justifyContent: 'space-between',
            }}
          >
            {/* LOGO */}
            <Box
              component={Link}
              href="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
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

            {/* DESKTOP MENU */}
            <Box
              sx={{
                display: {
                  xs: 'none',
                  md: 'flex',
                },
                alignItems: 'center',
                gap: 1,
              }}
            >
              {menus.map((menu) => (
                <Button
                  key={menu.href}
                  component={Link}
                  href={menu.href}
                  sx={{
                    color: 'text.secondary',
                    px: 1.5,

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

              <Button
                component={Link}
                href="/coverage"
                variant="contained"
                sx={{
                  ml: 1,
                  px: 2.5,
                }}
              >
                Cek Coverage
              </Button>
            </Box>

            {/* MOBILE MENU BUTTON */}
            <IconButton
              onClick={() => setOpen(true)}
              aria-label="Buka menu"
              sx={{
                display: {
                  xs: 'flex',
                  md: 'none',
                },
                color: 'white',
              }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* MOBILE DRAWER */}
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
            sx={{ color: 'white' }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <List sx={{ px: 1 }}>
          {menus.map((menu) => (
            <ListItem
              key={menu.href}
              disablePadding
            >
              <ListItemButton
                component={Link}
                href={menu.href}
                onClick={handleClose}
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
                    <Typography sx={{ fontWeight: 600 }}>
                      {menu.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            fullWidth
            component={Link}
            href="/coverage"
            variant="contained"
            size="large"
            onClick={handleClose}
          >
            Cek Coverage
          </Button>
        </Box>
      </Drawer>
    </>
  );
}