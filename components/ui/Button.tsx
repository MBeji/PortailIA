"use client";
import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

const base = 'inline-flex items-center justify-center rounded font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed';
const variants: Record<string,string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-600',
  secondary: 'bg-primary-100 text-primary-700 hover:bg-primary-200 focus:ring-primary-400',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-primary-500',
  ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-primary-500'
};
const sizes: Record<string,string> = {
  sm: 'text-xs px-2.5 py-1.5',
  md: 'text-sm px-3 py-2',
  lg: 'text-sm px-4 py-2.5',
  icon: 'h-9 w-9'
};

export const Button: React.FC<ButtonProps> = ({ variant='primary', size='md', loading, className, children, ...rest }) => (
  <button className={clsx(base, variants[variant], sizes[size], className)} disabled={loading || rest.disabled} {...rest}>
    {loading && <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
    {children}
  </button>
);

export default Button;
