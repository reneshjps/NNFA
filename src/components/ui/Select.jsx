import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(
  (
    {
      label,
      error,
      options = [],
      placeholder = 'Select an option',
      className = '',
      containerClassName = '',
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={cn(
              'w-full rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-200 outline-none shadow-sm pl-4 pr-10 py-2.5 text-sm appearance-none cursor-pointer',
              error
                ? 'border-red-500 focus:ring-4 focus:ring-red-500/10 focus:border-red-500'
                : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300 dark:hover:border-slate-600',
              className
            )}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option
                key={typeof opt === 'object' ? opt.value : opt}
                value={typeof opt === 'object' ? opt.value : opt}
              >
                {typeof opt === 'object' ? opt.label : opt}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
