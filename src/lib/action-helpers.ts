import { z } from "zod";

export interface ActionResponse {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

function validationError(
  errors: Record<string, string[] | undefined>,
): ActionResponse {
  return {
    success: false,
    error: "Revisa los datos ingresados",
    fieldErrors: errors,
  };
}

function prismaError(error: unknown): ActionResponse {
  // Esta función debería importarse de las actions existentes
  // Por simplicidad, implementamos una versión básica aquí
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: "Ocurrió un error inesperado",
  };
}

// Tipos más específicos para evitar any
export type EntityData = Record<string, unknown>;
export type EntityResult = unknown;

export class CrudActionBuilder<TInput extends EntityData> {
  constructor(
    private schema: z.ZodType<TInput>,
    private createFn: (data: TInput) => Promise<EntityResult>,
    private updateFn: (id: string, data: TInput) => Promise<EntityResult>,
  ) {}

  static for<TInput extends EntityData>(schema: z.ZodType<TInput>) {
    return {
      createWith: (createFn: (data: TInput) => Promise<EntityResult>) => ({
        updateWith: (
          updateFn: (id: string, data: TInput) => Promise<EntityResult>,
        ) => new CrudActionBuilder(schema, createFn, updateFn),
      }),
      deleteWith: (deleteFn: (id: string) => Promise<EntityResult>) =>
        new CrudActionBuilder(
          schema,
          (() => Promise.resolve({} as EntityResult)) as (
            data: TInput,
          ) => Promise<EntityResult>,
          ((_id: string, _data: TInput) =>
            Promise.resolve({} as EntityResult)) as (
            id: string,
            data: TInput,
          ) => Promise<EntityResult>,
        ).withDeleteFn(deleteFn),
    };
  }

  private deleteFn?: (id: string) => Promise<EntityResult>;

  private withDeleteFn(deleteFn: (id: string) => Promise<EntityResult>) {
    this.deleteFn = deleteFn;
    return this;
  }

  buildUpsertAction() {
    return async (
      values: TInput & { id?: string },
    ): Promise<ActionResponse> => {
      const parsed = this.schema.safeParse(values);
      if (!parsed.success) {
        return validationError(parsed.error.flatten().fieldErrors);
      }

      try {
        if (values.id) {
          await this.updateFn(values.id, parsed.data);
        } else {
          await this.createFn(parsed.data);
        }
        return { success: true };
      } catch (error) {
        return prismaError(error);
      }
    };
  }

  buildDeleteAction(deleteFn?: (id: string) => Promise<EntityResult>) {
    const finalDeleteFn = deleteFn || this.deleteFn;
    if (!finalDeleteFn) {
      throw new Error("Delete function not provided");
    }

    return async (id: string): Promise<ActionResponse> => {
      try {
        await finalDeleteFn(id);
        return { success: true };
      } catch (error) {
        return prismaError(error);
      }
    };
  }
}

// Helper adicional para casos simples - type-safe
export function createBasicSchema(fields: {
  name?: { required?: boolean; label?: string };
  description?: { required?: boolean };
}) {
  const schemaFields: Record<string, z.ZodType<unknown>> = {};

  if (fields.name) {
    schemaFields.nombre = z
      .string()
      .min(
        fields.name.required ? 1 : 0,
        fields.name.label
          ? `${fields.name.label} es obligatorio`
          : "Nombre obligatorio",
      );
  }

  if (fields.description) {
    schemaFields.descripcion = fields.description?.required
      ? z.string().min(1, "Descripción obligatoria")
      : z.string().optional();
  }

  return z.object(schemaFields);
}
