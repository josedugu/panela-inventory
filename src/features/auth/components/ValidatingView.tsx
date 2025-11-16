"use client";

import { Smartphone } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ValidatingView() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Smartphone className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle>Validando enlace</CardTitle>
        <CardDescription>
          Estamos verificando tu invitación. Por favor espera un momento…
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
