"use client";

import {
  type ColumnDef,
  type ColumnSizingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/components/ui/utils";

interface ContextMenu {
  x: number;
  y: number;
  rowId: string;
}

interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

interface DataGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  isLoading?: boolean;
  pagination?: PaginationConfig;
  onView?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onDuplicate?: (row: TData) => void;
  getRowId?: (row: TData) => string;
}

export function DataGrid<TData>({
  data,
  columns,
  isLoading: _isLoading = false,
  pagination,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  getRowId,
}: DataGridProps<TData>) {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  const columnsWithIndex: ColumnDef<TData, unknown>[] = [
    {
      id: "#",
      header: "#",
      cell: ({ row }) => {
        const index = pagination
          ? (pagination.page - 1) * pagination.pageSize + row.index + 1
          : row.index + 1;
        return <div className="text-text-secondary font-medium">{index}</div>;
      },
      size: 50,
    },
    ...columns,
  ];

  const table = useReactTable({
    data,
    columns: columnsWithIndex,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: !!pagination,
    columnResizeMode: "onChange",
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
  });

  const handleContextMenu = (e: React.MouseEvent, rowId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, rowId });
    setSelectedRowId(rowId);
  };

  const handleRowClick = (rowId: string) => {
    setSelectedRowId(rowId);
  };

  const handleContextMenuAction = (
    action: "view" | "edit" | "delete" | "duplicate",
  ) => {
    if (!contextMenu) return;

    const row = data.find((item) => {
      const id = getRowId ? getRowId(item) : (item as { id: string }).id;
      return id === contextMenu.rowId;
    });

    if (!row) return;

    if (action === "view" && onView) onView(row);
    if (action === "edit" && onEdit) onEdit(row);
    if (action === "delete" && onDelete) onDelete(row);
    if (action === "duplicate" && onDuplicate) onDuplicate(row);

    setContextMenu(null);
  };

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
    : 1;
  const displayTotalPages = pagination
    ? pagination.total === 0
      ? 0
      : totalPages
    : totalPages;

  const startItem = pagination
    ? pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1
    : 0;

  const endItem = pagination
    ? pagination.total === 0
      ? 0
      : Math.min(pagination.page * pagination.pageSize, pagination.total)
    : 0;

  const rows = table.getRowModel().rows;
  const isEmpty = rows.length === 0;

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden">
        <CardContent className="p-0 h-full">
          <div
            className="relative flex flex-col h-full"
            role="application"
            onContextMenu={(e) => {
              if (!(e.target as HTMLElement).closest("tr")) {
                e.preventDefault();
              }
            }}
          >
            <div className="overflow-auto max-h-[calc(100vh-260px)] min-h-[520px] h-full">
              <table className="w-full h-full caption-bottom text-sm border-collapse">
                <thead className="sticky top-0 bg-surface-1 dark:bg-surface-1 z-10 shadow-sm">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header, headerIndex) => (
                        <th
                          key={header.id}
                          className={cn(
                            "relative h-10 px-4 text-center align-middle font-medium whitespace-nowrap border-b border-border select-none",
                            headerIndex !== headerGroup.headers.length - 1 &&
                              "border-r border-border/40",
                          )}
                          style={{
                            width: header.getSize(),
                            minWidth: header.getSize(),
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                          {header.column.getCanResize() && (
                            <button
                              type="button"
                              aria-label="Resize column"
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                "absolute top-0 right-0 h-full w-1 cursor-col-resize select-none bg-border/0 transition-opacity border-0 p-0",
                                header.column.getIsResizing()
                                  ? "bg-border"
                                  : "hover:bg-border/80",
                              )}
                            />
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const rowId = getRowId
                      ? getRowId(row.original)
                      : (row.original as { id: string }).id;
                    const isSelected = selectedRowId === rowId;

                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "border-b transition-colors cursor-pointer",
                          "hover:bg-surface-2/50",
                          isSelected && "bg-surface-2",
                        )}
                        onContextMenu={(e) => handleContextMenu(e, rowId)}
                        onClick={() => handleRowClick(rowId)}
                      >
                        {row.getVisibleCells().map((cell, cellIndex) => (
                          <td
                            key={cell.id}
                            className={cn(
                              "p-4 align-middle whitespace-nowrap text-center",
                              cellIndex !== row.getVisibleCells().length - 1 &&
                                "border-r border-border/40",
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                  {isEmpty && (
                    <tr>
                      <td
                        colSpan={columnsWithIndex.length}
                        className="h-[320px]"
                      />
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination && (
              <div className="sticky bottom-0 bg-surface-1 dark:bg-surface-1 border-t border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>
                    {pagination.total > 0
                      ? `Mostrando ${startItem} - ${endItem} de ${pagination.total}`
                      : "Mostrando 0 de 0"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">
                      Mostrar:
                    </span>
                    <Select
                      value={pagination.pageSize.toString()}
                      onValueChange={(value) =>
                        pagination.onPageSizeChange(Number(value))
                      }
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent side="top">
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        pagination.onPageChange(pagination.page - 1)
                      }
                      disabled={pagination.total === 0 || pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1 px-2">
                      <span className="text-sm font-medium">
                        {pagination.page}
                      </span>
                      <span className="text-sm text-text-secondary">
                        de {displayTotalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        pagination.onPageChange(pagination.page + 1)
                      }
                      disabled={
                        pagination.total === 0 || pagination.page >= totalPages
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {contextMenu && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => e.preventDefault()}
            aria-label="Close context menu"
          />
          <div
            className="fixed z-50 min-w-[180px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
            }}
          >
            {onView && (
              <button
                type="button"
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleContextMenuAction("view")}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver cliente
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleContextMenuAction("edit")}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </button>
            )}
            {onDuplicate && (
              <button
                type="button"
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleContextMenuAction("duplicate")}
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-error"
                onClick={() => handleContextMenuAction("delete")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
