import { Box, Typography } from '@mui/material';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <Box
      sx={{
        textAlign: align,
        maxWidth: align === 'center' ? 760 : 700,
        mx: align === 'center' ? 'auto' : 0,
        mb: 6,
      }}
    >
      <Typography
        sx={{
          color: 'primary.main',
          fontWeight: 800,
          letterSpacing: '0.16em',
          fontSize: '0.78rem',
          mb: 1.5,
        }}
      >
        {eyebrow}
      </Typography>

      <Typography
        variant="h2"
        sx={{
          fontSize: {
            xs: '2rem',
            md: '3rem',
          },
          lineHeight: 1.1,
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          color="text.secondary"
          sx={{
            mt: 2,
            lineHeight: 1.8,
            fontSize: '1rem',
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}