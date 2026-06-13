import { classNames } from '../../utils/helpers';

export default function LoadingSkeleton({ type = 'card', count = 1, className = '' }) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className={classNames('grid gap-6', className)}>
        {skeletons.map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="skeleton-pulse h-4 w-24" />
                <div className="skeleton-pulse h-8 w-32" />
              </div>
              <div className="skeleton-pulse h-12 w-12 rounded-xl" />
            </div>
            <div className="skeleton-pulse h-4 w-40 mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={classNames('space-y-3', className)}>
        {/* Header */}
        <div className="flex gap-4 px-4 py-3">
          {[100, 150, 120, 80, 100].map((w, i) => (
            <div key={i} className="skeleton-pulse h-4" style={{ width: `${w}px` }} />
          ))}
        </div>
        {/* Rows */}
        {skeletons.map((i) => (
          <div
            key={i}
            className="flex gap-4 px-4 py-4 border-t border-gray-100 dark:border-slate-700"
          >
            <div className="skeleton-pulse h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-pulse h-4 w-3/4" />
              <div className="skeleton-pulse h-3 w-1/2" />
            </div>
            <div className="skeleton-pulse h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className={classNames('space-y-6', className)}>
        {skeletons.map((i) => (
          <div key={i} className="space-y-4">
            <div className="skeleton-pulse h-4 w-20" />
            <div className="skeleton-pulse h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className={classNames('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {skeletons.map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="skeleton-pulse h-4 w-24" />
                <div className="skeleton-pulse h-8 w-20" />
              </div>
              <div className="skeleton-pulse h-12 w-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
