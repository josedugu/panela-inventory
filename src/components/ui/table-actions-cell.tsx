"use client";

import { CircleEllipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TableAction<TData> {
  label: string;
  icon: React.ReactNode;
  onClick: (row: TData) => void;
  disabled?: boolean;
  variant?: "default" | "destructive";
}

interface TableActionsCellProps<TData> {
  row: TData;
  actions: TableAction<TData>[];
  align?: "start" | "center" | "end";
}

export function TableActionsCell<TData>({
  row,
  actions,
  align = "end",
}: TableActionsCellProps<TData>) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={(e) => {
              // Prevenir que el click se propague a la fila
              e.stopPropagation();
            }}
          >
            <CircleEllipsis className="h-4 w-4 text-text-secondary" />
            <span className="sr-only">Abrir menú de acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.label}
              onClick={(e) => {
                // Prevenir que el click se propague a la fila
                e.stopPropagation();
                action.onClick(row);
              }}
              disabled={action.disabled}
              variant={action.variant}
              className="cursor-pointer"
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
