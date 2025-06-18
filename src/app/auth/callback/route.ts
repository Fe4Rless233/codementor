// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Your Supabase client instance

/**
 * Handles the Supabase OAuth or email confirmation callback.
 * It exchanges the authorization code for a user session and redirects.
 */
export async function GET(req: NextRequest) {
  // Get the 'code' parameter from the URL search params
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  // Define the URL to redirect to after successful authentication
  const redirectTo = new URL('/dashboard', req.url); // Redirect to dashboard on success

  // If a code is present, attempt to exchange it for a session
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // If successful, redirect the user to the desired page (e.g., dashboard)
        console.log('Successfully exchanged code for session. Redirecting to dashboard.');
        return NextResponse.redirect(redirectTo);
      } else {
        // If there's an error during code exchange
        console.error('Error exchanging code for session:', error.message);
        // Redirect to login page with an error message or toast it on the login page
        redirectTo.pathname = '/auth/login';
        redirectTo.searchParams.set('error', 'Authentication failed. Please try again.');
        return NextResponse.redirect(redirectTo);
      }
    } catch (err: any) {
      console.error('Unexpected error during OAuth callback:', err);
      // Catch any unexpected errors
      redirectTo.pathname = '/auth/login';
      redirectTo.searchParams.set('error', 'An unexpected error occurred during authentication.');
      return NextResponse.redirect(redirectTo);
    }
  }

  // If no code is present (e.g., direct access or invalid callback)
  console.warn('Auth callback called without a code parameter. Redirecting to login.');
  redirectTo.pathname = '/auth/login';
  redirectTo.searchParams.set('error', 'Invalid authentication callback.');
  return NextResponse.redirect(redirectTo);
}