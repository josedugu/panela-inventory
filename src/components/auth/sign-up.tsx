"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Smartphone } from "lucide-react";

interface SignUpProps {
  onSignUp: () => void;
  onNavigateToSignIn: () => void;
}

export function SignUp({ onSignUp, onNavigateToSignIn }: SignUpProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("¡Las contraseñas no coinciden!");
      return;
    }
    onSignUp();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-1">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle>Crear Cuenta</CardTitle>
          <CardDescription>
            Regístrate para comenzar a gestionar tu inventario de teléfonos móviles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Crear Cuenta
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={onNavigateToSignIn}
                className="text-primary hover:underline"
              >
                Inicia sesión
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
