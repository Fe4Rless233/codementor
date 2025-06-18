import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { NextRequest } from 'next/server'
import { supabase } from './supabase'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.split(' ')[1]

  if (!token) return null

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    console.error('Auth user error:', error)
    return null
  }
  return user
}