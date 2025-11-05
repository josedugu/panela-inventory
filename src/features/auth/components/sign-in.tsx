"use client";

import { Smartphone } from "lucide-react";
import { useState } from "react";
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

interface SignInProps {
  onSignIn: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
}

export function SignIn({
  onSignIn,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
}: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-1">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            ¡Bienvenido! Inicia sesión para acceder a tu sistema de gestión de
            inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <button
                  type="button"
                  onClick={onNavigateToForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Iniciar Sesión
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="text-primary hover:underline"
              >
                Regístrate
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
