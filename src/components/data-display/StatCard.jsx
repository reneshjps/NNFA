import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel,
  gradient = false,
  className = '',
}) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-6 transition-all shadow-sm',
        gradient
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-600 shadow-emerald-900/20 text-white'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white',
        className
      )}
    >
      {gradient && (
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      )}
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            gradient ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
        </div>
        {Icon && (
          <div
            className={cn(
              'p-3 rounded-xl backdrop-blur-md',
              gradient
                ? 'bg-white/20 text-white border border-white/10'
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change !== undefined || changeLabel) && (
        <div className="flex items-center gap-2 mt-5 relative z-10">
          {change !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md',
                gradient ? (
                  isPositive ? 'bg-white/20 text-white' : 
                  isNegative ? 'bg-red-500/80 text-white' : 
                  'bg-white/10 text-emerald-100'
                ) : (
                  isPositive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                  isNegative ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                )
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : isNegative ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              {Math.abs(change)}%
            </span>
          )}
          {changeLabel && (
            <span className={cn(
              "text-xs font-medium",
              gradient ? "text-emerald-100/80" : "text-slate-500 dark:text-slate-400"
            )}>
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
