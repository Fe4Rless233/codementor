// src/components/common/Footer.tsx
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming you have a utility for combining class names

interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  // You can add any specific props here if needed, e.g., 'variant' for different footer styles
}

export default function Footer({ className, ...props }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "bg-gray-800 text-white py-6 mt-auto", // `mt-auto` pushes it to the bottom in a flex column layout
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        {/* Copyright Information */}
        <p className="text-sm">
          &copy; {currentYear} CodeMentor. All rights reserved.
        </p>

        {/* Optional Navigation Links */}
        <nav className="mt-4 md:mt-0">
          <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <li>
              <Link href="/privacy" className="hover:text-primary-300 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-primary-300 transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary-300 transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}