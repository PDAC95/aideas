import { z } from 'zod'

// Profile name schema: firstName required (1-50 chars), lastName optional (0-50 chars)
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .trim(),
  lastName: z
    .string()
    .max(50, 'Last name must be 50 characters or less')
    .trim()
    .optional()
    .default(''),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// Hourly cost schema: numeric, non-negative, max $10,000
export const hourlyCostSchema = z.object({
  hourlyCost: z
    .number()
    .min(0, 'Hourly cost cannot be negative')
    .max(10000, 'Hourly cost cannot exceed $10,000'),
  orgId: z.string().uuid('Invalid organization ID'),
})

export type HourlyCostFormData = z.infer<typeof hourlyCostSchema>

// Change password schema — same password rules as signup
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
