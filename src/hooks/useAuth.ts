'use client';

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/components/auth/AuthProvider'; // Import the context from AuthProvider

/**
 * Custom hook to access the authentication context.
 * Provides user authentication status and a signOut function.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};