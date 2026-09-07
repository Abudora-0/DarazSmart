import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "./signin-form";

export const metadata: Metadata = {
  title: "Sign In | DarazSmart",
  description: "Sign in or create a free account to sync your cart and manage price alerts.",
};

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
