import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';

import type { ProductCategory } from '../model/types';
import type { StoreOption } from '../../products/model/types';
import type {
  ProductCategoryDialogMode,
  ProductCategoryFormState,
} from '../lib/productCategoryForm';
import type { ProductCategoryTreeItem } from '../lib/productCategoryTree';

type ProductCategoryDialogProps = {
  open: boolean;
  mode: ProductCategoryDialogMode;
  editingCategory: ProductCategory | null;
  form: ProductCategoryFormState;
  selectedStore?: StoreOption;
  parentOptions: ProductCategoryTreeItem[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (patch: Partial<ProductCategoryFormState>) => void;
};

export function ProductCategoryDialog({
  open,
  mode,
  editingCategory,
  form,
  selectedStore,
  parentOptions,
  submitting,
  onClose,
  onSubmit,
  onFormChange,
}: ProductCategoryDialogProps) {
  const isEdit = mode === 'edit';

  const availableParentOptions = parentOptions.filter((category) => {
    if (category.level >= 2) {
      return false;
    }

    if (!editingCategory) {
      return true;
    }

    if (category.id === editingCategory.id) {
      return false;
    }

    return category.parent_id !== editingCategory.id;
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>
        {isEdit ? 'Редактировать категорию' : 'Добавить категорию'}
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Alert severity="info">
          Магазин: <strong>{selectedStore?.name || 'Не выбран'}</strong>
        </Alert>

        {editingCategory && (
          <Alert severity="warning">
            Изменения применятся к категории:{' '}
            <strong>{editingCategory.name}</strong>
          </Alert>
        )}

        <TextField
          label="Название"
          value={form.name}
          onChange={(event) => onFormChange({ name: event.target.value })}
          fullWidth
          required
        />

        <TextField
          label="Описание"
          value={form.description}
          onChange={(event) =>
            onFormChange({ description: event.target.value })
          }
          fullWidth
          multiline
          minRows={3}
        />

        <TextField
          select
          label="Родительская категория"
          value={form.parent_id}
          onChange={(event) => onFormChange({ parent_id: event.target.value })}
          fullWidth
          helperText="Оставь пустым, если это корневая категория"
        >
          <MenuItem value="">Без родителя</MenuItem>

          {availableParentOptions.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {'-'.repeat(category.level)} {category.name}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button disabled={submitting} onClick={onClose}>
          Отмена
        </Button>

        <Button
          variant="contained"
          disabled={submitting || !form.name.trim()}
          onClick={onSubmit}
        >
          {submitting ? (
            <CircularProgress size={20} />
          ) : isEdit ? (
            'Сохранить'
          ) : (
            'Создать'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}