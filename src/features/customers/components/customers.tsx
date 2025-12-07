"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import {
  type CustomerFormValues,
  customerFormSchema,
} from "../schemas/form.schemas";
import { getCustomerColumns } from "./columns";
import { ViewCustomerModal } from "./view-customer-modal";

type Customer = CustomerDTO;

export function Customers() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");

  const createForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      whatsapp: "",
      direccion: "",
    },
  });

  const editForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      whatsapp: "",
      direccion: "",
    },
  });

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
      staleTime: 1000 * 60 * 30, // 30 minutos - cacheo para navegación rápida
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

  const columns = useMemo(() => getCustomerColumns(), []);

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
    createForm.reset({
      nombre: "",
      email: "",
      telefono: "",
      whatsapp: "",
      direccion: "",
    });
    setIsCreateModalOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    editForm.reset({
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
    createForm.reset();
  };

  const closeEditDialog = () => {
    setIsEditModalOpen(false);
    setEditingCustomer(null);
    editForm.reset();
  };

  const closeDeleteDialog = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleCreateSubmit = (data: CustomerFormValues) => {
    if (isSubmitting) return;

    const formDataObj = new FormData();
    formDataObj.append("nombre", data.nombre.trim());
    formDataObj.append("email", data.email.trim());
    if (data.telefono?.trim()) {
      formDataObj.append("telefono", data.telefono.trim());
    }
    if (data.whatsapp?.trim()) {
      formDataObj.append("whatsapp", data.whatsapp.trim());
    }
    if (data.direccion?.trim()) {
      formDataObj.append("direccion", data.direccion.trim());
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

  const handleEditSubmit = (data: CustomerFormValues) => {
    if (isSubmitting || !editingCustomer) return;

    const formDataObj = new FormData();
    formDataObj.append("nombre", data.nombre.trim());
    formDataObj.append("email", data.email.trim());
    if (data.telefono?.trim()) {
      formDataObj.append("telefono", data.telefono.trim());
    }
    if (data.whatsapp?.trim()) {
      formDataObj.append("whatsapp", data.whatsapp.trim());
    }
    if (data.direccion?.trim()) {
      formDataObj.append("direccion", data.direccion.trim());
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
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(handleCreateSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-4 py-4">
                <FormField
                  control={createForm.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre del cliente"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@ejemplo.com"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Teléfono"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="WhatsApp"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={createForm.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dirección"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
          </Form>
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
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-4 py-4">
                <FormField
                  control={editForm.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre del cliente"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@ejemplo.com"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Teléfono"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="WhatsApp"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="direccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dirección"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
          </Form>
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
