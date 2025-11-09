"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EntityTableLayout } from "@/features/entity-table/components/entity-table-layout";
import { useEntityFilters } from "@/features/entity-table/hooks/use-entity-filters";
import type { EntityFilterDescriptor } from "@/features/entity-table/types";
import {
  type CustomerDTO,
  createCustomerAction,
  deleteCustomerAction,
  type GetCustomersSuccess,
  getCustomersAction,
  updateCustomerAction,
} from "../actions";
import { ViewCustomerModal } from "./view-customer-modal";

type Customer = CustomerDTO;

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
});

interface CustomerFormState {
  nombre: string;
  email: string;
  telefono: string;
  whatsapp: string;
  direccion: string;
}

const createEmptyFormState = (): CustomerFormState => ({
  nombre: "",
  email: "",
  telefono: "",
  whatsapp: "",
  direccion: "",
});

export function Customers() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerFormState>(
    createEmptyFormState(),
  );
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");

  const filterDescriptors = useMemo<EntityFilterDescriptor[]>(() => [], []);

  const {
    filterState,
    setFilterState,
    pendingFilterState,
    setPendingFilterState,
    applyFilters,
    resetPendingFilters,
    clearFilters,
    filtersKey,
    isDialogOpen,
    setDialogOpen,
    normalizedOptions,
  } = useEntityFilters({
    filters: filterDescriptors,
  });

  const { data, isLoading, isFetching, refetch } =
    useQuery<GetCustomersSuccess>({
      queryKey: ["customers", page, pageSize, filtersKey],
      queryFn: async () => {
        const result = await getCustomersAction({
          page,
          pageSize,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        return result;
      },
      placeholderData: (previous) => previous,
      refetchInterval: 30000,
    });

  const allCustomers = data?.data ?? [];

  // Filtrar en el frontend con la información ya obtenida
  const filteredCustomers = useMemo(() => {
    if (!searchValue.trim()) {
      return allCustomers;
    }

    const searchTerm = searchValue.toLowerCase();
    return allCustomers.filter((customer) => {
      const searchableFields = [
        customer.nombre,
        customer.email,
        customer.telefono,
        customer.whatsapp,
      ]
        .filter(Boolean)
        .map((value) => value?.toLowerCase() ?? "");

      return searchableFields.some((value) => value.includes(searchTerm));
    });
  }, [allCustomers, searchValue]);

  // Paginar los resultados filtrados
  const customers = useMemo(() => {
    const offset = (page - 1) * pageSize;
    return filteredCustomers.slice(offset, offset + pageSize);
  }, [filteredCustomers, page, pageSize]);

  const total = filteredCustomers.length;

  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.nombre}</div>
        ),
        size: 200,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="text-sm text-text-secondary">
            {row.original.email}
          </div>
        ),
        size: 240,
      },
      {
        accessorKey: "telefono",
        header: "Teléfono",
        cell: ({ row }) => (
          <div className="text-sm">{row.original.telefono ?? "-"}</div>
        ),
        size: 150,
      },
      {
        accessorKey: "whatsapp",
        header: "WhatsApp",
        cell: ({ row }) => (
          <div className="text-sm">{row.original.whatsapp ?? "-"}</div>
        ),
        size: 150,
      },
      {
        accessorKey: "totalVentas",
        header: "Total Ventas",
        cell: ({ row }) => (
          <div className="text-center font-medium">
            {currencyFormatter.format(row.original.totalVentas)}
          </div>
        ),
        size: 150,
      },
    ],
    [],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const normalizedPage = Math.max(1, nextPage);
      if (normalizedPage !== page) {
        setPage(normalizedPage);
        queueMicrotask(() => {
          void refetch();
        });
      }
    },
    [refetch, page],
  );

  const handlePageSizeChange = useCallback(
    (nextPageSize: number) => {
      setPageSize(nextPageSize);
      setPage(1);
      queueMicrotask(() => {
        void refetch();
      });
    },
    [refetch],
  );

  const openCreateDialog = () => {
    setFormData(createEmptyFormState());
    setIsCreateModalOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setFormData({
      nombre: customer.nombre,
      email: customer.email,
      telefono: customer.telefono ?? "",
      whatsapp: customer.whatsapp ?? "",
      direccion: "",
    });
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (customer: Customer) => {
    setDeleteTarget(customer);
    setIsDeleteModalOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateModalOpen(false);
    setFormData(createEmptyFormState());
  };

  const closeEditDialog = () => {
    setIsEditModalOpen(false);
    setEditingCustomer(null);
    setFormData(createEmptyFormState());
  };

  const closeDeleteDialog = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleFormChange = (field: keyof CustomerFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const formDataObj = new FormData();
    formDataObj.append("nombre", formData.nombre.trim());
    formDataObj.append("email", formData.email.trim());
    if (formData.telefono.trim()) {
      formDataObj.append("telefono", formData.telefono.trim());
    }
    if (formData.whatsapp.trim()) {
      formDataObj.append("whatsapp", formData.whatsapp.trim());
    }
    if (formData.direccion.trim()) {
      formDataObj.append("direccion", formData.direccion.trim());
    }

    startSubmitTransition(async () => {
      const result = await createCustomerAction(formDataObj);
      if (result.success) {
        toast.success("Cliente creado exitosamente");
        closeCreateDialog();
        void refetch();
      } else {
        toast.error(result.error ?? "Error al crear el cliente");
      }
    });
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || !editingCustomer) return;

    const formDataObj = new FormData();
    formDataObj.append("nombre", formData.nombre.trim());
    formDataObj.append("email", formData.email.trim());
    if (formData.telefono.trim()) {
      formDataObj.append("telefono", formData.telefono.trim());
    }
    if (formData.whatsapp.trim()) {
      formDataObj.append("whatsapp", formData.whatsapp.trim());
    }
    if (formData.direccion.trim()) {
      formDataObj.append("direccion", formData.direccion.trim());
    }

    startSubmitTransition(async () => {
      const result = await updateCustomerAction(
        editingCustomer.id,
        formDataObj,
      );
      if (result.success) {
        toast.success("Cliente actualizado exitosamente");
        closeEditDialog();
        void refetch();
      } else {
        toast.error(result.error ?? "Error al actualizar el cliente");
      }
    });
  };

  const handleDelete = () => {
    if (isDeleting || !deleteTarget) return;

    startDeleteTransition(async () => {
      const result = await deleteCustomerAction(deleteTarget.id);
      if (result.success) {
        toast.success("Cliente eliminado exitosamente");
        closeDeleteDialog();
        void refetch();
      } else {
        toast.error(result.error ?? "Error al eliminar el cliente");
      }
    });
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    openEditDialog(customer);
  };

  return (
    <>
      <EntityTableLayout
        config={{
          title: "Clientes",
          description:
            "Gestiona la información de tus clientes y consulta sus ventas totales.",
          searchPlaceholder: "Buscar por nombre, email, teléfono o WhatsApp...",
          filterDialogTitle: "Filtrar clientes",
          filterDialogDescription:
            "Selecciona uno o varios filtros y aplica para actualizar la tabla.",
          addAction: {
            label: "Agregar Cliente",
            onClick: openCreateDialog,
          },
          exportAction: {
            label: "Exportar",
            onClick: () => toast.info("Función de exportar en desarrollo"),
          },
          columns,
          onView: handleView,
          onEdit: handleEdit,
          onDelete: openDeleteDialog,
          getRowId: (row: Customer) => row.id,
        }}
        data={customers}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading || isFetching}
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value);
          // El filtrado es local, no necesitamos cambiar la página ni hacer refetch
        }}
        filters={filterDescriptors}
        filterState={filterState}
        onFilterStateChange={(next) => {
          setFilterState(next);
          setPage(1);
        }}
        pendingFilterState={pendingFilterState}
        onPendingFilterStateChange={setPendingFilterState}
        onApplyFilters={() => {
          applyFilters();
          setPage(1);
        }}
        onResetPendingFilters={resetPendingFilters}
        onClearFilters={() => {
          clearFilters();
          setPage(1);
        }}
        isFilterDialogOpen={isDialogOpen}
        setFilterDialogOpen={setDialogOpen}
        filterOptions={normalizedOptions}
        isLoadingFilterOptions={false}
      />

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Cliente</DialogTitle>
            <DialogDescription>
              Complete los datos del cliente para agregarlo al sistema
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleFormChange("nombre", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) =>
                      handleFormChange("telefono", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      handleFormChange("whatsapp", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) =>
                    handleFormChange("direccion", e.target.value)
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeCreateDialog}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Agregar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifique los datos del cliente
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre *</Label>
                <Input
                  id="edit-nombre"
                  value={formData.nombre}
                  onChange={(e) => handleFormChange("nombre", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-telefono">Teléfono</Label>
                  <Input
                    id="edit-telefono"
                    value={formData.telefono}
                    onChange={(e) =>
                      handleFormChange("telefono", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-whatsapp">WhatsApp</Label>
                  <Input
                    id="edit-whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      handleFormChange("whatsapp", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-direccion">Dirección</Label>
                <Input
                  id="edit-direccion"
                  value={formData.direccion}
                  onChange={(e) =>
                    handleFormChange("direccion", e.target.value)
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeEditDialog}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              cliente{" "}
              <span className="font-semibold">
                {deleteTarget?.nombre ?? ""}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={closeDeleteDialog}
              disabled={isDeleting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-error text-error-foreground hover:bg-error/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Customer Modal */}
      <ViewCustomerModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingCustomer(null);
        }}
        customer={viewingCustomer}
      />
    </>
  );
}
