import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';
const textVariants = cva('text-base text-foreground', {
  variants: {
    variant: {
      default: 'text-base sm:text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {}

const Text = ({ children, className, variant, ...props }: TextProps) => {
  return (
    <p className={cn(textVariants({ variant }), className)} {...props}>
      {children}
    </p>
  );
};

export { Text };
