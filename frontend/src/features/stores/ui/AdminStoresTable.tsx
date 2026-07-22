import { useMemo } from 'react';

import { Box, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';

import { formatStoreDate } from '../lib/storeFormatters';
import { StoreActions } from './StoreActions';
import { StoreAvatar } from './StoreAvatar';
import { StoreStatusChip } from './StoreStatusChip';

import type { User } from '../../users/model/types';
import type { Store } from '../model/types';

type AdminStoresTableProps = {
  stores: Store[];
  sellers: User[];
  page: number;
  limit: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSelect: (store: Store) => void;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
};

export function AdminStoresTable({
  stores,
  sellers,
  page,
  limit,
  totalCount,
  onPageChange,
  onLimitChange,
  onSelect,
  onEdit,
  onDelete,
}: AdminStoresTableProps) {
  const sellersById = useMemo(() => {
    return new Map(sellers.map((seller) => [seller.id, seller]));
  }, [sellers]);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Магазин</TableCell>
              <TableCell>Продавец</TableCell>
              <TableCell>Контакты</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Создан</TableCell>
              <TableCell align="center" sx={{ width: 152, pr: 3 }}>
                Действия
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {stores.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Stack
                    spacing={1}
                    sx={{
                      py: 5,
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <StorefrontOutlinedIcon
                      sx={{
                        fontSize: 42,
                        color: 'text.secondary',
                      }}
                    />

                    <Typography variant="h3">Магазины не найдены</Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                      }}
                    >
                      Попробуйте изменить параметры фильтрации.
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {stores.map((store) => (
              <TableRow
                key={store.id}
                hover
                onClick={() => onSelect(store)}
                sx={{
                  cursor: 'pointer',
                  '&:last-child td': {
                    borderBottom: 0,
                  },
                }}
              >
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: 'center',
                    }}
                  >
                    <StoreAvatar name={store.name} logoUrl={store.logo_url} size={42} />

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        noWrap
                        sx={{
                          maxWidth: 240,
                          fontWeight: 700,
                        }}
                      >
                        {store.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          maxWidth: 240,
                          color: 'text.secondary',
                        }}
                      >
                        /{store.slug}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Box sx={{ maxWidth: 240 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      {sellersById.get(store.seller_id)?.username ?? 'Продавец не найден'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ maxWidth: 220 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        color: store.email ? 'text.primary' : 'text.secondary',
                      }}
                    >
                      {store.email ?? 'Email не указан'}
                    </Typography>

                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        display: 'block',
                        color: 'text.secondary',
                      }}
                    >
                      {store.phone ?? 'Телефон не указан'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <StoreStatusChip status={store.status} />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{formatStoreDate(store.created_at)}</Typography>
                </TableCell>

                <TableCell
                  align="center"
                  onClick={(event) => event.stopPropagation()}
                  sx={{ width: 152, pr: 3 }}
                >
                  <StoreActions
                    store={store}
                    onView={onSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="На странице"
        onPageChange={(_, nextPage) => {
          onPageChange(nextPage);
        }}
        onRowsPerPageChange={(event) => {
          onLimitChange(Number(event.target.value));
        }}
      />
    </Paper>
  );
}
