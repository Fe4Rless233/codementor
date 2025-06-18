// src/components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/lib/auth' // Your authentication service
import { Button } from '@/components/ui/Button' // Your Button component
import { Input } from '@/components/ui/Input' // Your Input component
import { Card } from '@/components/ui/Card'   // Your Card component
import toast from 'react-hot-toast' // For notifications

// Define the schema for form validation using Zod
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Infer the TypeScript type from the Zod schema
type LoginFormInputs = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // Initialize react-hook-form with Zod resolver
  const {
    register,      // Function to register input fields
    handleSubmit,  // Function to handle form submission
    formState: { errors } // Object containing form errors
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema) // Use Zod for validation
  })

  // Function to handle form submission
  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true) // Set loading state to true

    try {
      // Call your authentication service to sign in
      const { data: authData, error } = await authService.signIn(data.email, data.password)

      if (error) {
        throw error // Propagate error for toast notification
      }

      toast.success('Welcome back! You are now logged in.') // Success notification
      router.push('/dashboard') // Redirect to the dashboard page after successful login
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Failed to sign in. Please check your credentials.') // Error notification
    } finally {
      setLoading(false) // Reset loading state
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 md:p-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your CodeMentor account to continue.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email address"
            {...register('email')} // Register email input with react-hook-form
            error={errors.email?.message} // Display validation error for email
          />
        </div>

        <div>
          <Input
            type="password"
            placeholder="Password"
            {...register('password')} // Register password input with react-hook-form
            error={errors.password?.message} // Display validation error for password
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading} // Show loading spinner if login is in progress
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/auth/register')} // Navigate to registration page
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            type="button" // Important for buttons not inside a form, or to prevent submission
          >
            Sign up
          </button>
        </p>
      </div>
    </Card>
  )
}