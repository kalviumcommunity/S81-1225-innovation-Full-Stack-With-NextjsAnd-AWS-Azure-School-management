import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">
        404 — Page Not Found
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Oops! This route doesn't exist.
      </p>
      <Link
        className="mt-6 rounded-md border border-foreground/10 px-4 py-2 text-sm text-foreground/80 hover:text-foreground"
        href="/"
      >
        Go home
      </Link>
    </main>
  );
}
