import { classNames } from '../../utils/helpers';

export default function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
      <table className={classNames('w-full text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

function TableHeader({ children, className = '' }) {
  return (
    <thead className={classNames('bg-gray-50 dark:bg-slate-800/50', className)}>
      {children}
    </thead>
  );
}

function TableBody({ children, className = '' }) {
  return (
    <tbody className={classNames('divide-y divide-gray-100 dark:divide-slate-700', className)}>
      {children}
    </tbody>
  );
}

function TableRow({ children, className = '', onClick }) {
  return (
    <tr
      className={classNames('table-row-hover', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

function TableHead({ children, className = '', sortable, sorted, direction, onSort }) {
  return (
    <th
      className={classNames(
        'px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        sortable && 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200',
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {sortable && sorted && (
          <span className="text-green-600 dark:text-green-400">
            {direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );
}

function TableCell({ children, className = '' }) {
  return (
    <td className={classNames('px-4 py-3.5 text-gray-700 dark:text-gray-300', className)}>
      {children}
    </td>
  );
}

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
