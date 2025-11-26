"use client";

import type { LucideIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

export interface ViewField {
  key: string;
  label: string;
  value: string | number | null | undefined;
  type?: "text" | "email" | "tel" | "currency";
  icon?: LucideIcon;
  colSpan?: 1 | 2; // Para campos que ocupan toda la fila
}

export interface ViewSection {
  title: string;
  fields: ViewField[];
  customContent?: React.ReactNode; // Para contenido personalizado
  summary?: React.ReactNode; // Para resúmenes o estadísticas
}

export interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  sections: ViewSection[];
  size?: "sm" | "md" | "lg" | "xl" | "6xl" | "full";
  customFooter?: React.ReactNode; // Para contenido adicional al final
  isLoading?: boolean; // Para mostrar skeletons
  errorMessage?: string; // Para mostrar mensaje de error
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "6xl": "max-w-6xl",
  full: "!max-w-[95vw] !w-[95vw] sm:!max-w-[95vw] sm:!w-[95vw]",
};

export function ViewModal({
  isOpen,
  onClose,
  title,
  description,
  sections,
  size = "6xl",
  customFooter,
  isLoading = false,
  errorMessage,
}: ViewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-muted rounded animate-pulse" />
                <div className="h-10 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ) : errorMessage ? (
          <div className="text-center py-8 text-text-secondary">
            {errorMessage}
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {sections.map((section, sectionIndex) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-lg font-semibold">{section.title}</h3>

                {section.fields.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {section.fields.map((field) => (
                      <ViewFieldComponent key={field.key} field={field} />
                    ))}
                  </div>
                )}

                {section.summary}

                {section.customContent}

                {sectionIndex < sections.length - 1 && <Separator />}
              </div>
            ))}

            {customFooter}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ViewFieldComponent({ field }: { field: ViewField }) {
  const Icon = field.icon;
  const colSpanClass = field.colSpan === 2 ? "col-span-2" : "";

  let displayValue = field.value ?? "-";

  // Formatear valores según el tipo
  if (field.type === "currency" && typeof field.value === "number") {
    displayValue = formatPrice(field.value, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  return (
    <div className={`space-y-2 ${colSpanClass}`}>
      <Label htmlFor={`view-${field.key}`}>{field.label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        )}
        <Input
          id={`view-${field.key}`}
          value={displayValue}
          readOnly
          className={`bg-muted ${Icon ? "pl-10" : ""}`}
        />
      </div>
    </div>
  );
}
