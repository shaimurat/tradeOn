import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

type MediaUploadFieldProps = {
  label: string;
  helperText?: string;
  value?: File | null;
  previewUrl?: string | null;
  accept?: string;
  variant?: 'avatar' | 'banner';
  disabled?: boolean;
  onChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
};

export function MediaUploadField({
  label,
  helperText,
  value,
  previewUrl,
  accept = 'image/*',
  variant = 'banner',
  disabled = false,
  onChange,
  onRemoveExisting,
}: MediaUploadFieldProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const inputId = useMemo(() => {
    return `media-upload-${label.toLowerCase().replace(/\s+/g, '-')}`;
  }, [label]);

  useEffect(() => {
    if (!value) {
      setLocalPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setLocalPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  const currentPreview = localPreview || previewUrl || null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onChange(file);

    event.target.value = '';
  };

  const handleRemove = () => {
    onChange(null);

    if (!value && previewUrl && onRemoveExisting) {
      onRemoveExisting();
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderStyle: 'dashed',
        bgcolor: 'background.default',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {label}
              </Typography>

              {helperText && (
                <Typography variant="caption" color="text.secondary">
                  {helperText}
                </Typography>
              )}
            </Box>

            {currentPreview && (
              <IconButton
                size="small"
                color="error"
                disabled={disabled}
                onClick={handleRemove}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          {variant === 'avatar' ? (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
              }}
            >
              <Avatar
                src={currentPreview ?? undefined}
                variant="rounded"
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: 3,
                  bgcolor: 'action.hover',
                }}
              />

              <Box>
                <input
                  id={inputId}
                  hidden
                  type="file"
                  accept={accept}
                  disabled={disabled}
                  onChange={handleFileChange}
                />

                <Button
                  component="label"
                  htmlFor={inputId}
                  variant="outlined"
                  startIcon={<UploadFileOutlinedIcon />}
                  disabled={disabled}
                >
                  Загрузить
                </Button>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Box
                sx={{
                  height: 150,
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {currentPreview ? (
                  <Box
                    component="img"
                    src={currentPreview}
                    alt={label}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Изображение не выбрано
                  </Typography>
                )}
              </Box>

              <Box>
                <input
                  id={inputId}
                  hidden
                  type="file"
                  accept={accept}
                  disabled={disabled}
                  onChange={handleFileChange}
                />

                <Button
                  component="label"
                  htmlFor={inputId}
                  variant="outlined"
                  startIcon={<UploadFileOutlinedIcon />}
                  disabled={disabled}
                >
                  Загрузить
                </Button>
              </Box>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}