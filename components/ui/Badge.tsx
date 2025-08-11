import React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  rounded?: boolean;
}

const styles: Record<string,string> = {
  default: 'bg-primary-100 text-primary-700 border border-primary-200',
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border border-amber-200',
  danger: 'bg-red-100 text-red-700 border border-red-200',
  info: 'bg-sky-100 text-sky-700 border border-sky-200',
  neutral: 'bg-gray-100 text-gray-700 border border-gray-200'
};

export const Badge: React.FC<BadgeProps> = ({ variant='default', rounded=false, className, children, ...rest }) => (
  <span className={clsx('inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', styles[variant], rounded ? 'rounded-full' : 'rounded', className)} {...rest}>{children}</span>
);

export default Badge;
