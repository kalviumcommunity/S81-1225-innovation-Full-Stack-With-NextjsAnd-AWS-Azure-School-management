"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import FormInput from "@/components/FormInput";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = useMemo(
    () =>
      handleSubmit(async (data) => {
        // Demo: replace with a real API route when you add one.
        console.log("[contact] submitted", data);
        setSubmitted(true);
        reset();
      }),
    [handleSubmit, reset]
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader
            title="Contact us"
            description="Validated with Zod + React Hook Form."
          />

          {submitted ? (
            <p className="mb-4 text-sm text-foreground/70">
              Thanks — your message was captured in the console.
            </p>
          ) : null}

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <FormInput
              label="Name"
              name="name"
              register={register}
              error={errors.name?.message}
              autoComplete="name"
            />

            <FormInput
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email?.message}
              autoComplete="email"
              placeholder="you@school.edu"
            />

            <FormInput
              label="Message"
              name="message"
              register={register}
              error={errors.message?.message}
              multiline
              rows={5}
              placeholder="Tell us what you need help with…"
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Submit"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
