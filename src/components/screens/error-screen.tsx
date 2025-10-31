"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
}

export function ErrorScreen({
  title = "Algo salió mal",
  message = "Ha ocurrido un error inesperado. Por favor, intente nuevamente.",
  onRetry,
  onGoHome,
  showRetry = true,
  showHome = true,
}: ErrorScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div className="rounded-full bg-error-light p-4">
              <AlertTriangle className="w-12 h-12 text-error" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-xl">{title}</h2>
              <p className="text-sm text-text-secondary">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 flex-wrap justify-center">
              {showRetry && onRetry && (
                <Button onClick={onRetry} variant="default">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              )}
              {showHome && onGoHome && (
                <Button onClick={onGoHome} variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Ir al Inicio
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
