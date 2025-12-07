import {
  type ParserBuilder,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";

interface UseDataTableParamsOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  defaultSort?: string;
  extraParsers?: Record<string, ParserBuilder<unknown>>;
}

export function useDataTableParams({
  defaultPage = 1,
  defaultPageSize = 10,
  defaultSort = "createdAt.desc",
}: UseDataTableParamsOptions = {}) {
  // Paginación
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(defaultPage),
  );
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(defaultPageSize),
  );

  // Sorting: "field.direction" (e.g. "name.asc")
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault(defaultSort),
  );

  // Search query
  const [q, setQ] = useQueryState("q", parseAsString.withDefault(""));

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    sort,
    setSort,
    q,
    setQ,
  };
}
