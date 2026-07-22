import { cn } from '@/utils/cn';

export interface DividerProps {
  readonly className?: string;
}

export function Divider({ className }: DividerProps) {
  return (
    <hr
      className={cn('border-navy-700 border-0 border-t', className)}
      role="presentation"
    />
  );
}
