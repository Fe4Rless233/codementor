// src/components/common/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook to get the current path
import { cn } from '@/lib/utils'; // Utility for combining class names
import {
  LayoutDashboard, // Dashboard
  Code,            // Editor
  Users,           // Collaborate
  Award,           // Leaderboard
  User,            // Profile
  Settings,        // Settings
  LogOut           // Sign Out
} from 'lucide-react'; // Icons

import { useAuth } from '@/hooks/useAuth'; // Your auth hook
import { Button } from '@/components/ui/Button'; // Your button component

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  // Add any specific props here if needed, e.g., 'isCollapsed' for a toggleable sidebar
}

export default function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname(); // Get the current path for active link highlighting
  const { signOut } = useAuth(); // Get the signOut function from your auth hook

  // Define your navigation items
  const navItems = [
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      active: pathname === '/dashboard',
    },
    {
      href: '/editor',
      icon: Code,
      label: 'Editor',
      active: pathname === '/editor',
    },
    {
      href: '/collaborate',
      icon: Users,
      label: 'Collaborate',
      active: pathname.startsWith('/collaborate'), // Use startsWith for nested routes
    },
    {
      href: '/leaderboard',
      icon: Award,
      label: 'Leaderboard',
      active: pathname === '/leaderboard',
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profile',
      active: pathname === '/profile',
    },
    {
      href: '/settings',
      icon: Settings,
      label: 'Settings',
      active: pathname === '/settings',
    },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-full w-64 bg-gray-900 text-white p-4 shadow-lg",
        className
      )}
      {...props}
    >
      {/* Logo/Brand (can be repeated or removed if in Header) */}
      <div className="mb-8 flex items-center justify-center">
        <Link href="/dashboard" className="flex items-center space-x-2 text-2xl font-bold text-white hover:text-primary-300 transition-colors">
          <Code className="h-7 w-7 text-primary-500" />
          <span>CodeMentor</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const IconComponent = item.icon; // Dynamic icon rendering
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                item.active
                  ? "bg-primary-700 text-white shadow"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <IconComponent className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="mt-8 pt-4 border-t border-gray-700">
        <Button
          variant="ghost" // Use ghost variant for a subtle button
          className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}