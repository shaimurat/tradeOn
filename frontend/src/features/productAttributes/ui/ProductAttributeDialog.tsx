import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { ProductCategory } from '../../productCategories/model/types';
import type { ProductAttributeType } from '../model/types';

export type ProductAttributeForm = {
  category_id: string;
  name: string;
  code: string;
  type: ProductAttributeType;
  unit: string;
  is_required: boolean;
  is_filter: boolean;
  options: string[];
};

type Props = {
  open: boolean;
  editing: boolean;
  form: ProductAttributeForm;
  categories: ProductCategory[];
  submitting: boolean;
  onChange: (patch: Partial<ProductAttributeForm>) => void;
  onClose: () => void;
  onSubmit: () => void;
};

const typeLabels: Record<ProductAttributeType, string> = {
  text: 'Текст',
  number: 'Число',
  bool: 'Да / нет',
  select: 'Выбор из списка',
};

export function ProductAttributeDialog({
  open,
  editing,
  form,
  categories,
  submitting,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  const updateOption = (index: number, value: string) => {
    onChange({ options: form.options.map((option, i) => (i === index ? value : option)) });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{editing ? 'Изменить атрибут' : 'Добавить атрибут'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            select
            label="Категория"
            value={form.category_id}
            onChange={(event) => onChange({ category_id: event.target.value })}
            helperText="Без категории атрибут будет доступен всем товарам магазина"
            disabled={editing}
          >
            <MenuItem value="">Все категории</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              required
              label="Название"
              value={form.name}
              onChange={(event) => onChange({ name: event.target.value })}
            />
            <TextField
              fullWidth
              required
              label="Код"
              value={form.code}
              onChange={(event) => onChange({ code: event.target.value })}
              helperText="Например: color"
            />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              fullWidth
              label="Тип"
              value={form.type}
              onChange={(event) =>
                onChange({ type: event.target.value as ProductAttributeType, options: [] })
              }
            >
              {Object.entries(typeLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Единица измерения"
              value={form.unit}
              onChange={(event) => onChange({ unit: event.target.value })}
              placeholder="см, кг, ГБ"
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_required}
                  onChange={(event) => onChange({ is_required: event.target.checked })}
                />
              }
              label="Обязательный"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_filter}
                  onChange={(event) => onChange({ is_filter: event.target.checked })}
                />
              }
              label="Использовать в фильтрах"
            />
          </Stack>
          {form.type === 'select' && (
            <Stack spacing={1}>
              {form.options.map((option, index) => (
                <Stack key={index} direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`Вариант ${index + 1}`}
                    value={option}
                    onChange={(event) => updateOption(index, event.target.value)}
                  />
                  <IconButton
                    aria-label={`Удалить вариант ${index + 1}`}
                    onClick={() =>
                      onChange({ options: form.options.filter((_, i) => i !== index) })
                    }
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => onChange({ options: [...form.options, ''] })}
                sx={{ alignSelf: 'flex-start' }}
              >
                Добавить вариант
              </Button>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={submitting || !form.name.trim() || !form.code.trim()}
        >
          {submitting ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
