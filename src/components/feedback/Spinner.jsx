import { Loader2 } from 'lucide-react';
import { classNames } from '../../utils/helpers';

export default function Spinner({ size = 'md', className = '', label }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={classNames('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={classNames('animate-spin text-green-600 dark:text-green-400', sizes[size])} />
      {label && (
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{label}</p>
      )}
    </div>
  );
}

// Full page spinner
Spinner.FullPage = function FullPageSpinner({ label = 'Loading...' }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50">
      <Spinner size="xl" label={label} />
    </div>
  );
};
