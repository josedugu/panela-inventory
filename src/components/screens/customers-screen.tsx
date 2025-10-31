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
import { DataTable } from "../ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Customer {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  pais: string;
  tipo: "Regular" | "VIP" | "Mayorista";
  estado: "Activo" | "Inactivo";
  fechaRegistro: string;
  totalCompras: number;
  ultimaCompra: string;
}

const mockCustomers: Customer[] = [
  {
    id: "CUST-001",
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@email.com",
    telefono: "+1 (555) 123-4567",
    direccion: "Calle Principal 123",
    ciudad: "Madrid",
    pais: "España",
    tipo: "VIP",
    estado: "Activo",
    fechaRegistro: "2023-01-15",
    totalCompras: 15240.50,
    ultimaCompra: "2024-10-15",
  },
  {
    id: "CUST-002",
    nombre: "María",
    apellido: "García",
    email: "maria.garcia@email.com",
    telefono: "+1 (555) 234-5678",
    direccion: "Avenida Central 456",
    ciudad: "Barcelona",
    pais: "España",
    tipo: "Regular",
    estado: "Activo",
    fechaRegistro: "2023-03-20",
    totalCompras: 5890.00,
    ultimaCompra: "2024-10-18",
  },
  {
    id: "CUST-003",
    nombre: "Carlos",
    apellido: "López",
    email: "carlos.lopez@email.com",
    telefono: "+1 (555) 345-6789",
    direccion: "Boulevard Norte 789",
    ciudad: "Valencia",
    pais: "España",
    tipo: "Mayorista",
    estado: "Activo",
    fechaRegistro: "2022-11-10",
    totalCompras: 28500.00,
    ultimaCompra: "2024-10-20",
  },
  {
    id: "CUST-004",
    nombre: "Ana",
    apellido: "Martínez",
    email: "ana.martinez@email.com",
    telefono: "+1 (555) 456-7890",
    direccion: "Plaza Mayor 321",
    ciudad: "Sevilla",
    pais: "España",
    tipo: "Regular",
    estado: "Activo",
    fechaRegistro: "2023-06-05",
    totalCompras: 3200.00,
    ultimaCompra: "2024-09-30",
  },
  {
    id: "CUST-005",
    nombre: "Diego",
    apellido: "Rodríguez",
    email: "diego.rodriguez@email.com",
    telefono: "+1 (555) 567-8901",
    direccion: "Paseo del Mar 654",
    ciudad: "Málaga",
    pais: "España",
    tipo: "VIP",
    estado: "Inactivo",
    fechaRegistro: "2022-08-12",
    totalCompras: 12800.00,
    ultimaCompra: "2024-05-10",
  },
];

