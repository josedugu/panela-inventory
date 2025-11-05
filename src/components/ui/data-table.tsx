import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  headerClassName?: string;
  sticky?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  maxHeight?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  itemsPerPageOptions = [5, 10, 20, 50],
  defaultItemsPerPage = 10,
  maxHeight = "calc(100vh-400px)",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Pagination calculations
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  const getCellValue = (row: T, column: Column<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(row);
    }
    return row[column.accessor] as ReactNode;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative">
          {/* Sticky Table Container */}
          <div className="overflow-auto" style={{ maxHeight }}>
            <Table>
              <TableHeader className="sticky top-0 bg-surface-1 dark:bg-surface-1 z-10 shadow-sm">
                <TableRow>
                  {columns.map((column, idx) => (
                    <TableHead
                      key={`col-${typeof column.accessor === "string" ? column.accessor : idx}`}
                      className={`${column.headerClassName || ""} ${
                        column.sticky
                          ? "sticky right-0 bg-surface-1 dark:bg-surface-1"
                          : ""
                      }`}
                    >
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row) => (
                  <TableRow key={keyExtractor(row)}>
                    {columns.map((column, colIdx) => (
                      <TableCell
                        key={`${keyExtractor(row)}-${typeof column.accessor === "string" ? column.accessor : colIdx}`}
                        className={`${column.className || ""} ${
                          column.sticky
                            ? "sticky right-0 bg-surface-1 dark:bg-surface-1"
                            : ""
                        }`}
                      >
                        {getCellValue(row, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Sticky Footer with Pagination */}
          <div className="sticky bottom-0 bg-surface-1 dark:bg-surface-1 border-t border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span>
                Mostrando {startIndex + 1} - {Math.min(endIndex, data.length)}{" "}
                de {data.length} registro{data.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Items per page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Mostrar:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {itemsPerPageOptions.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1 px-2">
                  <span className="text-sm font-medium">{currentPage}</span>
                  <span className="text-sm text-text-secondary">
                    de {totalPages || 1}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
