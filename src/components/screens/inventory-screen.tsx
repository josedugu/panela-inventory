"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { StockBadge } from "../inventory/stock-badge";
import { AddProductModal } from "../inventory/add-product-modal";
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";

interface InventoryProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  sku: string;
  category: string;
  storage?: string;
  color?: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  supplier: string;
  status: string;
  lastUpdated: string;
}

const mockProducts: InventoryProduct[] = [
  {
    id: "PRD-001",
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    model: "A2894",
    sku: "IPH-15PM-256-BLK",
    category: "Smartphones",
    storage: "256GB",
    color: "Black Titanium",
    price: 1199,
    cost: 950,
    quantity: 45,
    minStock: 10,
    supplier: "SUP-002",
    status: "In Stock",
    lastUpdated: "2024-01-15",
  },
  {
    id: "PRD-002",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    model: "SM-S928U",
    sku: "SAM-S24U-512-GRY",
    category: "Smartphones",
    storage: "512GB",
    color: "Titanium Gray",
    price: 1299,
    cost: 1050,
    quantity: 32,
    minStock: 10,
    supplier: "SUP-001",
    status: "In Stock",
    lastUpdated: "2024-01-14",
  },
  {
    id: "PRD-003",
    name: "Google Pixel 8 Pro",
    brand: "Google",
    model: "GC3VE",
    sku: "GOO-P8P-256-WHT",
    category: "Smartphones",
    storage: "256GB",
    color: "Porcelain",
    price: 999,
    cost: 780,
    quantity: 8,
    minStock: 10,
    supplier: "SUP-003",
    status: "Low Stock",
    lastUpdated: "2024-01-13",
  },
  {
    id: "PRD-004",
    name: "AirPods Pro 2",
    brand: "Apple",
    model: "MQDN3",
    sku: "APP-PRO2-WHT",
    category: "Accessories",
    color: "White",
    price: 249,
    cost: 180,
    quantity: 124,
    minStock: 20,
    supplier: "SUP-002",
    status: "In Stock",
    lastUpdated: "2024-01-12",
  },
  {
    id: "PRD-005",
    name: "Samsung Galaxy Buds 2",
    brand: "Samsung",
    model: "SM-R177",
    sku: "SAM-GB2-BLK",
    category: "Accessories",
    color: "Graphite",
    price: 149,
    cost: 95,
    quantity: 5,
    minStock: 15,
    supplier: "SUP-001",
    status: "Low Stock",
    lastUpdated: "2024-01-11",
  },
];

export function InventoryScreen() {
  const [products, setProducts] = useState<InventoryProduct[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      categoryFilter === "all" ||
      product.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleAddProduct = (product: any) => {
    setProducts([...products, product]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast.success("Producto eliminado exitosamente");
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Gestión de Inventario</h1>
          <p className="text-text-secondary mt-1">
            Administre su catálogo de productos y niveles de stock
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar por nombre, SKU o marca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            <SelectItem value="smartphones">Smartphones</SelectItem>
            <SelectItem value="accessories">Accesorios</SelectItem>
            <SelectItem value="tablets">Tablets</SelectItem>
            <SelectItem value="wearables">Wearables</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Grid (Excel-like table) with Sticky Header and Footer */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            {/* Sticky Table Container */}
            <div className="overflow-auto max-h-[calc(100vh-420px)]">
              <Table>
                <TableHeader className="sticky top-0 bg-surface-1 dark:bg-surface-1 z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="min-w-[150px]">Nombre Producto</TableHead>
                    <TableHead className="min-w-[100px]">Marca</TableHead>
                    <TableHead className="min-w-[100px]">Modelo</TableHead>
                    <TableHead className="min-w-[140px]">SKU</TableHead>
                    <TableHead className="min-w-[100px]">Categoría</TableHead>
                    <TableHead className="min-w-[80px]">Almacenamiento</TableHead>
                    <TableHead className="min-w-[100px]">Color</TableHead>
                    <TableHead className="min-w-[100px] text-right">Precio</TableHead>
                    <TableHead className="min-w-[100px] text-right">Costo</TableHead>
                    <TableHead className="min-w-[80px] text-right">Cant</TableHead>
                    <TableHead className="min-w-[100px] text-right">Stock Mín</TableHead>
                    <TableHead className="min-w-[100px]">Proveedor</TableHead>
                    <TableHead className="min-w-[100px]">Estado</TableHead>
                    <TableHead className="min-w-[110px]">Última Actualización</TableHead>
                    <TableHead className="min-w-[120px] text-right sticky right-0 bg-surface-1 dark:bg-surface-1">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell className="font-mono text-sm">{product.model}</TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.storage || "-"}</TableCell>
                      <TableCell>{product.color || "-"}</TableCell>
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${product.cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">{product.minStock}</TableCell>
                      <TableCell className="font-mono text-sm">{product.supplier}</TableCell>
                      <TableCell>
                        <StockBadge
                          status={
                            product.quantity === 0
                              ? "out-of-stock"
                              : product.quantity <= product.minStock
                              ? "low-stock"
                              : "in-stock"
                          }
                        />
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">
                        {product.lastUpdated}
                      </TableCell>
                      <TableCell className="sticky right-0 bg-surface-1 dark:bg-surface-1">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
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
                  Mostrando {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} de{" "}
                  {filteredProducts.length} productos
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

      {/* Stats */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Mostrando {filteredProducts.length} de {products.length} productos
        </p>
        <div className="flex gap-4 text-sm">
          <span className="text-text-secondary">
            Total Artículos:{" "}
            <span className="font-medium text-text-primary">
              {products.reduce((sum, p) => sum + p.quantity, 0)}
            </span>
          </span>
          <span className="text-text-secondary">
            Valor Total:{" "}
            <span className="font-medium text-text-primary">
              ${products.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)}
            </span>
          </span>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
      />
    </div>
  );
}
