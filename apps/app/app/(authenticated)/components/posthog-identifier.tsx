'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useAnalytics } from '@repo/analytics/posthog/client';
import { useSession } from '@repo/auth/client';

export const PostHogIdentifier = () => {
  const { data } = useSession();
  const identified = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const analytics = useAnalytics();

  useEffect(() => {
    // Track pageviews
    if (pathname && analytics) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }
      analytics.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, analytics]);

  useEffect(() => {
    if (!data || identified.current) {
      return;
    }

    analytics.identify(data.user.id, {
      email: data.user.emailVerified,
      firstName: data.user.name,
      lastName: data.user.name,
      createdAt: data.user.createdAt,
      avatar: data.user.image,
    });

    identified.current = true;
  }, [data, analytics]);

  return null;
};
