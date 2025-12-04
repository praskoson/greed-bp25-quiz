"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GreedAcademyLogo } from "@/components/ga-logo";
import { signInAdmin } from "./_lib/auth-actions";

export default function AdminSignIn() {
  const [state, formAction, isPending] = useActionState(signInAdmin, {
    error: null,
  });

  return (
    <div className="bg-brand flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <GreedAcademyLogo className="text-foreground-1" />
        </div>

        <Card className="bg-surface-1 border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-brand-dark text-xl">
              Admin Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  required
                  autoComplete="email"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
              </Field>

              {state.error && <FieldError>{state.error}</FieldError>}

              <Button
                type="submit"
                className="bg-brand hover:bg-brand-dark text-foreground-1 mt-2 w-full"
                disabled={isPending}
              >
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
