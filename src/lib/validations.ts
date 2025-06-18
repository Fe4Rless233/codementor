import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const codeAnalysisSchema = z.object({
  code: z.string().min(10, 'Code cannot be empty'),
  language: z.string().min(1, 'Language is required'),
  title: z.string().optional(),
  submissionId: z.string().optional()
})