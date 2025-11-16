"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type SignInFormData, signInSchema } from "./sign-in.types";

interface SignInProps {
  onSignIn: (data: SignInFormData) => void | Promise<void>;
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  initialError?: string | null;
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block animate-pulse"
        style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
      >
        .
      </span>
      <span
        className="inline-block animate-pulse"
        style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
      >
        .
      </span>
      <span
        className="inline-block animate-pulse"
        style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
      >
        .
      </span>
    </span>
  );
}

export function SignIn({
  onSignIn,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  initialError,
}: SignInProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(
    initialError ?? null,
  );

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Actualizar error si cambia initialError
  useEffect(() => {
    if (initialError) {
      setServerError(initialError);
    }
  }, [initialError]);

  const handleSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      await onSignIn(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al iniciar sesión. Por favor, intenta de nuevo.";
      setServerError(errorMessage);
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-1">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div
            className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center"
            role="img"
            aria-label="Icono de teléfono móvil"
          >
            <Smartphone
              className="w-6 h-6 text-primary-foreground"
              aria-hidden="true"
            />
          </div>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            ¡Bienvenido! Inicia sesión para acceder a tu sistema de gestión de
            inventario
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
              noValidate
              aria-label="Formulario de inicio de sesión"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@ejemplo.com"
                        autoComplete="email"
                        disabled={isLoading}
                        aria-required="true"
                        aria-invalid={!!form.formState.errors.email}
                        aria-describedby={
                          form.formState.errors.email
                            ? "email-error"
                            : undefined
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage id="email-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <FormLabel htmlFor="password">Contraseña</FormLabel>
                      <button
                        type="button"
                        onClick={onNavigateToForgotPassword}
                        className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-1 -ml-1 self-start sm:self-auto"
                        disabled={isLoading}
                        aria-label="Recuperar contraseña olvidada"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isLoading}
                          className="pr-10"
                          aria-required="true"
                          aria-invalid={!!form.formState.errors.password}
                          aria-describedby={
                            form.formState.errors.password
                              ? "password-error"
                              : undefined
                          }
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm p-1"
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        aria-pressed={showPassword}
                        disabled={isLoading}
                        tabIndex={0}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    <FormMessage id="password-error" />
                  </FormItem>
                )}
              />
              {serverError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="text-sm text-destructive"
                  id="server-error"
                >
                  {serverError}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                aria-busy={isLoading}
                aria-label={isLoading ? "Iniciando sesión" : "Iniciar sesión"}
              >
                {isLoading ? (
                  <>
                    <LoadingDots />
                    <span className="sr-only">
                      Iniciando sesión, por favor espera
                    </span>
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm px-1"
                disabled={isLoading}
                aria-label="Ir a la página de registro"
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
