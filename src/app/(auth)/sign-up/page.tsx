"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("¡Cuenta creada! Verifica tu email para continuar.");
    router.push("/sign-in");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface-1 rounded-lg shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Crear Cuenta</h1>
          <p className="text-text-secondary mt-2">
            Regístrate en PANELA
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
            <p className="text-xs text-text-tertiary mt-1">
              Mínimo 6 caracteres
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-text-secondary">¿Ya tienes cuenta? </span>
          <Link href="/sign-in" className="text-primary hover:underline">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

