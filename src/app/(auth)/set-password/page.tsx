"use client";

import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { SetPassword } from "@/features/auth";

function SetPasswordContent() {
  const router = useRouter();

  return (
    <SetPassword
      onSuccess={() => router.push("/sign-in?password-set=true")}
      onNavigateToSignIn={() => router.push("/sign-in")}
    />
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-surface-1">
          <div className="text-center">Cargando...</div>
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
