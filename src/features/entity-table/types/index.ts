import type { ColumnDef } from "@tanstack/react-table";
import type React from "react";

export type EntityStatus = "default" | "success" | "warning" | "danger";

export interface EntityFilterOption {
  label: string;
  value: string;
}

export type EntityFilterValue = string | undefined;

export type EntityFilterType = "input-search" | "custom";

export interface EntityFilterDescriptorBase {
  key: string;
  label: string;
  type?: EntityFilterType;
  maxOptions?: number;
}

export interface EntityInputSearchFilterDescriptor
  extends EntityFilterDescriptorBase {
  type?: "input-search";
  loadOptions?: () => Promise<EntityFilterOption[]> | EntityFilterOption[];
  options?: EntityFilterOption[];
}

export interface EntityCustomFilterDescriptor
  extends EntityFilterDescriptorBase {
  type: "custom";
  render?: (props: {
    value: EntityFilterValue;
    onChange: (value: EntityFilterValue) => void;
  }) => React.ReactNode;
}

export type EntityFilterDescriptor =
  | EntityInputSearchFilterDescriptor
  | EntityCustomFilterDescriptor;

export interface EntityTableFilterState {
  [key: string]: EntityFilterValue;
}

export interface EntityTableConfig<TData> {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  filterDialogTitle?: string;
  filterDialogDescription?: string;
  addAction?: {
    label: string;
    onClick: () => void;
  };
  exportAction?: {
    label?: string;
    onClick: () => void;
  };
  columns: ColumnDef<TData, unknown>[];
  onView?: (row: TData) => void;
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onDuplicate?: (row: TData) => void;
  getRowId?: (row: TData) => string;
}

export interface EntityTableLayoutProps<TData> {
  config: EntityTableConfig<TData>;
  data: TData[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters: EntityFilterDescriptor[];
  filterState: EntityTableFilterState;
  onFilterStateChange: (next: EntityTableFilterState) => void;
  pendingFilterState: EntityTableFilterState;
  onPendingFilterStateChange: (next: EntityTableFilterState) => void;
  onApplyFilters: () => void;
  onResetPendingFilters: () => void;
  onClearFilters: () => void;
  isFilterDialogOpen: boolean;
  setFilterDialogOpen: (open: boolean) => void;
  filterOptions: Record<string, EntityFilterOption[]>;
  isLoadingFilterOptions?: boolean;
  renderExtraContent?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  searchContainerClassName?: string;
  filterTriggerClassName?: string;
  filtersChipsWrapperClassName?: string;
}
