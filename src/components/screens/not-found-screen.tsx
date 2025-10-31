"use client";

import { Search, Home, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface NotFoundScreenProps {
  title?: string;
  message?: string;
  onGoHome?: () => void;
  onGoBack?: () => void;
  showHome?: boolean;
  showBack?: boolean;
}

export function NotFoundScreen({
  title = "Página no encontrada",
  message = "Lo sentimos, la página que está buscando no existe o ha sido movida.",
  onGoHome,
  onGoBack,
  showHome = true,
  showBack = true,
}: NotFoundScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div className="rounded-full bg-muted p-4">
              <Search className="w-12 h-12 text-text-secondary" />
            </div>

            {/* 404 Text */}
            <div className="space-y-1">
              <h1 className="text-6xl font-medium text-text-tertiary">404</h1>
            </div>

            {/* Title and Message */}
            <div className="space-y-2">
              <h2 className="text-xl">{title}</h2>
              <p className="text-sm text-text-secondary">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 flex-wrap justify-center">
              {showBack && onGoBack && (
                <Button onClick={onGoBack} variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              )}
              {showHome && onGoHome && (
                <Button onClick={onGoHome} variant="default">
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
