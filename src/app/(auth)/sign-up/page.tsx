"use client";

import { useRouter } from "next/navigation";
import { SignUp } from "@/features/auth";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <SignUp
      onSignUp={() => router.push("/dashboard")}
      onNavigateToSignIn={() => router.push("/sign-in")}
    />
  );
}
