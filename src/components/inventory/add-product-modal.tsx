"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner@2.0.3";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: any) => void;
}

export function AddProductModal({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    sku: "",
    category: "",
    storage: "",
    color: "",
    price: "",
    cost: "",
    quantity: "",
    minStock: "",
    supplier: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProduct = {
      id: `PRD-${Date.now()}`,
      name: formData.name,
      brand: formData.brand,
      model: formData.model,
      sku: formData.sku,
      category: formData.category,
      storage: formData.storage,
      color: formData.color,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock),
      supplier: formData.supplier,
      description: formData.description,
      status: parseInt(formData.quantity) > parseInt(formData.minStock) ? "En Stock" : "Stock Bajo",
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onAdd(newProduct);
    setFormData({
      name: "",
      brand: "",
      model: "",
      sku: "",
      category: "",
      storage: "",
      color: "",
      price: "",
      cost: "",
      quantity: "",
      minStock: "",
      supplier: "",
      description: "",
    });
    onClose();
    toast.success("Producto agregado exitosamente");
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Producto</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del producto para agregarlo al inventario
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4>Información Básica</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-name">Nombre del Producto *</Label>
                <Input
                  id="product-name"
                  placeholder="ej. iPhone 14 Pro"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  placeholder="ej. Apple"
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  placeholder="ej. A2890"
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  placeholder="ej. IPH14P-256-BLK"
                  value={formData.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smartphones">Smartphones</SelectItem>
                    <SelectItem value="tablets">Tablets</SelectItem>
                    <SelectItem value="accessories">Accesorios</SelectItem>
                    <SelectItem value="cases">Fundas y Protectores</SelectItem>
                    <SelectItem value="chargers">Cargadores</SelectItem>
                    <SelectItem value="headphones">Auriculares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Almacenamiento</Label>
                <Input
                  id="storage"
                  placeholder="ej. 256GB"
                  value={formData.storage}
                  onChange={(e) => handleChange("storage", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  placeholder="ej. Negro Espacial"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="space-y-4">
            <h4>Precio e Inventario</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Precio de Venta *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Precio de Costo *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => handleChange("cost", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Nivel de Stock Mínimo *</Label>
                <Input
                  id="minStock"
                  type="number"
                  placeholder="0"
                  value={formData.minStock}
                  onChange={(e) => handleChange("minStock", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Supplier & Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor</Label>
              <Select value={formData.supplier} onValueChange={(value) => handleChange("supplier", value)}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROV-001">Samsung Electronics</SelectItem>
                  <SelectItem value="PROV-002">Apple Inc.</SelectItem>
                  <SelectItem value="PROV-003">Xiaomi Corporation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Ingrese la descripción del producto..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Agregar Producto</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
