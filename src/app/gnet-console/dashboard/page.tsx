import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/gnet-console/login');
  }

  const [
    totalUsers,
    activeUsers,
    totalCustomers,
    activeCustomers,
    pendingRegistrations,
    activeSubscriptions,
    totalPackages,
    totalBranches,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        status: 'ACTIVE',
      },
    }),

    prisma.customer.count(),

    prisma.customer.count({
      where: {
        status: 'ACTIVE',
      },
    }),

    prisma.registration.count({
      where: {
        status: 'PENDING',
      },
    }),

    prisma.subscription.count({
      where: {
        status: 'ACTIVE',
      },
    }),

    prisma.internetPackage.count({
      where: {
        isActive: true,
      },
    }),

    prisma.branch.count({
      where: {
        isActive: true,
      },
    }),
  ]);

  return (
    <DashboardContent
      user={{
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      }}
      statistics={{
        totalUsers,
        activeUsers,
        totalCustomers,
        activeCustomers,
        pendingRegistrations,
        activeSubscriptions,
        totalPackages,
        totalBranches,
      }}
    />
  );
}