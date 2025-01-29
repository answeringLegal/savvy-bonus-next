'use client';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React from 'react';

type LogoImage = Omit<typeof Image, 'alt' | 'src' | 'width' | 'height'>;
interface LogoProps {
  className?: string;
  imageProps?: LogoImage;
}
export const Logo = ({ className, ...props }: LogoProps) => {
  const theme = useTheme();

  return (
    <Image
      className={cn(
        'absolute top-[calc(50vh-275px)] left-1/2 -translate-x-1/2 -translate-y-1/2',
        className
      )}
      {...props}
      src={`/logo-${theme.resolvedTheme === 'light' ? 'light' : 'dark'}.png`}
      alt='logo'
      width={100}
      height={100}
    />
  );
};
