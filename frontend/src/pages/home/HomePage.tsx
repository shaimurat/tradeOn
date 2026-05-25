import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
            Tradeon
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Multi-vendor marketplace frontend.
          </Typography>
          <Stack spacing={2}>
            <Button component={Link} to="/login" variant="contained">
              Login
            </Button>
            <Button component={Link} to="/register" variant="outlined">
              Register
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
