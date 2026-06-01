import { Box, IconButton, Tooltip, Typography } from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

import type { ProductCategory } from '../model/types';

type ProductCategoryTreeItemProps = {
  category: ProductCategory;
  level: number;
  childrenCount: number;
  categoryNameByID: Record<string, string>;
  onCreateChild: (category: ProductCategory) => void;
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
};

export function ProductCategoryTreeItem({
  category,
  level,
  childrenCount,
  categoryNameByID,
  onCreateChild,
  onEdit,
  onDelete,
}: ProductCategoryTreeItemProps) {
  const parentName = category.parent_id
    ? categoryNameByID[category.parent_id] || 'Родитель не найден'
    : '';

  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '1fr 220px 132px',
        },
        gap: 2,
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
          pl: {
            xs: 0,
            md: level * 3,
          },
        }}
      >
        {level > 0 && (
          <KeyboardArrowRightRoundedIcon
            sx={{
              mr: 0.5,
              fontSize: 18,
              color: 'text.secondary',
            }}
          />
        )}

        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: 'action.hover',
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1.25,
            flexShrink: 0,
          }}
        >
          <CategoryOutlinedIcon sx={{ fontSize: 19 }} />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {category.name}
          </Typography>

          <Typography noWrap variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {category.description || 'Без описания'}
          </Typography>

          {parentName && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: {
                  xs: 'block',
                  md: 'none',
                },
              }}
            >
              Родитель: {parentName}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: {
            xs: 'none',
            md: 'block',
          },
          minWidth: 0,
        }}
      >
        {parentName && (
          <>
            <Typography variant="caption" color="text.secondary">
              Родитель
            </Typography>

            <Typography
              noWrap
              sx={{
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {parentName}
            </Typography>
          </>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: {
            xs: 'flex-start',
            md: 'flex-end',
          },
          gap: 0.75,
        }}
      >
        {childrenCount > 0 && (
          <Tooltip title="Подкатегории">
            <Box
              sx={{
                px: 1,
                height: 28,
                borderRadius: 999,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                fontSize: 12,
                fontWeight: 800,
                color: 'text.secondary',
              }}
            >
              {childrenCount}
            </Box>
          </Tooltip>
        )}
        {level < 2 && (
          <Tooltip title="Добавить подкатегорию">
            <IconButton size="small" onClick={() => onCreateChild(category)}>
              <AddRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Редактировать">
          <IconButton size="small" onClick={() => onEdit(category)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Удалить">
          <IconButton size="small" color="error" onClick={() => onDelete(category)}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
