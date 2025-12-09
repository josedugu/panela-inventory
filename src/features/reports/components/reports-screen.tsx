"use client";

import { FileText, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ReportsScreen() {
  const router = useRouter();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes</h1>
        <p className="text-sm text-text-secondary mt-1">
          Visualiza y analiza los reportes del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:bg-surface-2 transition-colors"
          onClick={() => router.push("/dashboard/reports/caja")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Caja</CardTitle>
                <CardDescription>
                  Resumen de ventas y pagos recibidos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Ver Reporte
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-surface-2 transition-colors"
          onClick={() => router.push("/dashboard/reports/productivity")}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Productividad</CardTitle>
                <CardDescription>
                  Utilidad por asesor, semana y mes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Ver Reporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
