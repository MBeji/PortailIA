import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ padded=true, hover=true, className, children, ...rest }) => (
  <div className={clsx('rounded border bg-white shadow-sm', padded && 'p-4', hover && 'transition hover:shadow-md', className)} {...rest}>{children}</div>
);

export default Card;
