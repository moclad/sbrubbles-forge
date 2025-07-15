import Script from 'next/script';
import type { ReactNode } from 'react';
import { GoogleAnalytics } from './google';
import { keys } from './keys';

type AnalyticsProviderProps = {
  readonly children: ReactNode;
};

const {
  NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  NEXT_PUBLIC_UMAMI_SCRIPT_URL,
  NEXT_PUBLIC_GA_MEASUREMENT_ID,
} = keys();

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => (
  <div>
    {NEXT_PUBLIC_UMAMI_SCRIPT_URL && NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
      <Script
        data-website-id={NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        src={NEXT_PUBLIC_UMAMI_SCRIPT_URL}
        strategy='lazyOnload'
      />
    )}
    {children}
    {NEXT_PUBLIC_GA_MEASUREMENT_ID && (
      <GoogleAnalytics gaId={NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    )}
  </div>
);
