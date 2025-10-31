"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("¡Inicio de sesión exitoso!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface-1 rounded-lg shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">PANELA</h1>
          <p className="text-text-secondary mt-2">
            Sistema de Gestión de Inventario
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
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
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-text-secondary">¿No tienes cuenta? </span>
          <Link href="/sign-up" className="text-primary hover:underline">
            Regístrate
          </Link>
        </div>

        <p className="text-center text-xs text-text-tertiary">
          Usa Supabase para crear una cuenta o inicia sesión con un usuario existente
        </p>
      </div>
    </div>
  );
}

