'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AdminRedirect() {
  const router = useRouter();
  const { user } = useAuth();
  
  useEffect(() => {
    // Redirect to the admin dashboard page
    router.replace('/admin/dashboard');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Redirecting to admin dashboard...</h2>
        <p className="mt-2">Please wait while we redirect you.</p>
      </div>
    </div>
  );
}
