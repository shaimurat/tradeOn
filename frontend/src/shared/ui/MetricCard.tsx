import { Box, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material';

type MetricCardProps = {
  label: string;
  value?: number | string;
  helper: string;
  icon: React.ElementType;
  loading?: boolean;
};

const numberFormatter = new Intl.NumberFormat('ru-RU');

export function MetricCard({ label, value, helper, icon: Icon, loading = false }: MetricCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}
            >
              {label}
            </Typography>

            {loading ? (
              <Skeleton width={90} height={46} sx={{ mt: 0.5 }} />
            ) : (
              <Typography variant="h1" sx={{ mt: 1, fontSize: '2rem' }}>
                {typeof value === 'number' ? numberFormatter.format(value) : (value ?? '—')}
              </Typography>
            )}

            <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
              {helper}
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
  );
}
