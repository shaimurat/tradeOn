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
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';

const stats = [
  {
    label: 'My Stores',
    value: '2',
    helper: 'Your active platforms',
    icon: StorefrontOutlinedIcon,
  },
  {
    label: 'My Products',
    value: '248',
    helper: 'Products in your stores',
    icon: Inventory2OutlinedIcon,
  },
  {
    label: 'My Orders',
    value: '1,429',
    helper: 'Orders from your stores',
    icon: ShoppingCartOutlinedIcon,
  },
  {
    label: 'Revenue',
    value: '$18,240',
    helper: 'Your store revenue',
    icon: AttachMoneyOutlinedIcon,
  },
];

export function SellerDashboardPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h2">Seller overview</Typography>

        <Typography variant="body1" sx={{ mt: 0.25, color: 'text.secondary' }}>
          Manage your stores, products, orders and sales.
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