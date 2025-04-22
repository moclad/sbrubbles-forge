import { getUserProfile } from '@/data/queries/user';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';

import { AccountSettings } from './AccountSettings';

export default async function AccountSettingsPage() {
  const user = await serverGetLoggedInUser();
  const userProfile = await getUserProfile(user.id);

  return <AccountSettings userProfile={userProfile} />;
}
