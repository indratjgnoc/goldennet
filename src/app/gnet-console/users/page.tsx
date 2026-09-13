import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import UsersContent from "./UsersContent";

export default async function UsersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/gnet-console/login");
  }

  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    redirect("/gnet-console/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log("USERS DARI DATABASE:", users);

  const initialUsers = users.map((item) => ({
    id: item.id,
    name: item.name,
    username: item.username,
    email: item.email,
    role: item.role,
    status: item.status,
    lastLoginAt: item.lastLoginAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <UsersContent
      user={{
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      }}
      initialUsers={initialUsers}
    />
  );
}
