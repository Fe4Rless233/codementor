import RegisterForm from '@/components/auth/RegisterForm'
import { Card } from '@/components/ui/Card'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <RegisterForm />
    </div>
  )
}