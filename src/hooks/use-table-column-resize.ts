"use client";

import type { ColumnSizingState } from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Debounce hook para limitar operaciones costosas
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para manejar el tamaño de columnas con persistencia en localStorage
 *
 * @param tableId Identificador único para la tabla
 * @param enableResizing Si el resize está habilitado
 * @returns Estado y setter para column sizing
 */
export function useTableColumnResize(
  tableId: string,
  enableResizing: boolean = true,
) {
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  // Track if initial load is complete
  const initialLoadComplete = useRef(false);

  // Track if user changed sizes
  const userChangedSizes = useRef(false);

  // Track previous state
  const prevSizingRef = useRef<ColumnSizingState>({});

  // Debounce para localStorage
  const debouncedColumnSizing = useDebounce(columnSizing, 300);

  // Custom setter that marks user changes
  const handleSetColumnSizing = useCallback(
    (
      newSizing:
        | ColumnSizingState
        | ((prev: ColumnSizingState) => ColumnSizingState),
    ) => {
      setColumnSizing((prev) => {
        const nextState =
          typeof newSizing === "function" ? newSizing(prev) : newSizing;

        if (
          initialLoadComplete.current &&
          JSON.stringify(nextState) !== JSON.stringify(prevSizingRef.current)
        ) {
          userChangedSizes.current = true;
          prevSizingRef.current = nextState;
        }

        return nextState;
      });
    },
    [],
  );

  // Load from localStorage on mount
  useEffect(() => {
    if (enableResizing && !initialLoadComplete.current) {
      try {
        const savedSizing = localStorage.getItem(
          `table-column-sizing-${tableId}`,
        );
        if (savedSizing) {
          const parsed = JSON.parse(savedSizing);
          setColumnSizing(parsed);
          prevSizingRef.current = parsed;
        }
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Expected error logging
        console.warn("Failed to load column sizing from localStorage:", error);
      } finally {
        initialLoadComplete.current = true;
      }
    }
  }, [tableId, enableResizing]);

  // Save to localStorage when changed (debounced)
  useEffect(() => {
    if (
      enableResizing &&
      initialLoadComplete.current &&
      userChangedSizes.current
    ) {
      try {
        localStorage.setItem(
          `table-column-sizing-${tableId}`,
          JSON.stringify(debouncedColumnSizing),
        );
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Expected error logging
        console.warn("Failed to save column sizing to localStorage:", error);
      }
    }
  }, [debouncedColumnSizing, tableId, enableResizing]);

  // Reset function
  const resetColumnSizing = useCallback(() => {
    setColumnSizing({});
    userChangedSizes.current = true;
    prevSizingRef.current = {};

    if (enableResizing) {
      try {
        localStorage.removeItem(`table-column-sizing-${tableId}`);
      } catch (error) {
        // biome-ignore lint/suspicious/noConsole: Expected error logging
        console.warn(
          "Failed to remove column sizing from localStorage:",
          error,
        );
      }
    }
  }, [enableResizing, tableId]);

  return {
    columnSizing,
    setColumnSizing: handleSetColumnSizing,
    resetColumnSizing,
  };
}
