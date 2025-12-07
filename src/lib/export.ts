import type { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";

interface ExportOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  filename?: string;
}

export function exportToExcel<TData>({
  data,
  columns,
  filename = "export.xlsx",
}: ExportOptions<TData>) {
  // Filtrar columnas que tienen accessorKey (son datos reales) y crear headers
  const exportableColumns = columns.filter(
    (col) =>
      "accessorKey" in col && col.id !== "actions" && col.id !== "select",
  );

  const headers = exportableColumns.map((col) => {
    const header = col.header;
    return typeof header === "string" ? header : (col.id ?? "Unknown");
  });

  // Mapear datos a filas
  const rows = data.map((item) => {
    const rowData: Record<string, unknown> = {};
    exportableColumns.forEach((col) => {
      // @ts-expect-error - accessorKey exists checked above
      const key = col.accessorKey as string;
      // @ts-expect-error
      rowData[key] = item[key];
    });
    return rowData;
  });

  // Crear hoja de trabajo
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Reemplazar headers por nombres amigables
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

  // Crear libro
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

  // Generar archivo y descargar
  XLSX.writeFile(workbook, filename);
}
