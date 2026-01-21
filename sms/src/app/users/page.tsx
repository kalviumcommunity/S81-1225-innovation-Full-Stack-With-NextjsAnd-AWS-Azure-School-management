import Link from "next/link";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-foreground/70">
          Dynamic routes are under <code>/users/[id]</code>.
        </p>
      </div>

      <ul className="mt-6 divide-y divide-foreground/10 rounded-lg border border-foreground/10 bg-background">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <div className="text-sm font-medium text-foreground">
                {u.firstName} {u.lastName}
              </div>
              <div className="text-xs text-foreground/70">{u.email}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-foreground/60">{u.role}</span>
              <Link
                className="text-sm text-blue-600 hover:underline"
                href={`/users/${u.id}`}
              >
                View
              </Link>
            </div>
          </li>
        ))}

        {users.length === 0 ? (
          <li className="px-4 py-6 text-sm text-foreground/70">
            No users found.
          </li>
        ) : null}
      </ul>
    </main>
  );
}
