import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

import { StoreActions } from './StoreActions';
import { StoreAvatar } from './StoreAvatar';
import { StoreStatusChip } from './StoreStatusChip';

import type { Store } from '../model/types';

type StoreCardProps = {
  store: Store;
  onSelect: (store: Store) => void;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
};

export function StoreCard({ store, onSelect, onEdit, onDelete }: StoreCardProps) {
  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={() => onSelect(store)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(store);
        }
      }}
      sx={{
        height: '100%',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',

        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },

        '&:hover': {
          borderColor: 'text.primary',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          p: 2.5,
        }}
      >
        <Stack spacing={2.25} sx={{ height: '100%' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <StoreAvatar name={store.name} logoUrl={store.logo_url} />

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h3" noWrap sx={{ mb: 0.25 }}>
                {store.name}
              </Typography>

              <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                /{store.slug}
              </Typography>
            </Box>

            <StoreStatusChip status={store.status} />
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 38,
            }}
          >
            {store.description || 'Описание не указано'}
          </Typography>

          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 'auto',
              pt: 1,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                {store.email ?? 'Email не указан'}
              </Typography>

              {store.phone && (
                <Typography
                  variant="caption"
                  noWrap
                  sx={{
                    display: 'block',
                    color: 'text.secondary',
                  }}
                >
                  {store.phone}
                </Typography>
              )}
            </Box>

            <StoreActions store={store} onEdit={onEdit} onDelete={onDelete} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
