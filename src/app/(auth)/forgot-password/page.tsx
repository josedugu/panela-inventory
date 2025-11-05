"use client";

import { useRouter } from "next/navigation";
import { ForgotPassword } from "@/features/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return <ForgotPassword onNavigateToSignIn={() => router.push("/sign-in")} />;
}
