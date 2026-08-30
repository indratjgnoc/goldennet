'use client';

import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GnetConsoleLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');

    if (!username || !password) {
      setError(
        'Username dan password wajib diisi.',
      );

      return;
    }

    try {
      setLoading(true);

      /*
       * Untuk tahap ini kita siapkan
       * struktur login terlebih dahulu.
       *
       * Authentication database akan kita
       * pasang pada tahap berikutnya.
       */

      const response = await fetch(
        '/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            'Login gagal.',
        );
      }

      router.replace(
        '/gnet-console/dashboard',
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        px: 2,

        py: 4,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 440,

            p: {
              xs: 3,
              sm: 5,
            },

            borderRadius: 4,

            border:
              '1px solid rgba(255,255,255,0.08)',

            background:
              'linear-gradient(145deg, rgba(20,30,25,0.98), rgba(10,15,13,0.98))',

            boxShadow:
              '0 25px 80px rgba(0,0,0,0.35)',
          }}
        >
          <Stack
            component="form"
            spacing={3}
            onSubmit={handleLogin}
          >
            <Stack
              spacing={1}
              sx={{
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  borderRadius: '20px',

                  background:
                    'rgba(46,125,50,0.15)',

                  border:
                    '1px solid rgba(76,175,80,0.25)',
                }}
              >
                <LockRoundedIcon
                  sx={{
                    fontSize: 30,
                  }}
                />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 900 }}
              >
                GNET Console
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Portal internal Golden Net
              </Typography>
            </Stack>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value,
                )
              }
              autoComplete="username"
            />

            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={loading}
              startIcon={
                <LoginRoundedIcon />
              }
              sx={{
                minHeight: 54,
                borderRadius: 3,

                fontWeight: 800,

                textTransform:
                  'none',
              }}
            >
              {loading
                ? 'Memproses...'
                : 'Masuk Console'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}