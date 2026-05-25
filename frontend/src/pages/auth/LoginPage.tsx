import { LoginForm } from '../../features/auth/ui/LoginForm';
import { AuthLayout } from '../../widgets/layout/AuthLayout';

export function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your stores and products.">
      <LoginForm />
    </AuthLayout>
  );
}