import { RegisterForm } from '../../features/auth/ui/RegisterForm';
import { AuthLayout } from '../../widgets/layout/AuthLayout';

export function RegisterPage() {
  return (
    <AuthLayout title="Create account" subtitle="Set up your TradeOn account and start selling.">
      <RegisterForm />
    </AuthLayout>
  );
}