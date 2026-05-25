import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email'),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;