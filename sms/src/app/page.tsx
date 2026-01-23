import { LinkButton } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:py-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1 text-xs text-foreground/70 dark:bg-foreground/5">
            <span className="h-2 w-2 rounded-full bg-brand" />
            Responsive + theme-aware UI
          </div>

          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            School Management System
          </h1>
          <p className="mt-3 text-base leading-7 text-foreground/70">
            A professional, lightweight dashboard for managing projects, tasks,
            and users — backed by Next.js, Prisma, PostgreSQL, and Redis
            caching.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/login">Sign in</LinkButton>
            <LinkButton href="/signup" variant="secondary">
              Create account
            </LinkButton>
            <LinkButton href="/app" variant="secondary">
              Open dashboard
            </LinkButton>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-3">
          <div className="rounded-lg border border-foreground/10 bg-background p-4 sm:p-5">
            <div className="text-sm font-medium text-foreground">
              Authentication
            </div>
            <div className="mt-1 text-sm text-foreground/70">
              JWT sessions secured on every API request.
            </div>
          </div>
          <div className="rounded-lg border border-foreground/10 bg-background p-4 sm:p-5">
            <div className="text-sm font-medium text-foreground">
              Projects & Tasks
            </div>
            <div className="mt-1 text-sm text-foreground/70">
              Create projects and track task progress.
            </div>
          </div>
          <div className="rounded-lg border border-foreground/10 bg-background p-4 sm:p-5">
            <div className="text-sm font-medium text-foreground">
              Redis Caching
            </div>
            <div className="mt-1 text-sm text-foreground/70">
              Caches admin users list to reduce DB load.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
