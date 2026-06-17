import { ProfileClient } from '../../../components/profile/ProfileClient';

export const metadata = {
  title: 'حساب کاربری | نویسو',
};

/** Profile & settings (design template §10) — Step 2 scope: password + logout. */
export default function ProfilePage() {
  return <ProfileClient />;
}
