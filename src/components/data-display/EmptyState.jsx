import { FileX } from 'lucide-react';
import { classNames } from '../../utils/helpers';

export default function EmptyState({
  icon: Icon = FileX,
  title = 'No data found',
  description = 'There are no records to display.',
  action,
  className = '',
}) {
  return (
    <div className={classNames('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="p-4 rounded-full bg-gray-100 dark:bg-slate-800 mb-4">
        <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
