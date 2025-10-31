"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Search, Filter, Download, Eye, Trash2, ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface Sale {
  id: string;
  numeroVenta: string;
  modelo: string;
  marca: string;
  tipo: "Smartphone" | "Tablet" | "Accesorio";
  pdv: number;
  fecha: string;
  usuario: string;
}

const mockSales: Sale[] = [
  {
    id: "1",
    numeroVenta: "VTA-2024-001",
    modelo: "iPhone 15 Pro Max",
    marca: "Apple",
    tipo: "Smartphone",
    pdv: 1199.99,
    fecha: "2024-01-20T14:30:00",
    usuario: "Juan Pérez",
  },
  {
    id: "2",
    numeroVenta: "VTA-2024-002",
    modelo: "Galaxy S24 Ultra",
    marca: "Samsung",
    tipo: "Smartphone",
    pdv: 1299.99,
    fecha: "2024-01-20T10:15:00",
    usuario: "María García",
  },
  {
    id: "3",
    numeroVenta: "VTA-2024-003",
    modelo: "iPad Pro 12.9",
    marca: "Apple",
    tipo: "Tablet",
    pdv: 1099.00,
    fecha: "2024-01-19T16:45:00",
    usuario: "Juan Pérez",
  },
  {
    id: "4",
    numeroVenta: "VTA-2024-004",
    modelo: "AirPods Pro 2",
    marca: "Apple",
    tipo: "Accesorio",
    pdv: 249.99,
    fecha: "2024-01-19T09:20:00",
    usuario: "Carlos López",
  },
  {
    id: "5",
    numeroVenta: "VTA-2024-005",
    modelo: "Galaxy Tab S9",
    marca: "Samsung",
    tipo: "Tablet",
    pdv: 799.99,
    fecha: "2024-01-18T11:30:00",
    usuario: "María García",
  },
  {
    id: "6",
    numeroVenta: "VTA-2024-006",
    modelo: "Xiaomi 14 Pro",
    marca: "Xiaomi",
    tipo: "Smartphone",
    pdv: 899.99,
    fecha: "2024-01-18T15:10:00",
    usuario: "Juan Pérez",
  },
  {
    id: "7",
    numeroVenta: "VTA-2024-007",
    modelo: "Galaxy Buds 2 Pro",
    marca: "Samsung",
    tipo: "Accesorio",
    pdv: 229.99,
    fecha: "2024-01-17T13:25:00",
    usuario: "Carlos López",
  },
  {
    id: "8",
    numeroVenta: "VTA-2024-008",
    modelo: "Pixel 8 Pro",
    marca: "Google",
    tipo: "Smartphone",
    pdv: 999.00,
    fecha: "2024-01-17T08:40:00",
    usuario: "María García",
  },
];

