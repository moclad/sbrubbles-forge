import { z } from 'zod';

export const formSchema = z.object({
  name: z
    .string()
    .nonempty({ message: 'Name is required' })
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name cannot exceed 50 characters' }),

  email: z
    .string()
    .nonempty({ message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' })
    .min(2)
    .max(50),

  password: z
    .string()
    .nonempty({ message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(50, { message: 'Password cannot exceed 50 characters' }),

  passwordConfirmation: z
    .string()
    .nonempty({ message: 'Password confirmation is required' })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(50, { message: 'Password cannot exceed 50 characters' }),
});

export const signInFormSchema = formSchema.pick({
  email: true,
  password: true,
});

export const signUpFormSchema = formSchema
  .pick({
    name: true,
    email: true,
    password: true,
    passwordConfirmation: true,
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'], // This ensures the error is attached to `passwordConfirmation`
  });

export const forgetPwFormSchema = formSchema.pick({
  email: true,
});

export const resetPwFormSchema = formSchema
  .pick({
    password: true,
    passwordConfirmation: true,
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'], // This ensures the error is attached to `passwordConfirmation`
  });
