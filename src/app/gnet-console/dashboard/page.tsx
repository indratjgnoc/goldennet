import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/session';

import DashboardContent from './DashboardContent';

export default async function GnetDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/gnet-console/login');
  }

  return <DashboardContent user={user} />;
}