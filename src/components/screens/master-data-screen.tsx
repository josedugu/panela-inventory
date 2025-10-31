"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, Search, Pencil, Trash2, Users, Package, Building2, DollarSign, Smartphone, Warehouse } from "lucide-react";
import { toast } from "sonner@2.0.3";

// Suppliers
interface Supplier {
  id: string;
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
}

// Brands
interface Brand {
  id: string;
  nombre: string;
  descripcion: string;
  pais: string;
}

// Models
interface Model {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  anio: string;
}

// Employees
interface Employee {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: string;
  centroCosto: string;
  estado: string;
}

// Cost Centers
interface CostCenter {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  responsable: string;
}

// Warehouses (Bodegas)
interface Warehouse {
  id: string;
  codigo: string;
  nombre: string;
  ubicacion: string;
  capacidad: string;
  responsable: string;
  estado: string;
}

export function MasterDataScreen() {
  const [activeTab, setActiveTab] = useState("proveedores");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Suppliers State
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "PROV-001",
      nombre: "Samsung Electronics",
      contacto: "David Kim",
      email: "david.kim@samsung.com",
      telefono: "+1 (555) 100-2000",
      direccion: "Seúl, Corea del Sur",
    },
    {
      id: "PROV-002",
      nombre: "Apple Inc.",
      contacto: "Sarah Johnson",
      email: "s.johnson@apple.com",
      telefono: "+1 (555) 200-3000",
      direccion: "Cupertino, CA, EE.UU.",
    },
  ]);

  // Brands State
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: "MAR-001",
      nombre: "Samsung",
      descripcion: "Electrónica y tecnología",
      pais: "Corea del Sur",
    },
    {
      id: "MAR-002",
      nombre: "Apple",
      descripcion: "Dispositivos móviles y computadoras",
      pais: "Estados Unidos",
    },
    {
      id: "MAR-003",
      nombre: "Xiaomi",
      descripcion: "Smartphones y accesorios",
      pais: "China",
    },
  ]);

  // Models State
  const [models, setModels] = useState<Model[]>([
    {
      id: "MOD-001",
      nombre: "Galaxy S24 Ultra",
      marca: "Samsung",
      categoria: "Smartphone",
      anio: "2024",
    },
    {
      id: "MOD-002",
      nombre: "iPhone 15 Pro Max",
      marca: "Apple",
      categoria: "Smartphone",
      anio: "2024",
    },
    {
      id: "MOD-003",
      nombre: "Xiaomi 14 Pro",
      marca: "Xiaomi",
      categoria: "Smartphone",
      anio: "2024",
    },
  ]);

  // Employees State
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "EMP-001",
      nombre: "Juan Pérez",
      email: "juan.perez@empresa.com",
      telefono: "+34 600 123 456",
      rol: "Gerente de Inventario",
      centroCosto: "CC-001",
      estado: "Activo",
    },
    {
      id: "EMP-002",
      nombre: "María García",
      email: "maria.garcia@empresa.com",
      telefono: "+34 600 234 567",
      rol: "Supervisor de Almacén",
      centroCosto: "CC-002",
      estado: "Activo",
    },
  ]);

  // Cost Centers State
  const [costCenters, setCostCenters] = useState<CostCenter[]>([
    {
      id: "CC-001",
      codigo: "ADM-001",
      nombre: "Administración",
      descripcion: "Departamento administrativo",
      responsable: "Juan Pérez",
    },
    {
      id: "CC-002",
      codigo: "ALM-001",
      nombre: "Almacén",
      descripcion: "Centro de distribución",
      responsable: "María García",
    },
    {
      id: "CC-003",
      codigo: "VEN-001",
      nombre: "Ventas",
      descripcion: "Departamento de ventas",
      responsable: "Carlos López",
    },
  ]);

  // Warehouses State
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: "BOD-001",
      codigo: "BOD-PRINCIPAL",
      nombre: "Bodega Principal",
      ubicacion: "Zona Industrial Norte",
      capacidad: "5000 m²",
      responsable: "María García",
      estado: "Activa",
    },
    {
      id: "BOD-002",
      codigo: "BOD-SUR",
      nombre: "Bodega Sur",
      ubicacion: "Zona Industrial Sur",
      capacidad: "3000 m²",
      responsable: "Carlos López",
      estado: "Activa",
    },
    {
      id: "BOD-003",
      codigo: "BOD-CENTRO",
      nombre: "Bodega Centro",
      ubicacion: "Centro Comercial",
      capacidad: "1500 m²",
      responsable: "Ana Martínez",
      estado: "Activa",
    },
  ]);

  // Suppliers CRUD
  const SuppliersTab = () => {
    const [formData, setFormData] = useState({
      nombre: "",
      contacto: "",
      email: "",
      telefono: "",
      direccion: "",
    });

    const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      const newSupplier: Supplier = {
        id: `PROV-${String(suppliers.length + 1).padStart(3, "0")}`,
        ...formData,
      };
      setSuppliers([...suppliers, newSupplier]);
      setFormData({ nombre: "", contacto: "", email: "", telefono: "", direccion: "" });
      setIsAddDialogOpen(false);
      toast.success("Proveedor agregado exitosamente");
    };

    const handleDelete = (id: string) => {
      setSuppliers(suppliers.filter((s) => s.id !== id));
      toast.success("Proveedor eliminado exitosamente");
    };

    const filtered = suppliers.filter((s) =>
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contacto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Proveedores</CardTitle>
              <CardDescription>{suppliers.length} proveedores registrados</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Proveedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nuevo Proveedor</DialogTitle>
                  <DialogDescription>Ingrese los datos del proveedor</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre del Proveedor *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contacto">Persona de Contacto *</Label>
                      <Input
                        id="contacto"
                        value={formData.contacto}
                        onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono *</Label>
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Textarea
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Agregar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-mono">{supplier.id}</TableCell>
                    <TableCell>{supplier.nombre}</TableCell>
                    <TableCell>{supplier.contacto}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.telefono}</TableCell>
                    <TableCell>{supplier.direccion}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(supplier.id)}
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
        </CardContent>
      </Card>
    );
  };

  // Brands Tab Component
  const BrandsTab = () => {
    const [formData, setFormData] = useState({
      nombre: "",
      descripcion: "",
      pais: "",
    });

    const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      const newBrand: Brand = {
        id: `MAR-${String(brands.length + 1).padStart(3, "0")}`,
        ...formData,
      };
      setBrands([...brands, newBrand]);
      setFormData({ nombre: "", descripcion: "", pais: "" });
      setIsAddDialogOpen(false);
      toast.success("Marca agregada exitosamente");
    };

    const handleDelete = (id: string) => {
      setBrands(brands.filter((b) => b.id !== id));
      toast.success("Marca eliminada exitosamente");
    };

    const filtered = brands.filter((b) =>
      b.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Marcas</CardTitle>
              <CardDescription>{brands.length} marcas registradas</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Marca
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Marca</DialogTitle>
                  <DialogDescription>Ingrese los datos de la marca</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre de la Marca *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pais">País de Origen</Label>
                    <Input
                      id="pais"
                      value={formData.pais}
                      onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Agregar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-mono">{brand.id}</TableCell>
                    <TableCell>{brand.nombre}</TableCell>
                    <TableCell>{brand.pais}</TableCell>
                    <TableCell>{brand.descripcion}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(brand.id)}
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
        </CardContent>
      </Card>
    );
  };

  // Models Tab (similar pattern)
  const ModelsTab = () => {
    const [formData, setFormData] = useState({
      nombre: "",
      marca: "",
      categoria: "",
      anio: "",
    });

    const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      const newModel: Model = {
        id: `MOD-${String(models.length + 1).padStart(3, "0")}`,
        ...formData,
      };
      setModels([...models, newModel]);
      setFormData({ nombre: "", marca: "", categoria: "", anio: "" });
      setIsAddDialogOpen(false);
      toast.success("Modelo agregado exitosamente");
    };

    const handleDelete = (id: string) => {
      setModels(models.filter((m) => m.id !== id));
      toast.success("Modelo eliminado exitosamente");
    };

    const filtered = models.filter((m) =>
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.marca.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Modelos</CardTitle>
              <CardDescription>{models.length} modelos registrados</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Modelo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Modelo</DialogTitle>
                  <DialogDescription>Ingrese los datos del modelo</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre del Modelo *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marca">Marca *</Label>
                      <Select value={formData.marca} onValueChange={(value) => setFormData({ ...formData, marca: value })}>
                        <SelectTrigger id="marca">
                          <SelectValue placeholder="Seleccionar marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.nombre}>
                              {brand.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoría *</Label>
                      <Input
                        id="categoria"
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="anio">Año</Label>
                      <Input
                        id="anio"
                        value={formData.anio}
                        onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Agregar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-mono">{model.id}</TableCell>
                    <TableCell>{model.nombre}</TableCell>
                    <TableCell>{model.marca}</TableCell>
                    <TableCell>{model.categoria}</TableCell>
                    <TableCell>{model.anio}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(model.id)}
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
        </CardContent>
      </Card>
    );
  };

  // Employees Tab
  const EmployeesTab = () => {
    const [formData, setFormData] = useState({
      nombre: "",
      email: "",
      telefono: "",
      rol: "",
      centroCosto: "",
    });

    const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      const newEmployee: Employee = {
        id: `EMP-${String(employees.length + 1).padStart(3, "0")}`,
        ...formData,
        estado: "Activo",
      };
      setEmployees([...employees, newEmployee]);
      setFormData({ nombre: "", email: "", telefono: "", rol: "", centroCosto: "" });
      setIsAddDialogOpen(false);
      toast.success("Empleado agregado exitosamente");
    };

    const handleDelete = (id: string) => {
      setEmployees(employees.filter((e) => e.id !== id));
      toast.success("Empleado eliminado exitosamente");
    };

    const filtered = employees.filter((e) =>
      e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Empleados</CardTitle>
              <CardDescription>{employees.length} empleados registrados</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Empleado
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nuevo Empleado</DialogTitle>
                  <DialogDescription>Ingrese los datos del empleado</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono *</Label>
                      <Input
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rol">Rol *</Label>
                      <Input
                        id="rol"
                        value={formData.rol}
                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="centroCosto">Centro de Costo</Label>
                      <Select value={formData.centroCosto} onValueChange={(value) => setFormData({ ...formData, centroCosto: value })}>
                        <SelectTrigger id="centroCosto">
                          <SelectValue placeholder="Seleccionar centro de costo" />
                        </SelectTrigger>
                        <SelectContent>
                          {costCenters.map((cc) => (
                            <SelectItem key={cc.id} value={cc.id}>
                              {cc.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Agregar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Centro de Costo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-mono">{employee.id}</TableCell>
                    <TableCell>{employee.nombre}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.telefono}</TableCell>
                    <TableCell>{employee.rol}</TableCell>
                    <TableCell>{employee.centroCosto}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success-light text-success-foreground">
                        {employee.estado}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(employee.id)}
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
        </CardContent>
      </Card>
    );
  };

  // Cost Centers Tab
  const CostCentersTab = () => {
    const [formData, setFormData] = useState({
      codigo: "",
      nombre: "",
      descripcion: "",
      responsable: "",
    });

    const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      const newCostCenter: CostCenter = {
        id: `CC-${String(costCenters.length + 1).padStart(3, "0")}`,
        ...formData,
      };
      setCostCenters([...costCenters, newCostCenter]);
      setFormData({ codigo: "", nombre: "", descripcion: "", responsable: "" });
      setIsAddDialogOpen(false);
      toast.success("Centro de costo agregado exitosamente");
    };

    const handleDelete = (id: string) => {
      setCostCenters(costCenters.filter((cc) => cc.id !== id));
      toast.success("Centro de costo eliminado exitosamente");
    };

    const filtered = costCenters.filter((cc) =>
      cc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cc.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Centros de Costo</CardTitle>
              <CardDescription>{costCenters.length} centros de costo registrados</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Centro de Costo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Centro de Costo</DialogTitle>
                  <DialogDescription>Ingrese los datos del centro de costo</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="codigo">Código *</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="responsable">Responsable</Label>
                      <Input
                        id="responsable"
                        value={formData.responsable}
                        onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Agregar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cc) => (
                  <TableRow key={cc.id}>
                    <TableCell className="font-mono">{cc.id}</TableCell>
                    <TableCell className="font-mono">{cc.codigo}</TableCell>
                    <TableCell>{cc.nombre}</TableCell>
                    <TableCell>{cc.descripcion}</TableCell>
                    <TableCell>{cc.responsable}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cc.id)}
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
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1>Datos Maestros</h1>
        <p className="text-text-secondary mt-1">
          Gestione proveedores, marcas, modelos, empleados, centros de costo y bodegas
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="proveedores" className="gap-2">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Proveedores</span>
          </TabsTrigger>
          <TabsTrigger value="marcas" className="gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Marcas</span>
          </TabsTrigger>
          <TabsTrigger value="modelos" className="gap-2">
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Modelos</span>
          </TabsTrigger>
          <TabsTrigger value="empleados" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Empleados</span>
          </TabsTrigger>
          <TabsTrigger value="centros-costo" className="gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Centros de Costo</span>
          </TabsTrigger>
          <TabsTrigger value="bodegas" className="gap-2">
            <Warehouse className="w-4 h-4" />
            <span className="hidden sm:inline">Bodegas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proveedores">
          <SuppliersTab />
        </TabsContent>

        <TabsContent value="marcas">
          <BrandsTab />
        </TabsContent>

        <TabsContent value="modelos">
          <ModelsTab />
        </TabsContent>

        <TabsContent value="empleados">
          <EmployeesTab />
        </TabsContent>

        <TabsContent value="centros-costo">
          <CostCentersTab />
        </TabsContent>

        <TabsContent value="bodegas">
          <WarehousesTab />
        </TabsContent>
      </Tabs>
    </div>
  );

  // Warehouses Tab Component
  function WarehousesTab() {
    const [formData, setFormData] = useState({
      codigo: "",
      nombre: "",
      ubicacion: "",
      capacidad: "",
      responsable: "",
    });

    const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      const newWarehouse: Warehouse = {
        id: `BOD-${String(warehouses.length + 1).padStart(3, "0")}`,
        ...formData,
        estado: "Activa",
      };
      setWarehouses([...warehouses, newWarehouse]);
      setFormData({ codigo: "", nombre: "", ubicacion: "", capacidad: "", responsable: "" });
      setIsAddDialogOpen(false);
      toast.success("Bodega agregada exitosamente");
    };

    const handleDelete = (id: string) => {
      setWarehouses(warehouses.filter((w) => w.id !== id));
      toast.success("Bodega eliminada exitosamente");
    };

    const filtered = warehouses.filter((w) =>
      w.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Bodegas</CardTitle>
              <CardDescription>{warehouses.length} bodegas registradas</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Bodega
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nueva Bodega</DialogTitle>
                  <DialogDescription>Ingrese los datos de la bodega</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="codigo">Código *</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        placeholder="ej. BOD-NORTE"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="ej. Bodega Norte"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ubicacion">Ubicación *</Label>
                      <Input
                        id="ubicacion"
                        value={formData.ubicacion}
                        onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                        placeholder="ej. Zona Industrial"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacidad">Capacidad</Label>
                      <Input
                        id="capacidad"
                        value={formData.capacidad}
                        onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                        placeholder="ej. 3000 m²"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="responsable">Responsable</Label>
                      <Input
                        id="responsable"
                        value={formData.responsable}
                        onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                        placeholder="Nombre del responsable"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Agregar</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Capacidad</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-mono">{warehouse.id}</TableCell>
                    <TableCell className="font-mono">{warehouse.codigo}</TableCell>
                    <TableCell>{warehouse.nombre}</TableCell>
                    <TableCell>{warehouse.ubicacion}</TableCell>
                    <TableCell>{warehouse.capacidad}</TableCell>
                    <TableCell>{warehouse.responsable}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-success-light text-success-foreground">
                        {warehouse.estado}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(warehouse.id)}
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
        </CardContent>
      </Card>
    );
  }
}
