"use client";

import { useCallback, useMemo, useState } from "react";

import { useEntityFilters } from "@/features/entity-table/hooks/use-entity-filters";
import type {
  EntityFilterDescriptor,
  EntityTableFilterState,
} from "@/features/entity-table/types";

interface UseMasterDataTableOptions<T> {
  items: T[];
  filters?: EntityFilterDescriptor[];
  searchableFields?: Array<(item: T) => string | null | undefined>;
}

interface UseMasterDataTableResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  setSearch: (value: string) => void;
  filters: EntityFilterDescriptor[];
  filterState: EntityTableFilterState;
  setFilterState: (next: EntityTableFilterState) => void;
  pendingFilterState: EntityTableFilterState;
  setPendingFilterState: (next: EntityTableFilterState) => void;
  handleApplyFilters: () => void;
  handleResetPendingFilters: () => void;
  handleClearFilters: () => void;
  isFilterDialogOpen: boolean;
  setFilterDialogOpen: (open: boolean) => void;
  filterOptions: Record<string, { label: string; value: string }[]>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function useMasterDataTable<T>({
  items,
  filters = [],
  searchableFields = [],
}: UseMasterDataTableOptions<T>): UseMasterDataTableResult<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    search,
    setSearch,
    filterState,
    setFilterState,
    pendingFilterState,
    setPendingFilterState,
    applyFilters,
    resetPendingFilters,
    clearFilters,
    isDialogOpen,
    setDialogOpen,
    normalizedOptions,
  } = useEntityFilters({
    filters,
  });

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch || searchableFields.length === 0) {
      return items;
    }

    return items.filter((item) =>
      searchableFields.some((selector) => {
        const value = selector(item);
        if (!value) return false;
        return value.toLowerCase().includes(normalizedSearch);
      }),
    );
  }, [items, search, searchableFields]);

  const totalItems = filteredItems.length;
  const safePageSize = Math.max(pageSize, 1);
  const totalPages =
    totalItems === 0 ? 1 : Math.ceil(totalItems / safePageSize);
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    if (totalItems === 0) return [];
    const start = (currentPage - 1) * safePageSize;
    return filteredItems.slice(start, start + safePageSize);
  }, [currentPage, filteredItems, safePageSize, totalItems]);

  const handleApplyFilters = useCallback(() => {
    applyFilters();
    setPage(1);
  }, [applyFilters]);

  const handleResetPendingFilters = useCallback(() => {
    resetPendingFilters();
  }, [resetPendingFilters]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    setPage(1);
  }, [clearFilters]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const safeTotalPages =
        totalItems === 0 ? 1 : Math.ceil(totalItems / safePageSize);
      const clamped = Math.max(1, Math.min(nextPage, safeTotalPages));
      setPage(clamped);
    },
    [safePageSize, totalItems],
  );

  const handlePageSizeChange = useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  }, []);

  return {
    data: paginatedItems,
    total: totalItems,
    page: currentPage,
    pageSize,
    search,
    setSearch,
    filters,
    filterState,
    setFilterState,
    pendingFilterState,
    setPendingFilterState,
    handleApplyFilters,
    handleResetPendingFilters,
    handleClearFilters,
    isFilterDialogOpen: isDialogOpen,
    setFilterDialogOpen: setDialogOpen,
    filterOptions: normalizedOptions,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };
}
