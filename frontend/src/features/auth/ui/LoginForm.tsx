import { Alert, Box, Button, Snackbar, TextField } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../model/authStore';
import { loginSchema, type LoginFormValues } from '../model/loginSchema';
import { authApi } from '../api/authApi';
import { parseApiError } from '../../../shared/api/error';

export function LoginForm() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [notification, setNotification] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await authApi.login(values);

      setAuth(response.user, response.access_token);

      navigate('/dashboard');
    } catch (error) {
      const apiError = parseApiError(error);

      if (apiError.fields) {
        Object.entries(apiError.fields).forEach(([field, message]) => {
          const fieldMessage = typeof message === 'string' ? message : 'Invalid field value';

          setError(field as keyof LoginFormValues, {
            type: 'server',
            message: fieldMessage,
          });
        });
      }

      const notificationMessage =
        typeof apiError.message === 'string' ? apiError.message : 'An unexpected error occurred.';

      setNotification(notificationMessage);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="Email"
          type="email"
          fullWidth
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register('email')}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>

        <Button component={Link} to="/register" variant="text" fullWidth>
          Create a new account
        </Button>
      </Box>

      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setNotification(null)}
          sx={{ width: '100%' }}
        >
          {notification}
        </Alert>
      </Snackbar>
    </>
  );
}
