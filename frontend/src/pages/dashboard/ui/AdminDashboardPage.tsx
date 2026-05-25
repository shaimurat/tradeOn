import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

const stats = [
  {
    label: 'Total Stores',
    value: '128',
    helper: 'All marketplace stores',
    icon: StorefrontOutlinedIcon,
  },
  {
    label: 'Products',
    value: '4,820',
    helper: 'All seller products',
    icon: Inventory2OutlinedIcon,
  },
  {
    label: 'Orders',
    value: '12,340',
    helper: 'All platform orders',
    icon: ShoppingCartOutlinedIcon,
  },
  {
    label: 'Users',
    value: '8,921',
    helper: 'Clients and sellers',
    icon: PeopleAltOutlinedIcon,
  },
];

export function AdminDashboardPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h2">Admin overview</Typography>

        <Typography variant="body1" sx={{ mt: 0.25, color: 'text.secondary' }}>
          Platform-wide analytics, stores, users and marketplace activity.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {stat.label}
                      </Typography>

                      <Typography variant="h1" sx={{ mt: 1, fontSize: '2rem' }}>
                        {stat.value}
                      </Typography>

                      <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
                        {stat.helper}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: 'secondary.main',
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ fontSize: 19 }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
  );
}