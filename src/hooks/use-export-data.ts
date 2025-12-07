import type { ColumnDef } from "@tanstack/react-table";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export type ExportFormat = "csv" | "xlsx" | "pdf";

interface ExportOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  filename?: string;
  title?: string;
}

export function useExportData<TData>() {
  const exportToCSV = ({
    data,
    columns,
    filename,
    title,
  }: ExportOptions<TData>) => {
    try {
      if (!data || data.length === 0) {
        toast.warning("No hay datos para exportar");
        return;
      }

      // Filtrar columnas que tienen accessorKey (son datos reales)
      const exportableColumns = columns.filter(
        (col) =>
          "accessorKey" in col && col.id !== "actions" && col.id !== "select",
      );

      // Crear headers
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

      // Crear CSV
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              // Escapar comillas y envolver en comillas si contiene coma o comillas
              const stringValue = String(value ?? "");
              if (stringValue.includes(",") || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            })
            .join(","),
        ),
      ].join("\n");

      // Descargar archivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const exportFilename =
        filename ||
        `${title || "datos"}_${new Date().toISOString().split("T")[0]}.csv`;
      link.href = URL.createObjectURL(blob);
      link.download = exportFilename;
      link.click();

      toast.success("Datos exportados a CSV correctamente");
    } catch (_error) {
      toast.error("Error al exportar los datos a CSV");
    }
  };

  const exportToExcel = ({
    data,
    columns,
    filename,
    title,
  }: ExportOptions<TData>) => {
    try {
      if (!data || data.length === 0) {
        toast.warning("No hay datos para exportar");
        return;
      }

      // Filtrar columnas que tienen accessorKey (son datos reales)
      const exportableColumns = columns.filter(
        (col) =>
          "accessorKey" in col && col.id !== "actions" && col.id !== "select",
      );

      // Crear headers
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

      // Agregar headers en la primera fila
      XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

      // Crear libro
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

      // Generar archivo y descargar
      const exportFilename =
        filename ||
        `${title || "datos"}_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, exportFilename);

      toast.success("Datos exportados a Excel correctamente");
    } catch (_error) {
      toast.error("Error al exportar los datos a Excel");
    }
  };

  const exportToPDF = ({
    data,
    columns,
    filename,
    title,
  }: ExportOptions<TData>) => {
    try {
      if (!data || data.length === 0) {
        toast.warning("No hay datos para exportar");
        return;
      }

      // Filtrar columnas que tienen accessorKey (son datos reales)
      const exportableColumns = columns.filter(
        (col) =>
          "accessorKey" in col && col.id !== "actions" && col.id !== "select",
      );

      // Crear headers
      const headers = exportableColumns.map((col) => {
        const header = col.header;
        return typeof header === "string" ? header : (col.id ?? "Unknown");
      });

      // Preparar datos para la tabla PDF
      const tableData = data.map((item) => {
        const rowData: unknown[] = [];
        exportableColumns.forEach((col) => {
          // @ts-expect-error - accessorKey exists checked above
          const key = col.accessorKey as string;
          // @ts-expect-error
          rowData.push(item[key] ?? "");
        });
        return rowData;
      });

      // Crear PDF
      const pdf = new jsPDF();

      // Agregar título
      pdf.setFontSize(16);
      pdf.text(title || "Datos Exportados", 14, 20);

      // Agregar tabla
      // @ts-expect-error - jsPDF with autoTable plugin
      pdf.autoTable({
        head: [headers],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      // Descargar PDF
      const exportFilename =
        filename ||
        `${title || "datos"}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(exportFilename);

      toast.success("Datos exportados a PDF correctamente");
    } catch (_error) {
      toast.error("Error al exportar los datos a PDF");
    }
  };

  const exportData = (
    format: ExportFormat,
    {
      data,
      columns,
      filename,
      title,
    }: Omit<ExportOptions<TData>, "data" | "columns"> &
      Partial<Pick<ExportOptions<TData>, "data" | "columns">> = {},
  ) => {
    const options: ExportOptions<TData> = {
      data: data || [],
      columns: columns || [],
      filename,
      title,
    };

    switch (format) {
      case "csv":
        exportToCSV(options);
        break;
      case "xlsx":
        exportToExcel(options);
        break;
      case "pdf":
        exportToPDF(options);
        break;
      default:
        toast.error("Formato de exportación no soportado");
    }
  };

  return { exportData };
}
