"use server";

import { prisma } from "@/lib/prisma/client";

export async function getPaymentMethods() {
  try {
    const methods = await prisma.metodoPago.findMany({
      orderBy: {
        nombre: "asc",
      },
    });
    return methods;
  } catch (_error) {
    return [];
  }
}
