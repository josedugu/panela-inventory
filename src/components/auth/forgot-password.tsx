"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Smartphone, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ForgotPasswordProps {
  onNavigateToSignIn: () => void;
}

export function ForgotPassword({ onNavigateToSignIn }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-1">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto w-12 h-12 bg-success rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success-foreground" />
            </div>
            <CardTitle>Revisa tu Correo</CardTitle>
            <CardDescription>
              Hemos enviado las instrucciones para restablecer tu contraseña a <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onNavigateToSignIn} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Iniciar Sesión
            </Button>
            <p className="mt-4 text-center text-sm text-text-secondary">
              ¿No recibiste el correo? Revisa tu carpeta de spam o{" "}
              <button
                onClick={() => setSubmitted(false)}
                className="text-primary hover:underline"
              >
                intenta de nuevo
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-1">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle>Restablecer Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
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
            <Button type="submit" className="w-full">
              Enviar Instrucciones
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={onNavigateToSignIn}
              className="text-sm text-primary hover:underline inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver a Iniciar Sesión
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
