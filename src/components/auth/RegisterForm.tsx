'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { neo4jService } from '@/lib/neo4j'

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    
    try {
      const { user } = await authService.signUp(data.email, data.password, { username: data.username })
      if (!user) {
        throw new Error('User creation failed after sign up.')
      }

      // Create Neo4j user node
      await neo4jService.createUserNode(user.id, { email: user.email, username: data.username })

      toast.success('Account created successfully! Please check your email to verify.')
      router.push('/dashboard') // Redirect to dashboard or a verification pending page
    } catch (error: any) {
      toast.error(error.message || 'Failed to register')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-2">Join CodeMentor and start improving your coding skills</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Username"
            {...register('username')}
            error={errors.username?.message}
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email address"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            {...register('password')}
            error={errors.password?.message}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Sign Up
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/auth/login')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </Card>
  )
}