export function SalesScreen() {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Sale>>({});
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.numeroVenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.usuario.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || sale.tipo === typeFilter;

    // Date filter logic
    let matchesDate = true;
    if (dateStart || dateEnd) {
      const saleDate = new Date(sale.fecha);
      if (dateStart) {
        try {
          const startDate = new Date(dateStart);
          if (!isNaN(startDate.getTime())) {
            matchesDate = matchesDate && saleDate >= startDate;
          }
        } catch (e) {
          // Invalid date, ignore filter
        }
      }
      if (dateEnd) {
        try {
          const endDate = new Date(dateEnd);
          if (!isNaN(endDate.getTime())) {
            matchesDate = matchesDate && saleDate <= endDate;
          }
        } catch (e) {
          // Invalid date, ignore filter
        }
      }
    }

    return matchesSearch && matchesType && matchesDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSales = filteredSales.slice(startIndex, endIndex);

  const handleAddSale = () => {
    const newSale: Sale = {
      id: (sales.length + 1).toString(),
      numeroVenta: `VTA-2024-${(sales.length + 1).toString().padStart(3, "0")}`,
      modelo: formData.modelo || "",
      marca: formData.marca || "",
      tipo: (formData.tipo as Sale["tipo"]) || "Smartphone",
      pdv: formData.pdv || 0,
      fecha: new Date().toISOString(),
      usuario: "Usuario Actual",
    };

    setSales([newSale, ...sales]);
    setIsAddModalOpen(false);
    setFormData({});
    toast.success("Venta registrada exitosamente");
  };

  const getTypeBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "Smartphone":
        return "default";
      case "Tablet":
        return "secondary";
      case "Accesorio":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1>Ventas</h1>
          <p className="text-text-secondary mt-1">
            Historial completo de ventas de inventario
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Filters - Compact inline layout */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar por número, modelo, marca o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Tipos</SelectItem>
            <SelectItem value="Smartphone">Smartphone</SelectItem>
            <SelectItem value="Tablet">Tablet</SelectItem>
            <SelectItem value="Accesorio">Accesorio</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Start */}
        <Input
          placeholder="Inicio: YYYY-MM-DD HH:MM"
          value={dateStart}
          onChange={(e) => setDateStart(e.target.value)}
          className="w-full sm:w-[200px]"
        />

        {/* Date End */}
        <Input
          placeholder="Fin: YYYY-MM-DD HH:MM"
          value={dateEnd}
          onChange={(e) => setDateEnd(e.target.value)}
          className="w-full sm:w-[200px]"
        />

        {/* Clear dates button */}
        {(dateStart || dateEnd) && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setDateStart("");
              setDateEnd("");
            }}
            title="Limpiar fechas"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Sales Table with Sticky Header and Footer */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            {/* Sticky Table Container */}
            <div className="overflow-auto max-h-[calc(100vh-400px)]">
              <Table>
                <TableHeader className="sticky top-0 bg-surface-1 dark:bg-surface-1 z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="min-w-[140px]">N° Venta</TableHead>
                    <TableHead className="min-w-[180px]">Modelo</TableHead>
                    <TableHead className="min-w-[120px]">Marca</TableHead>
                    <TableHead className="min-w-[120px]">Tipo</TableHead>
                    <TableHead className="min-w-[120px] text-right">PDV</TableHead>
                    <TableHead className="min-w-[160px]">Fecha y Hora</TableHead>
                    <TableHead className="min-w-[140px]">Usuario</TableHead>
                    <TableHead className="min-w-[120px] text-right sticky right-0 bg-surface-1 dark:bg-surface-1">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono">{sale.numeroVenta}</TableCell>
                      <TableCell className="font-medium">{sale.modelo}</TableCell>
                      <TableCell>{sale.marca}</TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(sale.tipo)}>{sale.tipo}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${sale.pdv.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">
                        {new Date(sale.fecha).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        {new Date(sale.fecha).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{sale.usuario}</TableCell>
                      <TableCell className="sticky right-0 bg-surface-1 dark:bg-surface-1">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" title="Ver detalles">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Eliminar">
                            <Trash2 className="w-4 h-4 text-error" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Sticky Footer with Pagination */}
            <div className="sticky bottom-0 bg-surface-1 dark:bg-surface-1 border-t border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <span>
                  Mostrando {startIndex + 1} - {Math.min(endIndex, filteredSales.length)} de{" "}
                  {filteredSales.length} ventas
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Items per page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-secondary">Mostrar:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-1 px-2">
                    <span className="text-sm font-medium">{currentPage}</span>
                    <span className="text-sm text-text-secondary">de {totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">Total Ventas</p>
              <p className="text-2xl font-medium">{sales.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">Valor Total</p>
              <p className="text-2xl font-medium">
                ${sales.reduce((sum, t) => sum + t.pdv, 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">Smartphones</p>
              <p className="text-2xl font-medium">
                {sales.filter((t) => t.tipo === "Smartphone").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-text-secondary">Promedio PDV</p>
              <p className="text-2xl font-medium">
                ${(sales.reduce((sum, t) => sum + t.pdv, 0) / sales.length).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Sale Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Nueva Venta</DialogTitle>
            <DialogDescription>
              Complete los datos de la venta para registrarla en el sistema
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                placeholder="Ej: iPhone 15 Pro Max"
                value={formData.modelo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, modelo: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                placeholder="Ej: Apple"
                value={formData.marca || ""}
                onChange={(e) =>
                  setFormData({ ...formData, marca: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Producto *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value as Sale["tipo"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Smartphone">Smartphone</SelectItem>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Accesorio">Accesorio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdv">Precio de Venta (PDV) *</Label>
              <Input
                id="pdv"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.pdv || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pdv: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setFormData({});
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddSale}>Registrar Venta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
