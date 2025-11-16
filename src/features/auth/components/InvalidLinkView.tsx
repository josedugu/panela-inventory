"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InvalidLinkViewProps {
  onNavigateToSignIn: () => void;
}

export function InvalidLinkView({ onNavigateToSignIn }: InvalidLinkViewProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-destructive">
          <Lock className="h-6 w-6 text-destructive-foreground" />
        </div>
        <CardTitle>Enlace Inválido</CardTitle>
        <CardDescription>
          El enlace no es válido o ha expirado. Por favor, contacta al
          administrador.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onNavigateToSignIn} className="w-full">
          Volver a Iniciar Sesión
        </Button>
      </CardContent>
    </Card>
  );
}