export function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.apellido.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.telefono.includes(searchQuery) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || customer.tipo === typeFilter;
    const matchesStatus = statusFilter === "all" || customer.estado === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddCustomer = () => {
    const newCustomer: Customer = {
      id: `CUST-${(customers.length + 1).toString().padStart(3, "0")}`,
      nombre: formData.nombre || "",
      apellido: formData.apellido || "",
      email: formData.email || "",
      telefono: formData.telefono || "",
      direccion: formData.direccion || "",
      ciudad: formData.ciudad || "",
      pais: formData.pais || "",
      tipo: (formData.tipo as Customer["tipo"]) || "Regular",
      estado: "Activo",
      fechaRegistro: new Date().toISOString().split("T")[0],
      totalCompras: 0,
      ultimaCompra: "-",
    };

    setCustomers([...customers, newCustomer]);
    setIsAddModalOpen(false);
    setFormData({});
    toast.success("Cliente agregado exitosamente");
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer) return;

    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, ...formData } : c
      )
    );
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
    setFormData({});
    toast.success("Cliente actualizado exitosamente");
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
    toast.success("Cliente eliminado exitosamente");
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setIsEditModalOpen(true);
  };

  const getTypeBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "VIP":
        return "default";
      case "Mayorista":
        return "secondary";
      case "Regular":
        return "outline";
      default:
        return "outline";
    }
  };

  const columns = [
    {
      header: "ID",
      accessor: "id" as keyof Customer,
      headerClassName: "min-w-[100px]",
      className: "font-mono text-sm",
    },
    {
      header: "Nombre Completo",
      accessor: (row: Customer) => `${row.nombre} ${row.apellido}`,
      headerClassName: "min-w-[180px]",
      className: "font-medium",
    },
    {
      header: "Email",
      accessor: (row: Customer) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-text-secondary" />
          <span>{row.email}</span>
        </div>
      ),
      headerClassName: "min-w-[220px]",
    },
    {
      header: "Teléfono",
      accessor: (row: Customer) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-text-secondary" />
          <span>{row.telefono}</span>
        </div>
      ),
      headerClassName: "min-w-[160px]",
    },
    {
      header: "Ubicación",
      accessor: (row: Customer) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-text-secondary" />
          <span>{row.ciudad}, {row.pais}</span>
        </div>
      ),
      headerClassName: "min-w-[200px]",
    },
    {
      header: "Tipo",
      accessor: (row: Customer) => (
        <Badge variant={getTypeBadgeVariant(row.tipo)}>{row.tipo}</Badge>
      ),
      headerClassName: "min-w-[110px]",
    },
    {
      header: "Estado",
      accessor: (row: Customer) => (
        <Badge variant={row.estado === "Activo" ? "default" : "secondary"}>
          {row.estado}
        </Badge>
      ),
      headerClassName: "min-w-[100px]",
    },
    {
      header: "Total Compras",
      accessor: (row: Customer) => `$${row.totalCompras.toFixed(2)}`,
      headerClassName: "min-w-[140px] text-right",
      className: "text-right font-medium",
    },
    {
      header: "Última Compra",
      accessor: (row: Customer) => (
        <span className="text-sm text-text-secondary">
          {row.ultimaCompra !== "-"
            ? new Date(row.ultimaCompra).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "-"}
        </span>
      ),
      headerClassName: "min-w-[140px]",
    },
    {
      header: "Acciones",
      accessor: (row: Customer) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(row)}
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteCustomer(row.id)}
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4 text-error" />
          </Button>
        </div>
      ),
      headerClassName: "min-w-[120px] text-right",
      sticky: true,
    },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Gestión de Clientes</h1>
          <p className="text-text-secondary mt-1">
            Administre la base de datos de clientes y su información
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
            Agregar Cliente
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Buscar por nombre, email, teléfono o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Tipos</SelectItem>
            <SelectItem value="Regular">Regular</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
            <SelectItem value="Mayorista">Mayorista</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Estados</SelectItem>
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Inactivo">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customers Table */}
      <DataTable
        data={filteredCustomers}
        columns={columns}
        keyExtractor={(row) => row.id}
      />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 rounded-lg border border-border bg-card">
          <p className="text-sm text-text-secondary">Total Clientes</p>
          <p className="text-2xl font-medium mt-2">{customers.length}</p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-card">
          <p className="text-sm text-text-secondary">Clientes Activos</p>
          <p className="text-2xl font-medium mt-2">
            {customers.filter((c) => c.estado === "Activo").length}
          </p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-card">
          <p className="text-sm text-text-secondary">Clientes VIP</p>
          <p className="text-2xl font-medium mt-2">
            {customers.filter((c) => c.tipo === "VIP").length}
          </p>
        </div>
        <div className="p-6 rounded-lg border border-border bg-card">
          <p className="text-sm text-text-secondary">Total Ventas</p>
          <p className="text-2xl font-medium mt-2">
            ${customers.reduce((sum, c) => sum + c.totalCompras, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Complete los datos del cliente para agregarlo al sistema
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={formData.apellido || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, apellido: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={formData.telefono || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion || ""}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={formData.ciudad || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ciudad: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  value={formData.pais || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, pais: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Cliente</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo: value as Customer["tipo"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Mayorista">Mayorista</SelectItem>
                </SelectContent>
              </Select>
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
            <Button onClick={handleAddCustomer}>Agregar Cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifique los datos del cliente
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre *</Label>
                <Input
                  id="edit-nombre"
                  value={formData.nombre || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-apellido">Apellido *</Label>
                <Input
                  id="edit-apellido"
                  value={formData.apellido || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, apellido: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-telefono">Teléfono *</Label>
                <Input
                  id="edit-telefono"
                  value={formData.telefono || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-direccion">Dirección</Label>
              <Input
                id="edit-direccion"
                value={formData.direccion || ""}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ciudad">Ciudad</Label>
                <Input
                  id="edit-ciudad"
                  value={formData.ciudad || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ciudad: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pais">País</Label>
                <Input
                  id="edit-pais"
                  value={formData.pais || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, pais: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo de Cliente</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipo: value as Customer["tipo"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Mayorista">Mayorista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      estado: value as Customer["estado"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedCustomer(null);
                setFormData({});
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleEditCustomer}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
