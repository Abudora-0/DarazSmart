"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { toast } from "@/lib/toast";

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
  const clearCart = useCartStore((s) => s.clearCart);

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
        setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error);
        return;
      }

      // Sync anonymous cart to account
      if (cartItems.length > 0) {
        await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: cartItems.map((i) => i.id) }),
        }).catch(() => {});
        clearCart();
      }

      toast(mode === "register" ? "Account created — welcome!" : "Signed in successfully", {
        variant: "success",
      });
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
      <div className="glass-float animate-fade-up w-full max-w-sm rounded-3xl p-8 shadow-[0_20px_50px_-20px_rgba(120,45,10,0.35)]">
        <h1 className="mb-1 text-xl font-bold text-[#1c1917]">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {mode === "signin"
            ? "Sign in to sync your cart and manage alerts."
            : "Create a free account to save your cart and price alerts."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "register" && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-10 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-brand-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {mode === "register" && (
            <p className="-mt-1 text-xs text-gray-400">
              At least 8 characters, with a letter and a number.
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-colors hover:bg-brand-600 disabled:opacity-50"
          >
            {loading
              ? "Please wait…"
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
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
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
