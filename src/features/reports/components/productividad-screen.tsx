"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  addDays,
  format,
  getISOWeekYear,
  parse,
  parseISO,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { Download, Filter, LineChart, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExportDropdown } from "@/components/ui/export-dropdown";
import { Input } from "@/components/ui/input";
import type { InputSearchOption } from "@/components/ui/input-search";
import { Label } from "@/components/ui/label";
import { MultiSelectSearch } from "@/components/ui/multi-select-search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExportData } from "@/hooks/use-export-data";
import { formatPrice } from "@/lib/utils";
import { getProductividadCostCentersAction } from "../actions/get-productividad-cost-centers";
import {
  getProductividadDataAction,
  type ProductivityColumn,
  type ProductivityMode,
} from "../actions/get-productividad-data";

type CostCenterFilters = {
  mode: ProductivityMode;
  weekValue: string;
  monthValue: string;
  year: number;
  centros: InputSearchOption[];
};

type ProductivityFilters = {
  mode: ProductivityMode;
  weekValue: string;
  monthValue: string;
  year: number;
  asesores: InputSearchOption[];
};

type ExportRow = Record<string, string | number>;

type DisplayRow = {
  id: string;
  label: string;
  secondary?: string;
  valores: Record<string, number>;
  total: number;
  promedio: number;
};

// RRRR + II usa año ISO compatible con inputs type="week"
const WEEK_INPUT_FORMAT = "RRRR-'W'II";

function getDefaultWeekValue() {
  return format(new Date(), WEEK_INPUT_FORMAT);
}

function getDefaultMonthValue() {
  return format(new Date(), "yyyy-MM");
}

function getWeekStartDate(value: string) {
  const parsed = parse(value, WEEK_INPUT_FORMAT, new Date());
  const weekStart = startOfWeek(parsed, { weekStartsOn: 1 });
  return format(weekStart, "yyyy-MM-dd");
}

function getMonthStartDate(value: string) {
  const normalized = /^\d{4}-\d{2}$/.test(value)
    ? value
    : getDefaultMonthValue();
  return `${normalized}-01`;
}

function getDerivedStartDateFromFilters(
  filters: Pick<ProductivityFilters, "mode" | "weekValue" | "monthValue">,
) {
  return filters.mode === "weekly"
    ? getWeekStartDate(filters.weekValue)
    : filters.mode === "monthly"
      ? getMonthStartDate(filters.monthValue)
      : undefined;
}

function getYearFromWeek(value: string) {
  const parsed = parse(value, WEEK_INPUT_FORMAT, new Date());
  return getISOWeekYear(parsed);
}

function getYearFromMonth(value: string) {
  const parsed = parseISO(getMonthStartDate(value));
  return parsed.getFullYear();
}

function getDerivedYearFromFilters(
  filters: Pick<
    ProductivityFilters,
    "mode" | "weekValue" | "monthValue" | "year"
  >,
) {
  if (filters.mode === "yearly") return filters.year;
  return filters.mode === "monthly"
    ? getYearFromMonth(filters.monthValue)
    : getYearFromWeek(filters.weekValue);
}

function getWeekRangeLabel(value: string) {
  const startDate = parseISO(getWeekStartDate(value));
  const endDate = addDays(startDate, 6);
  return `Semana del ${format(startDate, "dd MMM yyyy", { locale: es })} al ${format(endDate, "dd MMM yyyy", { locale: es })}`;
}

const currentYear = new Date().getFullYear();
const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

