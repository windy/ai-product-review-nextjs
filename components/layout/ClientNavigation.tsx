'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function ClientNavigation() {
  const pathname = usePathname();
  
  // Don't show front-end navigation on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  return <Navigation />;
}