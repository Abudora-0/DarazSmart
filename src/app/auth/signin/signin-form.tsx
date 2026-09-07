"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cartItems = useCartStore((s) => s.items);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        name,
        action: mode === "register" ? "register" : "login",
        redirect: false,
      });

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
        return;
      }

      // Copy the local cart up to the account for cross-device continuity.
      // The local cart stays the source of truth for what is displayed, so
      // it must NOT be cleared here: doing that used to make signing in look
      // like it had emptied your cart.
      if (cartItems.length > 0) {
        await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: cartItems.map((i) => i.id) }),
        }).catch(() => {});
      }

      toast(
        mode === "register"
          ? "Account created. Welcome to DarazSmart."
          : "Signed in successfully",
        { variant: "success" }
      );
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="glass-float animate-fade-up w-full max-w-sm rounded-3xl p-8 shadow-[var(--shadow-3)]">
        <h1 className="mb-1 text-xl font-bold text-ink">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mb-6 text-sm text-ink-muted">
          {mode === "signin"
            ? "Sign in to sync your cart and manage alerts."
            : "Create a free account to save your cart and price alerts."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "register" && (
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <Input
                type="text"
                placeholder="Your name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <Input
              type="email"
              placeholder="Email address"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle transition-colors hover:text-brand-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {mode === "register" && (
            <p className="-mt-1 text-xs text-ink-subtle">
              At least 8 characters, with a letter and a number.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="animate-scale-in rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger"
            >
              {error}
            </p>
          )}

          <Button type="submit" block loading={loading} className="mt-1">
            {loading
              ? "Please wait"
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-muted">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                onClick={() => setMode("register")}
                className="font-semibold text-brand-600 hover:underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have one?{" "}
              <button
                onClick={() => setMode("signin")}
                className="font-semibold text-brand-600 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-ink-subtle transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
