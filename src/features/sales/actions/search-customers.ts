"use server";

import { searchCustomers } from "@/data/repositories/customers.repository";

export async function searchCustomersAction(query: string) {
  const customers = await searchCustomers(query, 10);
  return customers.map((customer) => {
    const nombre = customer.nombre ?? "Cliente sin información";
    const cedula = customer.cedula;
    const label = cedula ? `${nombre} - ${cedula}` : nombre;
    return {
      value: customer.id,
      label,
    };
  });
}
