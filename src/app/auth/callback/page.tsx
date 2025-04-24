'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        try {
          // Set the session in Supabase
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            router.push('/error'); // Redirect to an error page
            return;
          }

          // Redirect to the dashboard after successful login
          router.push('/dashboard');
        } catch (err) {
          console.error('Error during OAuth callback:', err);
          router.push('/error'); // Redirect to an error page
        }
      } else {
        router.push('/error'); // Redirect to an error page if tokens are missing
      }
    };

    handleAuthCallback();
  }, [router, supabase]);

  return <p>Processing authentication...</p>;
}