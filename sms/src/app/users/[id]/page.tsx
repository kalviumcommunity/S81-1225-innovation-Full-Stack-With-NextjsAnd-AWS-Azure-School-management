import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `User ${id} | SMS`,
    description: `User profile for ${id}`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <nav className="text-sm text-foreground/70">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:underline" href="/dashboard">
              Dashboard
            </Link>
          </li>
          <li className="text-foreground/40">/</li>
          <li>
            <Link className="hover:underline" href="/users">
              Users
            </Link>
          </li>
          <li className="text-foreground/40">/</li>
          <li className="text-foreground">{user.id}</li>
        </ol>
      </nav>

      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        {user.firstName} {user.lastName}
      </h1>
      <p className="mt-1 text-sm text-foreground/70">{user.email}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-foreground/10 bg-background p-4">
          <div className="text-xs text-foreground/60">Role</div>
          <div className="mt-1 text-sm text-foreground">{user.role}</div>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-background p-4">
          <div className="text-xs text-foreground/60">User ID</div>
          <div className="mt-1 break-all text-sm text-foreground">
            {user.id}
          </div>
        </div>
        <div className="rounded-lg border border-foreground/10 bg-background p-4">
          <div className="text-xs text-foreground/60">Created</div>
          <div className="mt-1 text-sm text-foreground">
            {new Date(user.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    </main>
  );
}
