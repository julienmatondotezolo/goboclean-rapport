'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BottomNav } from '@/components/ui/bottom-nav';
import { FloatingActionButton } from '@/components/ui/floating-action-button';

/**
 * NavigationWrapper component that conditionally renders
 * the bottom navigation and floating action button based on the current route.
 */
export function NavigationWrapper() {
  const pathname = usePathname();
  
  // Pages where navigation should be hidden
  const hideNavigationPaths = [
    '/login',
  ];
  
  // Check if current path should hide navigation
  const shouldHideNavigation = hideNavigationPaths.some(path => 
    pathname.includes(path)
  ) || pathname.endsWith('/'); // Hide on root/home page
  
  if (shouldHideNavigation) {
    return null;
  }
  
  return (
    <>
      <FloatingActionButton />
      <BottomNav />
    </>
  );
}
