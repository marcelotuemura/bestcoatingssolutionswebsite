import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { fieldClassName } from '@/components/ui/Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly className?: string;
}

export function Textarea({ className, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cn(fieldClassName, 'min-h-28 py-3', className)}
      {...props}
    />
  );
}
