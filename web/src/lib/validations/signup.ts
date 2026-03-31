import { z } from 'zod'

export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  companyName: z.string().min(1, 'Company name is required').max(100),
  email: z
    .string()
    .email('Invalid email address')
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  termsAccepted: z.literal(true, {
    error: 'You must accept the Terms of Service',
  }),
  locale: z.enum(['en', 'es']).default('en'),
  termsAcceptedAt: z.string().datetime().optional(),
  captchaToken: z.string().min(1, 'Verification required'),
})

export type SignupFormData = z.infer<typeof signupSchema>

export const completeRegistrationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100),
})

export type CompleteRegistrationData = z.infer<typeof completeRegistrationSchema>
