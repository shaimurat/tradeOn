import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2.5,
        p: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 800 }}>{title}</Typography>

        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>

      {children}
    </Box>
  );
}