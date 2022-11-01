import { object, string, TypeOf } from 'zod';

export const loginUserSchema = {
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Not a valid email.'),
    password: string({
      required_error: 'Password id required',
    }),
  }),
};

export type LoginUserType = TypeOf<typeof loginUserSchema.body>;
