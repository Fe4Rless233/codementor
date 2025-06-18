// src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Your Avatar component
import { User as UserType } from '@/types'; // Your extended User type
import { Loader2, User as UserIcon, Mail, Info, Edit, Save, XCircle } from 'lucide-react'; // Icons
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the schema for profile update form validation
const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional().or(z.literal('')),
  firstName: z.string().optional().or(z.literal('')),
  lastName: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().or(z.literal('')),
  avatar: z.string().url('Invalid URL for avatar').optional().or(z.literal('')), // Optional: allow user to set custom avatar URL
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserType | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset, // Used to reset form fields, especially after fetch or save
    formState: { errors, isDirty, isSubmitting }
  } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange', // Validate on change
  });

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return; // Only fetch if user object is available

      setProfileLoading(true);
      setProfileError(null);
      try {
        const response = await fetch('/api/user'); // Your API route to get user profile
        if (!response.ok) {
          throw new Error('Failed to fetch user profile.');
        }
        const data = await response.json();
        setProfile(data.user);
        // Reset form with fetched data
        reset({
          username: data.user.username || '',
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          bio: data.user.bio || '',
          avatar: data.user.avatar || '',
        });
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setProfileError(err.message || 'Unable to load profile. Please try again.');
        toast.error('Failed to load your profile.');
      } finally {
        setProfileLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchProfile();
    }
  }, [user, authLoading, reset]); // Add reset to dependency array

  const handleUpdateProfile = async (data: ProfileFormInputs) => {
    if (!user || !isDirty) {
      toast.info('No changes to save.');
      setIsEditing(false);
      return;
    }

    setProfileError(null);
    try {
      const updates = {
        username: data.username === '' ? null : data.username,
        firstName: data.firstName === '' ? null : data.firstName,
        lastName: data.lastName === '' ? null : data.lastName,
        bio: data.bio === '' ? null : data.bio,
        avatar: data.avatar === '' ? null : data.avatar,
      };

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile.');
      }

      const updatedData = await response.json();
      setProfile(updatedData.user);
      // Update Supabase user_metadata if fields like username/avatar are changed
      // This part might need direct Supabase admin SDK or a Supabase function if not handled by API
      await user.update({
        data: {
          username: updatedData.user.username,
          firstName: updatedData.user.firstName,
          lastName: updatedData.user.lastName,
          avatar: updatedData.user.avatar,
          bio: updatedData.user.bio
        }
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false); // Exit editing mode
      reset(updatedData.user); // Reset form with the new data
    } catch (err: any) {
      console.error('Update profile error:', err);
      setProfileError(err.message || 'Failed to update profile. Please try again.');
      toast.error(err.message || 'Error updating profile.');
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Your Profile</h1>
          <p className="text-lg text-gray-600">Manage your personal information and settings.</p>
        </div>

        {profileError && (
          <div className="p-4 mb-6 text-center text-red-700 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircle className="h-5 w-5 mr-2" />
            <p>{profileError}</p>
          </div>
        )}

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit(handleUpdateProfile)} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <Avatar className="h-28 w-28 border-4 border-primary-200">
                <AvatarImage src={profile?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.username || profile?.email}`} alt={profile?.username || profile?.email || 'User'} />
                <AvatarFallback className="text-5xl bg-primary-500 text-white">
                  {profile?.username ? profile.username[0].toUpperCase() : profile?.email ? profile.email[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              {isEditing ? (
                <Input
                  placeholder="Avatar URL"
                  {...register('avatar')}
                  error={errors.avatar?.message}
                  className="w-full max-w-sm text-center"
                />
              ) : (
                <p className="text-gray-600">Level: {profile?.level} | Total Score: {profile?.totalScore}</p>
              )}
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <Input
                  id="firstName"
                  placeholder="Your first name"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  disabled={!isEditing || isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <Input
                  id="lastName"
                  placeholder="Your last name"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  disabled={!isEditing || isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <Input
                id="username"
                placeholder="Unique username"
                {...register('username')}
                error={errors.username?.message}
                disabled={!isEditing || isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''} // Email is usually managed by auth provider and not editable directly here
                disabled // Email is typically not directly editable via profile forms
                className="bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                id="bio"
                placeholder="Tell us about yourself..."
                rows={4}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-60"
                {...register('bio')}
                disabled={!isEditing || isSubmitting}
              />
              {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset(profile || {}); // Revert changes by resetting form to last fetched profile
                      setIsEditing(false);
                      toast.info('Profile editing cancelled.');
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={isSubmitting} disabled={!isDirty || isSubmitting}>
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}