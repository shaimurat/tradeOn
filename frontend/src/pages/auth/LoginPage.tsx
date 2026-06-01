import { LoginForm } from '../../features/auth/ui/LoginForm';
import { AuthLayout } from '../../widgets/layout/AuthLayout';

export function LoginPage() {
  return (
    <AuthLayout
      title="С возвращением"
      subtitle="Войдите в аккаунт, чтобы управлять магазинами и товарами."
    >
      <LoginForm />
    </AuthLayout>
  );
}