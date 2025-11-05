"use client";

import { useRouter } from "next/navigation";
import { SignIn } from "@/features/auth";

export default function SignInPage() {
  const router = useRouter();

  return (
    <SignIn
      onSignIn={() => router.push("/dashboard")}
      onNavigateToSignUp={() => router.push("/sign-up")}
      onNavigateToForgotPassword={() => router.push("/forgot-password")}
    />
  );
}
