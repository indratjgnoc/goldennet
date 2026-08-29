'use client';

import Link from 'next/link';

import Button, {
  type ButtonProps,
} from '@mui/material/Button';

type LinkButtonProps = Omit<ButtonProps, 'href' | 'component'> & {
  href: string;
  component?: React.ElementType;
};

export default function LinkButton({
  href,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Button
      {...props}
      component={Link as React.ElementType}
      href={href}
    >
      {children}
    </Button>
  );
}