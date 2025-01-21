'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {}

const StyledNavLink: React.FC<NavLinkProps> = (props) => {
  const pathname = usePathname();
  return (
    // <Link
    //   {...props}
    //   className={({ isActive }) => `
    //   ${isActive ? 'text-foreground bg-accent' : 'text-foreground/50'} ${cn(
    //     props.className,
    //     'hover:bg-accent/20 transition-colors duration-200 ease-in-out'
    //   )}`}
    // />
    <Link
      {...props}
      className={cn(
        '',
        {
          'text-foreground bg-accent': pathname === props.href,
          'text-foreground/50': pathname !== props.href,
          'hover:bg-accent/20 transition-colors duration-200 ease-in-out': true,
        },
        props.className
      )}
    />
  );
};

export default StyledNavLink;