export function ProductividadScreen() {
  const [advisorInputFilters, setAdvisorInputFilters] =
    useState<ProductivityFilters>({
      mode: "weekly",
      weekValue: getDefaultWeekValue(),
      monthValue: getDefaultMonthValue(),
      year: currentYear,
      asesores: [],
    });
  const [advisorAppliedFilters, setAdvisorAppliedFilters] =
    useState<ProductivityFilters>(advisorInputFilters);

  const [costCenterInputFilters, setCostCenterInputFilters] =
    useState<CostCenterFilters>({
      mode: "weekly",
      weekValue: getDefaultWeekValue(),
      monthValue: getDefaultMonthValue(),
      year: currentYear,
      centros: [],
    });
  const [costCenterAppliedFilters, setCostCenterAppliedFilters] =
    useState<CostCenterFilters>(costCenterInputFilters);

  const [activeTab, setActiveTab] = useState<"advisors" | "cost-centers">(
    "advisors",
  );

  const advisorStartDate = getDerivedStartDateFromFilters(
    advisorAppliedFilters,
  );
  const advisorYear = getDerivedYearFromFilters(advisorAppliedFilters);
  const costCenterStartDate = getDerivedStartDateFromFilters(
    costCenterAppliedFilters,
  );
  const costCenterYear = getDerivedYearFromFilters(costCenterAppliedFilters);

  const {
    data: advisorData,
    isLoading: isLoadingAdvisors,
    isFetching: isFetchingAdvisors,
  } = useQuery({
    queryKey: [
      "productividad",
      advisorAppliedFilters.mode,
      advisorStartDate ?? "sin-fecha",
      advisorYear,
      advisorAppliedFilters.asesores.map((a) => a.value).join(","),
    ],
    queryFn: async () => {
      const result = await getProductividadDataAction({
        mode: advisorAppliedFilters.mode,
        startDate: advisorStartDate,
        year: advisorYear,
        asesorIds: advisorAppliedFilters.asesores.map((a) => a.value),
      });
      return result.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: costCenterData,
    isLoading: isLoadingCostCenters,
    isFetching: isFetchingCostCenters,
  } = useQuery({
    queryKey: [
      "productividad-cost-centers",
      costCenterAppliedFilters.mode,
      costCenterStartDate ?? "sin-fecha",
      costCenterYear,
      costCenterAppliedFilters.centros.map((c) => c.value).join(","),
    ],
    queryFn: async () => {
      const result = await getProductividadCostCentersAction({
        mode: costCenterAppliedFilters.mode,
        startDate: costCenterStartDate,
        year: costCenterYear,
        centroCostoIds: costCenterAppliedFilters.centros.map((c) => c.value),
      });
      return result.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    enabled: activeTab === "cost-centers",
  });

  const { exportData } = useExportData<ExportRow>();

  const advisorColumns = advisorData?.columns ?? [];
  const advisorRowsData = advisorData?.rows ?? [];
  const costCenterColumns = costCenterData?.columns ?? [];
  const costCenterRowsData = costCenterData?.rows ?? [];

  const advisorFallbackRangeLabel = useMemo(() => {
    if (advisorAppliedFilters.mode === "weekly") {
      return getWeekRangeLabel(advisorAppliedFilters.weekValue);
    }
    if (advisorAppliedFilters.mode === "monthly") {
      return format(
        parseISO(getMonthStartDate(advisorAppliedFilters.monthValue)),
        "LLLL yyyy",
        {
          locale: es,
        },
      );
    }
    return `Año ${advisorAppliedFilters.year}`;
  }, [advisorAppliedFilters]);

  const advisorRangeLabel =
    advisorData?.rangeLabel ?? advisorFallbackRangeLabel;

  const costCenterFallbackRangeLabel = useMemo(() => {
    if (costCenterAppliedFilters.mode === "weekly") {
      return getWeekRangeLabel(costCenterAppliedFilters.weekValue);
    }
    if (costCenterAppliedFilters.mode === "monthly") {
      return format(
        parseISO(getMonthStartDate(costCenterAppliedFilters.monthValue)),
        "LLLL yyyy",
        {
          locale: es,
        },
      );
    }
    return `Año ${costCenterAppliedFilters.year}`;
  }, [costCenterAppliedFilters]);

  const costCenterRangeLabel =
    costCenterData?.rangeLabel ?? costCenterFallbackRangeLabel;

  const advisorRows: DisplayRow[] = useMemo(
    () =>
      advisorRowsData.map((row) => ({
        id: row.asesorId,
        label: row.asesorNombre,
        secondary: row.centroCosto,
        valores: row.valores,
        total: row.total,
        promedio: row.promedio,
      })),
    [advisorRowsData],
  );

  const advisorOptions: InputSearchOption[] = useMemo(() => {
    if (!advisorData?.asesoresDisponibles) return [];
    return advisorData.asesoresDisponibles.map((asesor) => ({
      value: asesor.id,
      label: `${asesor.nombre} • ${asesor.centroCosto}`,
    }));
  }, [advisorData?.asesoresDisponibles]);

  const costCenterRows: DisplayRow[] = useMemo(
    () =>
      costCenterRowsData.map((row) => ({
        id: row.centroCostoId,
        label: row.centroCostoNombre,
        secondary: row.descripcion ?? "",
        valores: row.valores,
        total: row.total,
        promedio: row.promedio,
      })),
    [costCenterRowsData],
  );

  const costCenterOptions: InputSearchOption[] = useMemo(() => {
    if (!costCenterData?.centrosDisponibles) return [];
    return costCenterData.centrosDisponibles.map((centro) => ({
      value: centro.id,
      label: centro.descripcion
        ? `${centro.nombre} • ${centro.descripcion}`
        : centro.nombre,
    }));
  }, [costCenterData?.centrosDisponibles]);

  const handleApplyAdvisorFilters = () => {
    setAdvisorAppliedFilters(advisorInputFilters);
  };

  const handleApplyCostCenterFilters = () => {
    setCostCenterAppliedFilters(costCenterInputFilters);
  };

  const handleResetAdvisorFilters = () => {
    const defaults: ProductivityFilters = {
      mode: "weekly",
      weekValue: getDefaultWeekValue(),
      monthValue: getDefaultMonthValue(),
      year: currentYear,
      asesores: [],
    };
    setAdvisorInputFilters(defaults);
    setAdvisorAppliedFilters(defaults);
  };

  const handleResetCostCenterFilters = () => {
    const defaults: CostCenterFilters = {
      mode: "weekly",
      weekValue: getDefaultWeekValue(),
      monthValue: getDefaultMonthValue(),
      year: currentYear,
      centros: [],
    };
    setCostCenterInputFilters(defaults);
    setCostCenterAppliedFilters(defaults);
  };

  const handleExport = (
    exportFormat: "csv" | "xlsx" | "pdf",
    rowsToExport: DisplayRow[],
    columnsToExport: ProductivityColumn[],
    options: { filename: string; title: string; includeSecondary?: boolean },
  ) => {
    if (columnsToExport.length === 0) return;

    const exportRows: ExportRow[] = rowsToExport.map((row) => {
      const base: ExportRow = {
        Nombre: row.label,
      };

      if (options.includeSecondary) {
        base.Detalle = row.secondary ?? "";
      }

      columnsToExport.forEach((col) => {
        base[col.label] = row.valores[col.id] ?? 0;
      });

      base.Total = Math.round(row.total);
      base.Promedio = Math.round(row.promedio);
      return base;
    });

    const exportColumns: ColumnDef<ExportRow>[] = [
      { accessorKey: "Nombre", header: "Nombre" },
      ...(options.includeSecondary
        ? [{ accessorKey: "Detalle", header: "Detalle" }]
        : []),
      ...columnsToExport.map((col) => ({
        accessorKey: col.label,
        header: col.label,
      })),
      { accessorKey: "Total", header: "Total" },
      { accessorKey: "Promedio", header: "Promedio" },
    ];

    const exportOptions = {
      data: exportRows,
      columns: exportColumns,
      filename: options.filename,
      title: options.title,
    };

    exportData(exportFormat, exportOptions);
  };

  const renderTable = ({
    rowsToRender,
    columnsToRender,
    primaryLabel,
    secondaryLabel,
  }: {
    rowsToRender: DisplayRow[];
    columnsToRender: ProductivityColumn[];
    primaryLabel: string;
    secondaryLabel?: string;
  }) => (
    <div className="overflow-auto rounded-lg border border-border bg-surface-1">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-2 sticky top-0 z-10">
            <TableHead className="min-w-[200px]">{primaryLabel}</TableHead>
            {secondaryLabel ? (
              <TableHead className="min-w-[160px]">{secondaryLabel}</TableHead>
            ) : null}
            {columnsToRender.map((col) => (
              <TableHead key={col.id} className="text-right min-w-[120px]">
                {col.label}
              </TableHead>
            ))}
            <TableHead className="text-right min-w-[140px]">Total</TableHead>
            <TableHead className="text-right min-w-[140px]">Promedio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowsToRender.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.label}</TableCell>
              {secondaryLabel ? (
                <TableCell className="text-text-secondary">
                  {row.secondary}
                </TableCell>
              ) : null}
              {columnsToRender.map((col) => (
                <TableCell key={`${row.id}-${col.id}`} className="text-right">
                  {formatPrice(row.valores[col.id] ?? 0)}
                </TableCell>
              ))}
              <TableCell className="text-right font-semibold">
                {formatPrice(row.total)}
              </TableCell>
              <TableCell className="text-right text-text-secondary">
                {formatPrice(row.promedio)}
              </TableCell>
            </TableRow>
          ))}
          {rowsToRender.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  1 + (secondaryLabel ? 1 : 0) + columnsToRender.length + 2
                }
                className="text-center text-text-secondary"
              >
                Sin datos para los filtros seleccionados
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );

  const renderSummaryCard = ({
    rowsToRender,
    columnsToExport,
    rangeLabel,
    exportTitle,
    exportFilename,
    includeSecondary = true,
  }: {
    rowsToRender: DisplayRow[];
    columnsToExport: ProductivityColumn[];
    rangeLabel: string;
    exportTitle: string;
    exportFilename: string;
    includeSecondary?: boolean;
  }) => {
    const total = rowsToRender.reduce((sum, row) => sum + row.total, 0);
    const promedio =
      rowsToRender.length > 0 ? total / rowsToRender.length : total;
    const count = rowsToRender.length;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-primary" />
            Resumen
          </CardTitle>
          <CardDescription>{rangeLabel}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-text-secondary">Total utilidad</p>
            <p className="text-xl font-semibold">{formatPrice(total)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-text-secondary">Promedio</p>
            <p className="text-xl font-semibold">{formatPrice(promedio)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-text-secondary">Registros</p>
            <p className="text-xl font-semibold">{count}</p>
          </div>
          <div className="flex items-end justify-end">
            <ExportDropdown
              onExport={(format) =>
                handleExport(format, rowsToRender, columnsToExport, {
                  filename: exportFilename,
                  title: exportTitle,
                  includeSecondary,
                })
              }
              disabled={count === 0}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSkeleton = () => {
    const headerPlaceholders = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "h7",
      "h8",
      "h9",
      "h10",
      "h11",
      "h12",
    ];
    const rowPlaceholders = ["r1", "r2", "r3", "r4", "r5", "r6"];

    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-48" />
        <div className="overflow-auto rounded-lg border border-border bg-surface-1">
          <div className="grid grid-cols-6 gap-2 p-4">
            {headerPlaceholders.map((key) => (
              <Skeleton key={key} className="h-4 w-full" />
            ))}
          </div>
          <div className="space-y-2 p-4">
            {rowPlaceholders.map((rowKey) => (
              <div key={rowKey} className="grid grid-cols-6 gap-2">
                {headerPlaceholders.map((colKey) => (
                  <Skeleton
                    key={`${rowKey}-${colKey}`}
                    className="h-4 w-full"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as typeof activeTab)}
        className="space-y-3"
      >
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="advisors">Asesores</TabsTrigger>
          <TabsTrigger value="cost-centers">Centros de costos</TabsTrigger>
        </TabsList>

        <TabsContent value="advisors" className="space-y-3 pt-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Filtros</CardTitle>
                  <CardDescription>Selecciona rango y asesores</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAdvisorFilters}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Limpiar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyAdvisorFilters}
                    disabled={isLoadingAdvisors || isFetchingAdvisors}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Aplicar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label>Temporalidad</Label>
                <Select
                  value={advisorInputFilters.mode}
                  onValueChange={(value) =>
                    setAdvisorInputFilters((prev) => ({
                      ...prev,
                      mode: value as ProductivityMode,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona temporalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-secondary">
                  Semanal: columnas por día de la semana elegida. Mensual:
                  columnas por semana del mes elegido. Anual: columnas por meses
                  del año.
                </p>
              </div>

              {advisorInputFilters.mode === "weekly" ? (
                <div className="space-y-1">
                  <Label>Semana</Label>
                  <Input
                    type="week"
                    value={advisorInputFilters.weekValue}
                    onChange={(e) =>
                      setAdvisorInputFilters((prev) => ({
                        ...prev,
                        weekValue: e.target.value || getDefaultWeekValue(),
                      }))
                    }
                  />
                  <p className="text-xs text-text-secondary">
                    Mostrando días de la semana seleccionada.
                  </p>
                </div>
              ) : advisorInputFilters.mode === "monthly" ? (
                <div className="space-y-1">
                  <Label>Mes</Label>
                  <Input
                    type="month"
                    value={advisorInputFilters.monthValue}
                    onChange={(e) =>
                      setAdvisorInputFilters((prev) => ({
                        ...prev,
                        monthValue: e.target.value || getDefaultMonthValue(),
                      }))
                    }
                  />
                  <p className="text-xs text-text-secondary">
                    Columnas por semana dentro del mes seleccionado.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label>Año</Label>
                  <Select
                    value={advisorInputFilters.year.toString()}
                    onValueChange={(value) =>
                      setAdvisorInputFilters((prev) => ({
                        ...prev,
                        year: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1 md:col-span-2 lg:col-span-2">
                <MultiSelectSearch
                  label="Asesores"
                  placeholder="Selecciona asesores"
                  value={advisorInputFilters.asesores}
                  onChange={(value) =>
                    setAdvisorInputFilters((prev) => ({
                      ...prev,
                      asesores: value,
                    }))
                  }
                  options={advisorOptions}
                  loading={isLoadingAdvisors && !advisorData}
                />
              </div>
            </CardContent>
          </Card>

          {renderSummaryCard({
            rowsToRender: advisorRows,
            columnsToExport: advisorColumns,
            rangeLabel: advisorRangeLabel,
            exportTitle: "Productividad por asesor",
            exportFilename: "productividad-asesores",
            includeSecondary: false,
          })}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">{advisorRangeLabel}</p>
              <p className="text-xs text-text-tertiary">
                Utilidad neta por periodo seleccionado
              </p>
            </div>
            {isFetchingAdvisors ? (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Download className="h-4 w-4 animate-spin" />
                Actualizando...
              </div>
            ) : null}
          </div>
          {isLoadingAdvisors && !advisorData
            ? renderSkeleton()
            : renderTable({
                rowsToRender: advisorRows,
                columnsToRender: advisorColumns,
                primaryLabel: "Asesor",
              })}
        </TabsContent>

        <TabsContent value="cost-centers" className="space-y-3 pt-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Filtros</CardTitle>
                  <CardDescription>
                    Selecciona rango y centros de costo
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetCostCenterFilters}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Limpiar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyCostCenterFilters}
                    disabled={isLoadingCostCenters || isFetchingCostCenters}
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Aplicar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label>Temporalidad</Label>
                <Select
                  value={costCenterInputFilters.mode}
                  onValueChange={(value) =>
                    setCostCenterInputFilters((prev) => ({
                      ...prev,
                      mode: value as ProductivityMode,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona temporalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-text-secondary">
                  Semanal: columnas por día de la semana elegida. Mensual:
                  columnas por semana del mes elegido. Anual: columnas por meses
                  del año.
                </p>
              </div>

              {costCenterInputFilters.mode === "weekly" ? (
                <div className="space-y-1">
                  <Label>Semana</Label>
                  <Input
                    type="week"
                    value={costCenterInputFilters.weekValue}
                    onChange={(e) =>
                      setCostCenterInputFilters((prev) => ({
                        ...prev,
                        weekValue: e.target.value || getDefaultWeekValue(),
                      }))
                    }
                  />
                  <p className="text-xs text-text-secondary">
                    Mostrando días de la semana seleccionada.
                  </p>
                </div>
              ) : costCenterInputFilters.mode === "monthly" ? (
                <div className="space-y-1">
                  <Label>Mes</Label>
                  <Input
                    type="month"
                    value={costCenterInputFilters.monthValue}
                    onChange={(e) =>
                      setCostCenterInputFilters((prev) => ({
                        ...prev,
                        monthValue: e.target.value || getDefaultMonthValue(),
                      }))
                    }
                  />
                  <p className="text-xs text-text-secondary">
                    Columnas por semana dentro del mes seleccionado.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Label>Año</Label>
                  <Select
                    value={costCenterInputFilters.year.toString()}
                    onValueChange={(value) =>
                      setCostCenterInputFilters((prev) => ({
                        ...prev,
                        year: Number(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1 md:col-span-2 lg:col-span-2">
                <MultiSelectSearch
                  label="Centros de costo"
                  placeholder="Selecciona centros de costo"
                  value={costCenterInputFilters.centros}
                  onChange={(value) =>
                    setCostCenterInputFilters((prev) => ({
                      ...prev,
                      centros: value,
                    }))
                  }
                  options={costCenterOptions}
                  loading={isLoadingCostCenters && !costCenterData}
                />
              </div>
            </CardContent>
          </Card>

          {renderSummaryCard({
            rowsToRender: costCenterRows,
            columnsToExport: costCenterColumns,
            rangeLabel: costCenterRangeLabel,
            exportTitle: "Productividad por centro de costo",
            exportFilename: "productividad-centros",
            includeSecondary: false,
          })}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">
                {costCenterRangeLabel}
              </p>
              <p className="text-xs text-text-tertiary">
                Utilidad neta por periodo seleccionado
              </p>
            </div>
            {isFetchingCostCenters ? (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Download className="h-4 w-4 animate-spin" />
                Actualizando...
              </div>
            ) : null}
          </div>
          {isLoadingCostCenters && !costCenterData
            ? renderSkeleton()
            : renderTable({
                rowsToRender: costCenterRows,
                columnsToRender: costCenterColumns,
                primaryLabel: "Centro de costo",
              })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
