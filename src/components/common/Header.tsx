// src/components/common/Header.tsx
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming your utility for class names
import { useAuth } from '@/hooks/useAuth'; // Use your custom useAuth hook
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; // Assuming you have a dropdown component, or using a library like shadcn/ui
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Assuming you have an Avatar component
import { LogOut, User as UserIcon, Settings, Code, Zap, Users } from 'lucide-react'; // Icons

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  // You can add props here if the header needs to be highly configurable
}

export default function Header({ className, ...props }: HeaderProps) {
  const { user, loading, signOut } = useAuth(); // Get user and signOut from your auth hook

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-white shadow-sm",
        className
      )}
      {...props}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
          <Code className="h-6 w-6 text-primary-600" />
          <span>CodeMentor</span>
        </Link>

        {/* Main Navigation (Visible when logged in) */}
        {!loading && user && (
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/editor" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Editor
            </Link>
            <Link href="/collaborate" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Collaborate
            </Link>
            <Link href="/leaderboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Leaderboard
            </Link>
          </nav>
        )}

        {/* User Auth Actions */}
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                  <Avatar className="h-8 w-8">
                    {/* User avatar from Supabase metadata, fall back to initial */}
                    <AvatarImage src={user.user_metadata?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.user_metadata?.username || user.email}`} alt={user.user_metadata?.username || user.email || 'User'} />
                    <AvatarFallback>{user.user_metadata?.username ? user.user_metadata.username[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {user.user_metadata?.username || user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center w-full">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    <span>Skills</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="flex items-center text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => (window.location.href = '/auth/login')}>
                Sign In
              </Button>
              <Button onClick={() => (window.location.href = '/auth/register')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}