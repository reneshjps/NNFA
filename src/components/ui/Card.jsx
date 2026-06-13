import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Card({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'p-6',
  ...props
}) {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? { whileHover: { y: -4 }, transition: { duration: 0.2, ease: "easeOut" } } : {};

  return (
    <Component
      className={cn(
        'rounded-2xl border transition-all duration-300',
        glass
          ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/40 dark:border-slate-700/50 shadow-sm'
          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm',
        hover && 'hover:shadow-xl hover:shadow-emerald-900/5 dark:hover:shadow-emerald-900/20 cursor-pointer',
        padding,
        className
      )}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
}

function CardHeader({ children, className = '' }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

function CardTitle({ children, className = '' }) {
  return (
    <h3 className={cn('text-lg font-semibold text-slate-900 dark:text-slate-100', className)}>
      {children}
    </h3>
  );
}

function CardDescription({ children, className = '' }) {
  return (
    <p className={cn('text-sm text-slate-500 dark:text-slate-400 mt-1.5', className)}>
      {children}
    </p>
  );
}

function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

function CardFooter({ children, className = '' }) {
  return (
    <div className={cn('mt-6 pt-6 border-t border-slate-100 dark:border-slate-700', className)}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;
