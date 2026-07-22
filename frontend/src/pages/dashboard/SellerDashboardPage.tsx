import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { Box, Grid, Stack, Typography } from '@mui/material';

import { MetricCard } from '../../shared/ui/MetricCard';

// TODO: заменить заглушки данными будущего endpoint аналитики продавца.
const salesMetrics = [
  {
    label: 'Выручка',
    value: '—',
    helper: 'Оплаченные заказы за 30 дней',
    icon: TrendingUpOutlinedIcon,
  },
  {
    label: 'Заказы',
    value: '—',
    helper: 'Получено за последние 30 дней',
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
    helper: 'Просмотры, завершившиеся заказом',
    icon: PercentOutlinedIcon,
  },
];

const quantityMetrics = [
  {
    label: 'Мои магазины',
    value: '—',
    helper: 'Магазины во всех статусах',
    icon: StorefrontOutlinedIcon,
  },
  {
    label: 'Мои товары',
    value: '—',
    helper: 'Товары во всех магазинах',
    icon: Inventory2OutlinedIcon,
  },
  {
    label: 'Категории',
    value: '—',
    helper: 'Категории товарного каталога',
    icon: CategoryOutlinedIcon,
  },
  {
    label: 'Покупатели',
    value: '—',
    helper: 'Уникальные покупатели за всё время',
    icon: GroupsOutlinedIcon,
  },
];

const attentionMetrics = [
  {
    label: 'Активные товары',
    value: '—',
    helper: 'Опубликованы и доступны покупателям',
    icon: Inventory2OutlinedIcon,
  },
  {
    label: 'Заканчиваются',
    value: '—',
    helper: 'Товары с низким остатком',
    icon: WarningAmberOutlinedIcon,
  },
  {
    label: 'Ждут отправки',
    value: '—',
    helper: 'Оплаченные, но не отправленные',
    icon: LocalShippingOutlinedIcon,
  },
  {
    label: 'Возвраты',
    value: '—',
    helper: 'Запросы, требующие обработки',
    icon: AssignmentReturnOutlinedIcon,
  },
];

export function SellerDashboardPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h2">Панель продавца</Typography>
        <Typography variant="body1" sx={{ mt: 0.25, color: 'text.secondary' }}>
          Продажи, эффективность каталога и задачи на сегодня.
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
        <Typography variant="h3">Продажи за 30 дней</Typography>
        <Grid container spacing={2}>
          {salesMetrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>
      </Stack>

      <Stack spacing={1.5}>
        <Typography variant="h3">Требуют внимания</Typography>
        <Grid container spacing={2}>
          {attentionMetrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Stack>
  );
}
