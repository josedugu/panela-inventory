import type { ColumnDef } from "@tanstack/react-table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export type ExportFormat = "csv" | "xlsx" | "pdf";

interface ExportOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  filename?: string;
  title?: string;
}

type ExportableColumn = {
  header: string;
  accessorKey: string;
};

const getFilename = (
  format: ExportFormat,
  filename?: string,
  title?: string,
) => {
  const dateSuffix = new Date().toISOString().split("T")[0];
  const baseName = filename || `${title || "datos"}_${dateSuffix}`;
  const extension = format === "xlsx" ? "xlsx" : format;
  const normalizedBase = baseName.replace(/\.+$/, "");

  if (normalizedBase.toLowerCase().endsWith(`.${extension}`)) {
    return normalizedBase;
  }

  return `${normalizedBase}.${extension}`;
};

const getExportableColumns = <TData>(
  columns: ColumnDef<TData, unknown>[],
): ExportableColumn[] =>
  columns
    .filter(
      (col) =>
        "accessorKey" in col &&
        col.accessorKey &&
        col.id !== "actions" &&
        col.id !== "select",
    )
    .map((col) => ({
      accessorKey: String(col.accessorKey),
      header:
        typeof col.header === "string"
          ? col.header
          : col.id || String(col.accessorKey) || "Unknown",
    }));

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

      const exportableColumns = getExportableColumns(columns);

      if (exportableColumns.length === 0) {
        toast.warning("No hay columnas exportables");
        return;
      }

      const headers = exportableColumns.map((col) => col.header);
      const csvRows = data.map((item) =>
        exportableColumns
          .map(({ accessorKey }) => {
            const value = (item as Record<string, unknown>)[accessorKey];
            const stringValue = String(value ?? "");
            if (stringValue.includes(",") || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(","),
      );

      const csvContent = [headers.join(","), ...csvRows].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const exportFilename = getFilename("csv", filename, title);
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

      const exportableColumns = getExportableColumns(columns);

      if (exportableColumns.length === 0) {
        toast.warning("No hay columnas exportables");
        return;
      }

      const rows = data.map((item) => {
        const rowData: Record<string, unknown> = {};
        exportableColumns.forEach(({ header, accessorKey }) => {
          rowData[header] = (item as Record<string, unknown>)[accessorKey];
        });
        return rowData;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const headers = exportableColumns.map((col) => col.header);
      XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

      const exportFilename = getFilename("xlsx", filename, title);
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

      const exportableColumns = getExportableColumns(columns);

      if (exportableColumns.length === 0) {
        toast.warning("No hay columnas exportables");
        return;
      }

      const headers = exportableColumns.map((col) => col.header);

      const tableData = data.map((item) =>
        exportableColumns.map(
          ({ accessorKey }) =>
            (item as Record<string, unknown>)[accessorKey] ?? "",
        ),
      );

      // Crear PDF
      const pdf = new jsPDF();

      // Agregar título
      pdf.setFontSize(16);
      pdf.text(title || "Datos Exportados", 14, 20);

      // Agregar tabla
      autoTable(pdf, {
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
      const exportFilename = getFilename("pdf", filename, title);
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
