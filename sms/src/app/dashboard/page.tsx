import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <p className="mt-2 text-sm text-foreground/70">
        This route is protected by middleware (JWT in cookies).
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="rounded-md border border-foreground/10 px-4 py-2 text-sm text-foreground/80 hover:text-foreground"
          href="/users"
        >
          View users
        </Link>
        <Link
          className="rounded-md border border-foreground/10 px-4 py-2 text-sm text-foreground/80 hover:text-foreground"
          href="/app"
        >
          Open full app dashboard
        </Link>
      </div>
    </main>
  );
}
