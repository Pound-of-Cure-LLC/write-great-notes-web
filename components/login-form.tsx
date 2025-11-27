"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

import { logger } from "@/lib/logger";
export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect parameter from URL (e.g., /login?redirect=/settings/profile)
  // Prevent redirect loops by rejecting /login and /signup as redirect targets
  const rawRedirect = searchParams.get('redirect');
  const redirectParam = (rawRedirect && rawRedirect !== '/login' && rawRedirect !== '/signup')
    ? rawRedirect
    : '/appointments';

  // Check for auth error from sessionStorage (set by api-client on 401)
  useEffect(() => {
    const authError = sessionStorage.getItem('auth_error');
    if (authError) {
      setError(authError);
      sessionStorage.removeItem('auth_error'); // Clear it after reading
    }
  }, []);

  // Use auth redirect hook - only runs after successful login
  const { redirectPath, isChecking, error: redirectError } = useAuthRedirect({
    fallbackPath: redirectParam,
    skip: !justLoggedIn, // Only check redirect after login
  });

  // Redirect when path is determined (success) or error occurs
  useEffect(() => {
    if (!justLoggedIn || isChecking) return;

    // Success case: redirect path determined
    if (redirectPath) {
      logger.debug('LoginForm: Redirecting to', redirectPath);
      router.push(redirectPath);
      return;
    }

    // Error case: profile fetch failed, use fallback
    if (redirectError) {
      logger.error('LoginForm: Profile fetch failed, using fallback redirect:', {
        error: redirectError,
        fallback: redirectParam
      });
      setError('Failed to load user profile. Redirecting to dashboard...');
      // Show error briefly before redirecting
      setTimeout(() => {
        router.push(redirectParam);
      }, 1000);
    }
  }, [justLoggedIn, redirectPath, isChecking, redirectError, redirectParam, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Trigger redirect logic
      // Keep loading state active until redirect completes
      setJustLoggedIn(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false); // Only turn off loading on error
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="email-input"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="password-input"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                loadingText="Logging in"
                data-testid="login-submit"
              >
                Login
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="underline underline-offset-4"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
