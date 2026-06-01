import { Box, Button, Stack, Typography } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

type ProductsPageHeaderProps = {
  storesLoading: boolean;
  storesCount: number;
  onCreate: () => void;
};

export function ProductsPageHeader({
  storesLoading,
  storesCount,
  onCreate,
}: ProductsPageHeaderProps) {
  return (
    <Stack
      direction={{
        xs: 'column',
        md: 'row',
      }}
      spacing={2}
      sx={{
        justifyContent: 'space-between',
        alignItems: {
          xs: 'stretch',
          md: 'center',
        },
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Товары
        </Typography>

        <Typography color="text.secondary">
          Управление товарами, категориями, ценами и статусами публикации.
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreate}
        disabled={storesLoading || storesCount === 0}
        sx={{ alignSelf: { xs: 'stretch', md: 'center' } }}
      >
        Добавить товар
      </Button>
    </Stack>
  );
}