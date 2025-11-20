"use client";

import { LogOut, ShieldX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // signOut() ya redirige a /sign-in, no necesitamos hacer nada más
    } catch {
      // Si hay error, aún así redirigir a sign-in
      window.location.href = "/sign-in";
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Acceso No Autorizado</CardTitle>
          <CardDescription className="text-base">
            No tienes permisos para acceder a esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Tu cuenta no tiene los permisos necesarios para ver este contenido.
            Si crees que esto es un error, contacta al administrador del
            sistema.
          </p>
          {from && (
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">
                Intentaste acceder a:
              </p>
              <p className="mt-1 font-mono text-sm">{from}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? "Cerrando sesión..." : "Cerrar Sesión"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <UnauthorizedContent />
    </Suspense>
  );
}
