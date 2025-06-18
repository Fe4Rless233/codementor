import { User as SupabaseAuthUser } from '@supabase/supabase-js';

// Extend Supabase's User type to include any custom metadata stored
// during sign-up, which can be accessed via user.user_metadata
export interface User extends SupabaseAuthUser {
  user_metadata?: {
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    // Add any other fields you store in user_metadata
  };
  // You might also want to add direct fields from your 'users' table
  // if you hydrate the user object with this data after fetching from your DB
  // This would typically come from your `User` model in Prisma, not Supabase `User`
  // For simplicity, we are combining them here to represent the 'authenticated user profile'
  level?: string;
  totalScore?: number;
}


// If you have specific shapes for login/register data that go beyond Zod schemas, define them here
// For instance, if your API expects certain fields or transforms them
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  // You might add other fields here that are part of the initial registration,
  // e.g., firstName, lastName, etc., if your registration form collects them
  firstName?: string;
  lastName?: string;
}

// Represents the shape of the authentication context
export interface AuthContextType {
  user: User | null; // The currently authenticated user, or null if not authenticated
  loading: boolean;  // True if authentication state is being loaded
  signOut: () => Promise<void>; // Function to sign out the user
}