import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import RegistrationsContent from './RegistrationsContent';

export default async function RegistrationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/gnet-console/login');
  }

  const [registrations, branches, packages] =
    await Promise.all([
      prisma.registration.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          package: {
            select: {
              id: true,
              name: true,
              code: true,
              speed: true,
              price: true,
              isPopular: true,
            },
          },
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          customer: {
            select: {
              id: true,
              customerCode: true,
              name: true,
              phone: true,
              status: true,
            },
          },
        },
      }),

      prisma.branch.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),

      prisma.internetPackage.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          code: true,
          speed: true,
          price: true,
          isPopular: true,
        },
        orderBy: [
          {
            isPopular: 'desc',
          },
          {
            speed: 'asc',
          },
        ],
      }),
    ]);

  const initialRegistrations =
    registrations.map((registration) => ({
      id: registration.id,
      registrationCode:
        registration.registrationCode,
      name: registration.name,
      phone: registration.phone,
      email: registration.email,
      address: registration.address,
      notes: registration.notes,
      status: registration.status,
      customerId: registration.customerId,

      package: {
        id: registration.package.id,
        name: registration.package.name,
        code: registration.package.code,
        speed: registration.package.speed,
        price: Number(
          registration.package.price,
        ),
        isPopular:
          registration.package.isPopular,
      },

      branch: registration.branch,

      customer: registration.customer,

      createdAt:
        registration.createdAt.toISOString(),

      updatedAt:
        registration.updatedAt.toISOString(),
    }));

  const packageOptions = packages.map(
    (item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      speed: item.speed,
      price: Number(item.price),
      isPopular: item.isPopular,
    }),
  );

  return (
    <RegistrationsContent
      user={{
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      }}
      initialRegistrations={
        initialRegistrations
      }
      branches={branches}
      packages={packageOptions}
    />
  );
}