"use client";

import {
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "./utils";

type SelectContextValue = {
  value?: string;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  registerItem: (value: string, label: string) => void;
  getLabel: (value?: string) => string | undefined;
  placeholder?: string;
  disabled?: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext(component: string): SelectContextValue {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(`${component} must be used within a Select component`);
  }
  return context;
}

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  children: ReactNode;
  name?: string;
  required?: boolean;
}

function Select({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled,
  children,
  name,
  required,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );
  const labelsRef = useRef(new Map<string, string>());
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isControlled) {
      setInternalValue(value);
    }
  }, [isControlled, value]);

  const setValue = useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
      setOpen(false);
    },
    [isControlled, onValueChange],
  );

  const registerItem = useCallback((key: string, label: string) => {
    labelsRef.current.set(key, label);
  }, []);

  const getLabel = useCallback((key?: string) => {
    if (!key) return undefined;
    return labelsRef.current.get(key) ?? key;
  }, []);

  const contextValue = useMemo<SelectContextValue>(
    () => ({
      value: isControlled ? value : internalValue,
      setValue,
      open,
      setOpen,
      registerItem,
      getLabel,
      placeholder,
      disabled,
      triggerRef,
    }),
    [
      disabled,
      getLabel,
      internalValue,
      isControlled,
      open,
      placeholder,
      registerItem,
      setValue,
      value,
    ],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div className="relative inline-flex w-full flex-col">
        {name ? (
          <input
            type="hidden"
            name={name}
            value={contextValue.value ?? ""}
            required={required}
          />
        ) : null}
        {children}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps
  extends Omit<ComponentProps<"button">, "onChange"> {
  size?: "sm" | "default";
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectTriggerProps) {
  const context = useSelectContext("SelectTrigger");

  const handleClick = () => {
    if (context.disabled) return;
    context.setOpen(!context.open);
  };

  return (
    <button
      type="button"
      ref={context.triggerRef}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      data-state={context.open ? "open" : "closed"}
      aria-haspopup="listbox"
      aria-expanded={context.open}
      aria-disabled={context.disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-4 opacity-50" />
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

function SelectValue({ placeholder, className }: SelectValueProps) {
  const context = useSelectContext("SelectValue");
  const selectedLabel = context.getLabel(context.value);
  const content =
    selectedLabel ?? placeholder ?? context.placeholder ?? undefined;

  return (
    <span
      data-slot="select-value"
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 truncate",
        className,
      )}
    >
      {content ?? ""}
    </span>
  );
}

interface SelectContentProps extends ComponentProps<"div"> {
  position?: "popper" | "item-aligned";
  side?: "top" | "bottom";
}

function SelectContent({
  className,
  children,
  position = "popper",
  side = "bottom",
  ...props
}: SelectContentProps) {
  const context = useSelectContext("SelectContent");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!context.open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !context.triggerRef.current?.contains(target) &&
        !contentRef.current?.contains(target)
      ) {
        context.setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [context]);

  if (!context.open) {
    return null;
  }

  const triggerRect = context.triggerRef.current?.getBoundingClientRect();
  const minWidth =
    triggerRect?.width !== undefined ? `${triggerRect.width}px` : undefined;

  const sideClass = side === "top" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div
      ref={contentRef}
      data-slot="select-content"
      className={cn(
        "bg-popover text-popover-foreground absolute z-40 max-h-60 min-w-[8rem] overflow-auto rounded-md border shadow-md focus:outline-none",
        sideClass,
        position === "popper" ? "left-0" : "",
        className,
      )}
      style={{ minWidth }}
      role="listbox"
      {...props}
    >
      {children}
    </div>
  );
}

interface SelectGroupProps {
  children: ReactNode;
  className?: string;
}

function SelectGroup({ children, className }: SelectGroupProps) {
  return (
    <div data-slot="select-group" className={cn("p-1 space-y-1", className)}>
      {children}
    </div>
  );
}

interface SelectLabelProps {
  children: ReactNode;
  className?: string;
}

function SelectLabel({ children, className }: SelectLabelProps) {
  return (
    <div
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
    >
      {children}
    </div>
  );
}

interface SelectItemProps extends ComponentProps<"button"> {
  value: string;
  children: ReactNode;
}

function SelectItem({ value, children, className, ...props }: SelectItemProps) {
  const context = useSelectContext("SelectItem");
  const label = useMemo(() => {
    if (typeof children === "string") return children;
    const stringChildren = Children.toArray(children).filter(
      (child): child is string => typeof child === "string",
    );
    if (stringChildren.length === 0) {
      return value;
    }
    return stringChildren.join(" ");
  }, [children, value]);

  useEffect(() => {
    context.registerItem(value, label);
  }, [context, label, value]);

  const isSelected = context.value === value;

  return (
    <button
      type="button"
      role="option"
      data-slot="select-item"
      data-state={isSelected ? "checked" : "unchecked"}
      aria-selected={isSelected}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      onClick={() => context.setValue(value)}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        {isSelected ? <CheckIcon className="size-4" /> : null}
      </span>
      <span>{children}</span>
    </button>
  );
}

interface SelectSeparatorProps {
  className?: string;
}

function SelectSeparator({ className }: SelectSeparatorProps) {
  return (
    <div
      data-slot="select-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
    />
  );
}

// Scroll buttons are no-ops in the custom implementation but kept for API parity
function SelectScrollUpButton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="select-scroll-up-button"
      className={cn("hidden", className)}
      {...props}
    />
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      data-slot="select-scroll-down-button"
      className={cn("hidden", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
