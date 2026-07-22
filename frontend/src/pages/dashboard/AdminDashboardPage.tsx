import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { Box, Grid, Stack, Typography } from '@mui/material';

import { MetricCard } from '../../shared/ui/MetricCard';

// TODO: заменить заглушки данными будущего endpoint аналитики администратора.
const businessMetrics = [
  {
    label: 'Оборот платформы',
    value: '—',
    helper: 'GMV за последние 30 дней',
    icon: TrendingUpOutlinedIcon,
  },
  {
    label: 'Заказы',
    value: '—',
    helper: 'Оформлено за последние 30 дней',
    icon: ShoppingCartOutlinedIcon,
  },
  {
    label: 'Средний чек',
    value: '—',
    helper: 'Средняя сумма оплаченного заказа',
    icon: PaymentsOutlinedIcon,
  },
  {
    label: 'Конверсия',
    value: '—',
    helper: 'Посетители, оформившие заказ',
    icon: PercentOutlinedIcon,
  },
];

const quantityMetrics = [
  {
    label: 'Всего пользователей',
    value: '—',
    helper: 'Все зарегистрированные аккаунты',
    icon: PeopleAltOutlinedIcon,
  },
  {
    label: 'Всего продавцов',
    value: '—',
    helper: 'Аккаунты с ролью продавца',
    icon: PersonAddAltOutlinedIcon,
  },
  {
    label: 'Всего магазинов',
    value: '—',
    helper: 'Магазины во всех статусах',
    icon: StorefrontOutlinedIcon,
  },
  {
    label: 'Всего товаров',
    value: '—',
    helper: 'Товары во всех магазинах',
    icon: Inventory2OutlinedIcon,
  },
];

const operationalMetrics = [
  {
    label: 'Новые пользователи',
    value: '—',
    helper: 'Регистрации за последние 30 дней',
    icon: PersonAddAltOutlinedIcon,
  },
  {
    label: 'Активные продавцы',
    value: '—',
    helper: 'Получили хотя бы один заказ',
    icon: StorefrontOutlinedIcon,
  },
  {
    label: 'Ожидают модерации',
    value: '—',
    helper: 'Магазины и товары на проверке',
    icon: PendingActionsOutlinedIcon,
  },
  {
    label: 'Возвраты',
    value: '—',
    helper: 'Доля возвратов за 30 дней',
    icon: AssignmentReturnOutlinedIcon,
  },
];

export function AdminDashboardPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h2">Панель администратора</Typography>
        <Typography variant="body1" sx={{ mt: 0.25, color: 'text.secondary' }}>
          Ключевые показатели платформы и задачи, требующие внимания.
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        <Typography variant="h3">Количество</Typography>
        <Grid container spacing={2}>
          {quantityMetrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h3">Бизнес за 30 дней</Typography>
        <Grid container spacing={2}>
          {businessMetrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h3">Операционные показатели</Typography>
        <Grid container spacing={2}>
          {operationalMetrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
}
