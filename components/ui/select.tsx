import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectContextValue {
  open: boolean;
  value: string | undefined;
  label: React.ReactNode | undefined;
  setOpen: (v: boolean) => void;
  setValue: (v: string | undefined) => void;
  setLabel: (l: React.ReactNode | undefined) => void;
  onValueChange?: (v: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value: controlledValue, defaultValue, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string | undefined>(controlledValue ?? defaultValue);
  const [label, setLabel] = React.useState<React.ReactNode | undefined>(undefined);

  // Sync internal value when controlled value changes
  React.useEffect(() => {
    if (controlledValue !== undefined) setValue(controlledValue);
  }, [controlledValue]);

  return (
    <SelectContext.Provider
      value={{ open, value, label, setOpen, setValue, setLabel, onValueChange }}
    >
      <div className="relative inline-block">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        'inline-flex items-center justify-between w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;
  const display = (ctx.label ?? (ctx.value ?? '')) || placeholder;
  return <span>{display}</span>;
}

export function SelectContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  if (!ctx.open) return null;

  return (
    <div className={cn('absolute right-0 z-50 mt-2 w-56 rounded-md bg-white shadow-lg', className)}>
      <div role="listbox" className="max-h-60 overflow-auto">
        {React.Children.map(children, (child) => child)}
      </div>
    </div>
  );
}

export function SelectItem({ value, children, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    ctx.setValue(value);
    ctx.setLabel(children);
    ctx.setOpen(false);
    ctx.onValueChange?.(value);
  };

  const isSelected = ctx.value === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      className={cn(
        'cursor-pointer px-3 py-2 text-sm hover:bg-gray-100',
        isSelected ? 'bg-gray-100 font-medium' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
