import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import { userRoleLabels } from '../lib/userConstants';
import type { User } from '../model/types';
import { UserStatusChip } from './UserStatusChip';

type UsersTableProps = {
  users: User[];
  currentUserId?: string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Не входил';

  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );
};

export function UsersTable({ users, currentUserId, onEdit, onDelete }: UsersTableProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 880 }}>
          <TableHead>
            <TableRow>
              <TableCell>Пользователь</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Последний вход</TableCell>
              <TableCell>Создан</TableCell>
              <TableCell align="center" sx={{ width: 120 }}>
                Действия
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Stack spacing={1} sx={{ py: 5, alignItems: 'center', textAlign: 'center' }}>
                    <PeopleAltOutlinedIcon sx={{ fontSize: 42, color: 'text.secondary' }} />
                    <Typography variant="h3">Пользователи не найдены</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Попробуйте изменить параметры фильтрации.
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {users.map((user) => (
              <TableRow key={user.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar src={user.avatar_url ?? undefined} alt={user.username}>
                      {user.username.slice(0, 1).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        noWrap
                        sx={{ maxWidth: 240, fontWeight: 700 }}
                      >
                        {user.username}
                        {user.id === currentUserId ? ' (вы)' : ''}
                      </Typography>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ maxWidth: 260, color: 'text.secondary' }}
                      >
                        {user.email}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" label={userRoleLabels[user.role]} />
                </TableCell>
                <TableCell>
                  <UserStatusChip status={user.status} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(user.last_login)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(user.created_at)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Редактировать">
                    <IconButton
                      size="small"
                      aria-label={`Редактировать ${user.username}`}
                      onClick={() => onEdit(user)}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={user.id === currentUserId ? 'Нельзя удалить свой аккаунт' : 'Удалить'}
                  >
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={user.id === currentUserId}
                        aria-label={`Удалить ${user.username}`}
                        onClick={() => onDelete(user)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
