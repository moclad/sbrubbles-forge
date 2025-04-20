'use client';
import { LockIcon, UserIcon } from 'lucide-react';
import { ReactNode, useMemo } from 'react';

import { PageContent } from '@repo/design-system/components/page-content';
import { TabsNavigation } from '@repo/design-system/components/tabs-navigation';
import { useI18n } from '@repo/localization/i18n/client';

export default function UserSettingsClientLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const t = useI18n();
  const tabs = useMemo(() => {
    return [
      {
        label: t('account.settings.label'),
        href: '/account',
        icon: <UserIcon />,
      },
      {
        label: t('account.security.label'),
        href: '/account//security',
        icon: <LockIcon />,
      },
    ];
  }, [t]);

  return (
    <PageContent header={t('account.title')} subTitle={t('account.subTitle')}>
      <TabsNavigation tabs={tabs} />
      {children}
    </PageContent>
  );
}
