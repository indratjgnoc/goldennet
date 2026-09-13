import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import BranchesContent from "./BranchesContent";

export default async function BranchesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/gnet-console/login");
  }

  const branches = await prisma.branch.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          customers: true,
          coverageAreas: true,
          registrations: true,
        },
      },
    },
  });

  const initialBranches = branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    code: branch.code,
    address: branch.address,
    phone: branch.phone,
    email: branch.email,
    latitude:
      branch.latitude !== null
        ? Number(branch.latitude)
        : null,
    longitude:
      branch.longitude !== null
        ? Number(branch.longitude)
        : null,
    isActive: branch.isActive,
    createdAt: branch.createdAt.toISOString(),
    updatedAt: branch.updatedAt.toISOString(),
    counts: {
      customers: branch._count.customers,
      coverageAreas: branch._count.coverageAreas,
      registrations: branch._count.registrations,
    },
  }));

  return (
    <BranchesContent
      user={{
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      }}
      initialBranches={initialBranches}
    />
  );
}