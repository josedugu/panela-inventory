"use server";

import {
  type CustomerWithTotalSales,
  listCustomers,
} from "@/data/repositories/customers.repository";

export type CustomerDTO = CustomerWithTotalSales;

interface GetCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface GetCustomersSuccess {
  success: true;
  data: CustomerDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GetCustomersError {
  success: false;
  error: string;
}

export type GetCustomersResult = GetCustomersSuccess | GetCustomersError;

export async function getCustomersAction(
  params?: GetCustomersParams,
): Promise<GetCustomersResult> {
  try {
    const customers = await listCustomers();

    // Si no hay búsqueda, devolver todos los datos para filtrar en el frontend
    if (!params?.search) {
      return {
        success: true,
        data: customers,
        total: customers.length,
        page: 1,
        pageSize: customers.length,
      };
    }

    // Si hay búsqueda del servidor (aunque no la usaremos desde el frontend)
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    const searchTerm = params.search.toLowerCase();
    const filtered = customers.filter((customer) => {
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

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + pageSize);

    return {
      success: true,
      data: paginated,
      total,
      page,
      pageSize,
    };
  } catch {
    return {
      success: false,
      error: "No se pudieron obtener los clientes",
    };
  }
}
