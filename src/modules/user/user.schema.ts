import { object, TypeOf, string } from 'zod';

export const registerUserSchema = {
  body: object({
    username: string({
      required_error: 'Username is required.',
    }),
    email: string({
      required_error: 'email is required.',
    }),
    password: string({
      required_error: 'Password is required.',
    }).min(6, 'Password should have at least 6 characters'),
    confirmPassword: string({
      required_error: 'Username is required.',
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
};

export type RegisterUserType = TypeOf<typeof registerUserSchema.body>;
