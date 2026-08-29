import { Box, Container, Typography } from '@mui/material';

import SectionHeading from '@/components/ui/SectionHeading';
import { services } from '@/data/services';

export default function ServicesSection() {
  return (
    <Box
      component="section"
      sx={{
        py: {
          xs: 9,
          md: 12,
        },
      }}
    >
      <Container maxWidth="xl">
        <SectionHeading
          eyebrow="OUR SERVICES"
          title="Konektivitas untuk setiap kebutuhan."
          description="Golden Net menghadirkan solusi internet untuk kebutuhan rumah, bisnis, hingga aktivitas digital profesional."
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <Box
                key={service.id}
                sx={{
                  p: 3.5,
                  minHeight: 270,
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.07)',
                  background:
                    'linear-gradient(145deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))',
                  transition: 'all 0.3s ease',

                  '&:hover': {
                    transform: 'translateY(-7px)',
                    borderColor: 'rgba(34,197,94,0.35)',
                    boxShadow:
                      '0 20px 60px rgba(0,0,0,0.25)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(34,197,94,0.1)',
                    color: 'primary.main',
                    mb: 3,
                  }}
                >
                  <Icon />
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {service.title}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1.5,
                    lineHeight: 1.7,
                  }}
                >
                  {service.description}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}