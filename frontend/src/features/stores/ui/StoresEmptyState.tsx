import AddIcon from '@mui/icons-material/Add';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';

type StoresEmptyStateProps = {
  title: string;
  description: string;
  createButtonLabel?: string;
  resetButtonLabel?: string;
  onCreate?: () => void;
  onResetFilters?: () => void;
};

export function StoresEmptyState({
  title,
  description,
  createButtonLabel = 'Создать',
  resetButtonLabel = 'Сбросить фильтры',
  onCreate,
  onResetFilters,
}: StoresEmptyStateProps) {
  return (
    <Card>
      <CardContent>
        <Stack
          spacing={1.5}
          sx={{
            alignItems: 'center',
            textAlign: 'center',
            py: 4,
          }}
        >
          <StorefrontOutlinedIcon
            sx={{
              fontSize: 44,
              color: 'text.secondary',
            }}
          />

          <Typography variant="h3">{title}</Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              maxWidth: 420,
            }}
          >
            {description}
          </Typography>

          {(onCreate || onResetFilters) && (
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1}
            >
              {onCreate && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
                  {createButtonLabel}
                </Button>
              )}

              {onResetFilters && (
                <Button variant="outlined" onClick={onResetFilters}>
                  {resetButtonLabel}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}