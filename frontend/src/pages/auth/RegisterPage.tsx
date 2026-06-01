import { RegisterForm } from '../../features/auth/ui/RegisterForm';
import { AuthLayout } from '../../widgets/layout/AuthLayout';

export function RegisterPage() {
  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Зарегистрируйтесь в TradeOn, чтобы начать продавать товары."
    >
      <RegisterForm />
    </AuthLayout>
  );
}