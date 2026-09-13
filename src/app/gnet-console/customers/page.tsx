import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import CustomersContent from './CustomersContent';

export default async function CustomersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/gnet-console/login');
  }

  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      branch: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });

  const branches = await prisma.branch.findMany({
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
  });

  const initialCustomers = customers.map((customer) => ({
    id: customer.id,
    customerCode: customer.customerCode,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    status: customer.status,
    branch: customer.branch,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  }));

  return (
    <CustomersContent
      user={{
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      }}
      initialCustomers={initialCustomers}
      branches={branches}
    />
  );
}