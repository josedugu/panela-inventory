"use client";

import { useMemo, useState } from "react";
import type {
  EntityFilterDescriptor,
  EntityFilterOption,
  EntityTableFilterState,
} from "../types";

interface UseEntityFiltersOptions {
  filters: EntityFilterDescriptor[];
  initialState?: EntityTableFilterState;
  initialSearch?: string;
}

export function useEntityFilters({
  filters,
  initialState,
  initialSearch = "",
}: UseEntityFiltersOptions) {
  const [search, setSearch] = useState(initialSearch);
  const [filterState, setFilterState] = useState<EntityTableFilterState>(
    initialState ?? {},
  );
  const [pendingFilterState, setPendingFilterState] =
    useState<EntityTableFilterState>(filterState);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const filtersKey = useMemo(() => JSON.stringify(filterState), [filterState]);

  const activeFiltersCount = useMemo(
    () => Object.values(filterState).filter(Boolean).length,
    [filterState],
  );

  const normalizedOptions = useMemo(() => {
    const result: Record<string, EntityFilterOption[]> = {};

    for (const descriptor of filters) {
      if (descriptor.type && descriptor.type === "custom") continue;

      const inputDescriptor = descriptor;
      if (Array.isArray(inputDescriptor.options)) {
        result[inputDescriptor.key] = inputDescriptor.options;
      }
    }

    return result;
  }, [filters]);

  const setPendingFilterValue = (key: string, value: string | undefined) => {
    setPendingFilterState((prev) => {
      const next = { ...prev };
      if (!value) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const applyFilters = () => {
    setFilterState(pendingFilterState);
    setDialogOpen(false);
  };

  const resetPendingFilters = () => {
    setPendingFilterState({});
  };

  const clearFilters = () => {
    setFilterState({});
    setPendingFilterState({});
  };

  return {
    search,
    setSearch,
    filterState,
    setFilterState,
    pendingFilterState,
    setPendingFilterState,
    setPendingFilterValue,
    isDialogOpen,
    setDialogOpen,
    applyFilters,
    resetPendingFilters,
    clearFilters,
    filtersKey,
    activeFiltersCount,
    normalizedOptions,
  };
}
