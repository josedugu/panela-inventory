"use server";

import { deleteCustomer } from "@/data/repositories/customers.repository";

export async function deleteCustomerAction(id: string) {
  try {
    await deleteCustomer(id);
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar el cliente",
    };
  }
}
