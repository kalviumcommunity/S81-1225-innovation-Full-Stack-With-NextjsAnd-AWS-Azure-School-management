"use client";

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-foreground">Users</h1>
      <p className="mt-2 text-sm text-red-600">
        Something went wrong loading users.
      </p>
      <p className="mt-2 text-xs text-foreground/60">{error.message}</p>

      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md border border-foreground/10 px-4 py-2 text-sm text-foreground/80 hover:text-foreground"
      >
        Try again
      </button>
    </main>
  );
}
