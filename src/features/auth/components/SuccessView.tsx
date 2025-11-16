"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SuccessViewProps {
  onNavigateToSignIn: () => void;
}

export function SuccessView({ onNavigateToSignIn }: SuccessViewProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-success">
          <CheckCircle2 className="h-6 w-6 text-success-foreground" />
        </div>
        <CardTitle>¡Contraseña Establecida!</CardTitle>
        <CardDescription>
          Tu contraseña ha sido establecida correctamente. Serás redirigido.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onNavigateToSignIn} className="w-full">
          Ir a Iniciar Sesión
        </Button>
      </CardContent>
    </Card>
  );
}
