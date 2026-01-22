"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import FormInput from "@/components/FormInput";
import { signupSchema, type SignupInput } from "@/types/auth";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const res = await signup(data);

    if (!res.ok) {
      setError("root", { type: "server", message: res.message });
      return;
    }

    router.replace("/app");
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader
            title="Create account"
            description="Create a student account to start using the system."
          />

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormInput
                label="First name"
                name="firstName"
                register={register}
                error={errors.firstName?.message}
                autoComplete="given-name"
              />
              <FormInput
                label="Last name"
                name="lastName"
                register={register}
                error={errors.lastName?.message}
                autoComplete="family-name"
              />
            </div>

            <FormInput
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email?.message}
              placeholder="you@school.edu"
              autoComplete="email"
            />

            <div className="space-y-2">
              <FormInput
                label="Password"
                name="password"
                type="password"
                register={register}
                error={errors.password?.message}
                autoComplete="new-password"
              />
              <p className="text-xs text-foreground/60">
                Must match the server password rules.
              </p>
            </div>

            <FormInput
              label="Confirm password"
              name="confirmPassword"
              type="password"
              register={register}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
            />

            {errors.root?.message ? (
              <p className="text-sm text-red-600">{errors.root.message}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create account"}
            </Button>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-foreground/70">
                Already have an account?
              </p>
              <LinkButton href="/login" variant="secondary">
                Sign in
              </LinkButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
