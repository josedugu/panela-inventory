import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent/80 dark:bg-accent/50 animate-pulse rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function SelectSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-10 min-h-10 w-full items-center justify-between rounded-md border border-border bg-input-background px-3 py-2",
        "dark:bg-input/30 dark:border-input",
        className,
      )}
      aria-busy="true"
      {...props}
    >
      <Skeleton className="h-4 w-24 flex-1" />
      <Skeleton className="ml-3 h-4 w-4 rounded-full" />
    </div>
  );
}

function InputSearchDBSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-11 w-full items-center justify-between rounded-md border border-border bg-input-background px-3 py-2",
        "dark:bg-input/30 dark:border-input",
        "min-w-0",
        className,
      )}
      aria-busy="true"
      {...props}
    >
      <Skeleton className="h-4 w-32 flex-1" />
      <Skeleton className="ml-3 h-4 w-4 rounded-full" />
    </div>
  );
}

export { InputSearchDBSkeleton, SelectSkeleton, Skeleton };
