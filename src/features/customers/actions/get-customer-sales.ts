"use server";

import {
  type CustomerSaleWithDetails,
  getCustomerSalesWithDetails,
} from "@/data/repositories/customers.repository";

export type CustomerSaleDTO = CustomerSaleWithDetails;

export interface GetCustomerSalesResult {
  success: true;
  data: CustomerSaleDTO[];
}

export interface GetCustomerSalesError {
  success: false;
  error: string;
}

export type GetCustomerSalesResponse =
  | GetCustomerSalesResult
  | GetCustomerSalesError;

export async function getCustomerSalesAction(
  clienteId: string,
): Promise<GetCustomerSalesResponse> {
  try {
    const sales = await getCustomerSalesWithDetails(clienteId);

    return {
      success: true,
      data: sales,
    };
  } catch {
    return {
      success: false,
      error: "No se pudieron obtener las ventas del cliente",
    };
  }
}
