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
    label: 'Магазины',
    value: '128',
    helper: 'Все магазины на платформе',
    icon: StorefrontOutlinedIcon,
  },
  {
    label: 'Товары',
    value: '4 820',
    helper: 'Все товары продавцов',
    icon: Inventory2OutlinedIcon,
  },
  {
    label: 'Заказы',
    value: '12 340',
    helper: 'Все заказы платформы',
    icon: ShoppingCartOutlinedIcon,
  },
  {
    label: 'Пользователи',
    value: '8 921',
    helper: 'Клиенты и продавцы',
    icon: PeopleAltOutlinedIcon,
  },
];

export function AdminDashboardPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h2">Панель администратора</Typography>

        <Typography variant="body1" sx={{ mt: 0.25, color: 'text.secondary' }}>
          Общая аналитика платформы, магазины, пользователи и активность маркетплейса.
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