import { z } from 'zod'

export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type CreateUserDto = z.infer<typeof CreateUserSchema>
