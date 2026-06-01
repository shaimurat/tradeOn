import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Stack, Typography } from '@mui/material';

type StoresPageHeaderProps = {
  title: string;
  description: string;
  createButtonLabel: string;
  onCreate: () => void;
};

export function StoresPageHeader({
  title,
  description,
  createButtonLabel,
  onCreate,
}: StoresPageHeaderProps) {
  return (
    <Stack
      direction={{
        xs: 'column',
        sm: 'row',
      }}
      spacing={2}
      sx={{
        justifyContent: 'space-between',
        alignItems: {
          xs: 'flex-start',
          sm: 'center',
        },
      }}
    >
      <Box>
        <Typography variant="h2">{title}</Typography>

        <Typography
          variant="body1"
          sx={{
            mt: 0.25,
            color: 'text.secondary',
          }}
        >
          {description}
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{
          height: 40,
          px: 2,
        }}
        onClick={onCreate}
      >
        {createButtonLabel}
      </Button>
    </Stack>
  );
}