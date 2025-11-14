"use server";

import {
  getSalesFilterOptions,
  listSales,
  type SaleWithRelations,
} from "@/data/repositories/sales.repository";
import { formatPrice } from "@/lib/utils";

const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "short",
  timeStyle: "short",
});

export type SaleDTO = {
  id: string;
  consecutivo: number;
  total: number;
  totalFormatted: string;
  status: "completada" | "anulada";
  statusLabel: string;
  statusBadge: "success" | "destructive";
  createdAt: string;
  createdAtLabel: string;
  seller?: string;
  client?: string;
};

function normalizeSale(sale: SaleWithRelations): SaleDTO {
  const status = sale.estado ? "completada" : "anulada";
  const statusLabel = sale.estado ? "Completada" : "Anulada";
  const statusBadge = sale.estado ? "success" : "destructive";

  const seller = sale.vendidoPor?.nombre ?? sale.vendidoPor?.email ?? undefined;
  const client = sale.cliente?.nombre ?? undefined;

  const createdAt = sale.createdAt.toISOString();

  const totalNumber = sale.total ? Number(sale.total) : 0;

  return {
    id: sale.id,
    consecutivo: sale.consecutivo,
    total: totalNumber,
    totalFormatted: formatPrice(totalNumber, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    status,
    statusLabel,
    statusBadge,
    createdAt,
    createdAtLabel: dateTimeFormatter.format(new Date(createdAt)),
    seller,
    client,
  };
}

interface GetSalesFilters {
  seller?: string;
  client?: string;
}

interface GetSalesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: GetSalesFilters;
}

export interface GetSalesSuccess {
  success: true;
  data: SaleDTO[];
  total: number;
  page: number;
  pageSize: number;
  filterOptions: Awaited<ReturnType<typeof getSalesFilterOptions>>;
}

export interface GetSalesError {
  success: false;
  error: string;
}

export type GetSalesResult = GetSalesSuccess | GetSalesError;

export async function getSalesAction(
  params?: GetSalesParams,
): Promise<GetSalesResult> {
  try {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const offset = (page - 1) * pageSize;

    const [sales, filterOptions] = await Promise.all([
      listSales(),
      getSalesFilterOptions(),
    ]);

    let normalized = sales.map(normalizeSale);

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      normalized = normalized.filter((sale) => {
        const candidates = [
          sale.consecutivo.toString(),
          sale.seller,
          sale.client,
        ]
          .filter(Boolean)
          .map((value) => value?.toLowerCase() ?? "");

        return candidates.some((value) => value.includes(searchLower));
      });
    }

    const filters = params?.filters ?? {};

    if (filters.seller) {
      const sellerLower = filters.seller.toLowerCase();
      normalized = normalized.filter((sale) =>
        (sale.seller ?? "").toLowerCase().includes(sellerLower),
      );
    }

    if (filters.client) {
      const clientLower = filters.client.toLowerCase();
      normalized = normalized.filter((sale) =>
        (sale.client ?? "").toLowerCase().includes(clientLower),
      );
    }

    const total = normalized.length;
    const paginated = normalized.slice(offset, offset + pageSize);

    return {
      success: true,
      data: paginated,
      total,
      page,
      pageSize,
      filterOptions,
    };
  } catch {
    return {
      success: false,
      error: "No se pudieron obtener las ventas",
    };
  }
}
