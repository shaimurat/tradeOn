import { Box, Button, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

type ProductCategoriesPageHeaderProps = {
  storesLoading: boolean;
  storesCount: number;
  onCreate: () => void;
};

export function ProductCategoriesPageHeader({
  storesLoading,
  storesCount,
  onCreate,
}: ProductCategoriesPageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: {
          xs: 'flex-start',
          md: 'center',
        },
        gap: 2,
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>
          Категории товаров
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Создавайте корневые категории, подкатегории и вложенные уровни.
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddRoundedIcon />}
        disabled={storesLoading || storesCount === 0}
        onClick={onCreate}
      >
        Добавить категорию
      </Button>
    </Box>
  );
}