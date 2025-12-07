"use client";

import {
  ChevronDown,
  Download,
  File,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ExportFormat } from "@/hooks/use-export-data";

interface ExportDropdownProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const formatOptions = [
  {
    format: "csv" as const,
    label: "CSV",
    description: "Valores separados por comas",
    icon: FileText,
  },
  {
    format: "xlsx" as const,
    label: "Excel",
    description: "Libro de Excel (.xlsx)",
    icon: FileSpreadsheet,
  },
  {
    format: "pdf" as const,
    label: "PDF",
    description: "Documento PDF",
    icon: File,
  },
];

export function ExportDropdown({
  onExport,
  disabled = false,
  variant = "outline",
  size = "sm",
  className,
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    setIsOpen(false);
    onExport(format);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (disabled) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={toggleDropdown}
        className={className}
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Overlay para cerrar el dropdown al hacer clic fuera */}
          <button
            type="button"
            className="fixed inset-0 z-40 bg-transparent border-none"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.format}
                  type="button"
                  onClick={() => handleExport(option.format)}
                  className="flex w-full items-start gap-3 rounded px-3 py-2 text-left hover:bg-gray-50"
                >
                  <Icon className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {option.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
