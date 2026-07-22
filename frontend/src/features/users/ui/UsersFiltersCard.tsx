import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { userRoleOptions, userStatusOptions } from '../lib/userConstants';
import type { UserRole, UserStatus } from '../model/types';

export type UsersFiltersValue = {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
};

type UsersFiltersCardProps = {
  filters: UsersFiltersValue;
  onChange: <K extends keyof UsersFiltersValue>(key: K, value: UsersFiltersValue[K]) => void;
  onReset: () => void;
};

export function UsersFiltersCard({ filters, onChange, onReset }: UsersFiltersCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <FilterListIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="h3" sx={{ fontSize: 18 }}>
              Фильтры
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Поиск"
              placeholder="Имя пользователя или email"
              value={filters.search}
              onChange={(event) => onChange('search', event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 190 } }}>
              <InputLabel>Роль</InputLabel>
              <Select
                label="Роль"
                value={filters.role}
                onChange={(event) =>
                  onChange('role', event.target.value as UsersFiltersValue['role'])
                }
              >
                <MenuItem value="all">Все роли</MenuItem>
                {userRoleOptions.map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 190 } }}>
              <InputLabel>Статус</InputLabel>
              <Select
                label="Статус"
                value={filters.status}
                onChange={(event) =>
                  onChange('status', event.target.value as UsersFiltersValue['status'])
                }
              >
                <MenuItem value="all">Все статусы</MenuItem>
                {userStatusOptions.map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="outlined" sx={{ minWidth: { xs: '100%', md: 120 } }} onClick={onReset}>
              Сбросить
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
