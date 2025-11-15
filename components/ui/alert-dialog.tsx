import * as React from 'react';
import { cn } from '@/lib/utils';

interface AlertDialogContextValue {
  onOpenChange?: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue>({});

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  return (
    <AlertDialogContext.Provider value={{ onOpenChange }}>
      {open ? <div>{children}</div> : null}
    </AlertDialogContext.Provider>
  );
}

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AlertDialogContent({ className, children, ...props }: ContentProps) {
  const { onOpenChange } = React.useContext(AlertDialogContext);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'z-50 my-20 w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 shadow-lg',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 flex flex-col space-y-1', className)} {...props} />
  );
}

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-6 flex items-center justify-end space-x-2', className)} {...props} />
  );
}

export function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-lg font-semibold leading-none', className)} {...props} />
  );
}

export function AlertDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-gray-600', className)} {...props} />
  );
}

export function AlertDialogAction(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white bg-black hover:bg-black/90 disabled:opacity-50',
        props.className
      )}
    />
  );
}

export function AlertDialogCancel(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { onOpenChange } = React.useContext(AlertDialogContext);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    props.onClick?.(e);
    if (!e.defaultPrevented) onOpenChange?.(false);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50',
        props.className
      )}
    />
  );
}
