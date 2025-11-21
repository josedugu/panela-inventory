"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  type CustomerFormValues,
  customerFormSchema,
} from "../../customers/schemas/form.schemas";

// Re-export for compatibility
export type CustomerFormData = CustomerFormValues;

interface CustomerCreateFormProps {
  onDataChange: (data: CustomerFormData | null) => void;
  defaultData?: Partial<CustomerFormData>;
}

export function CustomerCreateForm({
  onDataChange,
  defaultData,
}: CustomerCreateFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      nombre: defaultData?.nombre ?? "",
      cedula: defaultData?.cedula ?? "",
      email: defaultData?.email ?? "",
      telefono: defaultData?.telefono ?? "",
      whatsapp: defaultData?.whatsapp ?? "",
      direccion: defaultData?.direccion ?? "",
    },
    mode: "onChange", // Validar en cada cambio
  });

  // Observar cambios en el formulario y notificar al padre si es válido
  useEffect(() => {
    const subscription = form.watch((_value, { name, type }) => {
      // Verificamos si el formulario es válido con los valores actuales
      // No usamos form.formState.isValid directamente aquí porque puede tener un ligero retraso
      // en el ciclo de renderizado al usar watch, así que disparamos la validación
      form.trigger().then((isValid) => {
        if (isValid) {
          // Convertir los valores parciales a CustomerFormData completo
          // asegurando que los campos requeridos estén presentes
          const currentValues = form.getValues();
          if (currentValues.nombre && currentValues.email) {
            onDataChange(currentValues as CustomerFormData);
          } else {
            onDataChange(null);
          }
        } else {
          onDataChange(null);
        }
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onDataChange]);

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Resetear cuando se cierra
      form.reset({
        nombre: "",
        cedula: "",
        email: "",
        telefono: "",
        whatsapp: "",
        direccion: "",
      });
      onDataChange(null);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
      <CollapsibleTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          {isOpen ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Ocultar formulario
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Crear nuevo cliente
            </>
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <Form {...form}>
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cedula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cédula</FormLabel>
                      <FormControl>
                        <Input placeholder="Cédula / RUC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@ejemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Teléfono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="WhatsApp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Dirección" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
