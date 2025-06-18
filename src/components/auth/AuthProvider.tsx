// src/components/auth/AuthProvider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/auth-helpers-nextjs' // Supabase's User type
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast' // Added for user feedback on sign out

// Define the AuthContextType here, as it's what the context will provide.
// This type is also used by src/hooks/useAuth.ts.
export interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined) // Changed to undefined for initial state

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUserSession = async () => {
      setLoading(true); // Ensure loading is true at start
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUserSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event); // Log auth events for debugging
        setUser(session?.user ?? null);
        setLoading(false); // Set loading to false once the state is determined
        if (event === 'SIGNED_OUT') {
          router.push('/auth/login'); // Redirect to login on sign out
          toast.success('You have been signed out.');
        } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          // You might want to redirect to dashboard only if on public page
          // if (router.pathname === '/' || router.pathname.startsWith('/auth')) {
          //   router.push('/dashboard');
          // }
        }
      }
    );

    return () => {
      subscription.unsubscribe(); // Clean up subscription on unmount
    };
  }, [router]); // Include router in dependency array if it's used inside the effect

  const signOut = async () => {
    setLoading(true); // Indicate loading while signing out
    const { error } = await supabase.auth.signOut();
    setLoading(false); // Reset loading state
    if (error) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out.');
    } else {
      // The onAuthStateChange listener will handle the redirect and toast message
      // No need to manually push('/auth/login') or toast.success here again.
    }
  }

  // The value provided to the context
  const contextValue: AuthContextType = { user, loading, signOut };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Remove the export for useAuth from here as it's now in its own hook file
// export const useAuth = () => useContext(AuthContext)