"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button, LinkButton } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = useMemo(
    () => searchParams.get("next") || "/app",
    [searchParams]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await login(email, password);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    router.replace(next);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader
            title="Sign in"
            description="Use your email and password to access the dashboard."
          />

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-foreground/70">New here?</p>
              <LinkButton href="/signup" variant="secondary">
                Create account
              </LinkButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
