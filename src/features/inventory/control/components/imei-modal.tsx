"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/components/ui/use-mobile";
import type { ImeiItem } from "../types";

interface ImeiModalProps {
  isOpen: boolean;
  onClose: () => void;
  imeiItems: ImeiItem[];
  productName: string;
}

export function ImeiModal({
  isOpen,
  onClose,
  imeiItems,
  productName,
}: ImeiModalProps) {
  const isMobile = useIsMobile();

  // Vista desktop - tabla
  if (!isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>IMEIs - {productName}</DialogTitle>
            <DialogDescription>
              Lista de números IMEI disponibles para este producto
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>IMEI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imeiItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-mono">
                      {item.imei || "Sin IMEI"}
                    </TableCell>
                  </TableRow>
                ))}
                {imeiItems.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No hay IMEIs registrados para este producto
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Vista mobile - lista en cards
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">IMEIs</DialogTitle>
          <DialogDescription className="text-sm">
            {productName}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 overflow-y-auto space-y-2">
          {imeiItems.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="font-mono text-sm font-medium">
                    {item.imei || "Sin IMEI"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {imeiItems.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No hay IMEIs registrados para este producto
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
