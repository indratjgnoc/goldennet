import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import ConsoleShell from "@/components/layout/ConsoleShell";

type Props = {
  children: ReactNode;
};

export default async function InventoryLayout({
  children,
}: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/gnet-console/login");
  }

  return (
    <ConsoleShell
      user={{
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      }}
    >
      {children}
    </ConsoleShell>
  );
}