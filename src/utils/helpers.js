import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date, format = 'DD MMM YYYY') => {
  if (!date) return '—';
  return dayjs(date).format(format);
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return dayjs(date).format('DD MMM YYYY, hh:mm A');
};

export const formatRelativeTime = (date) => {
  if (!date) return '—';
  return dayjs(date).fromNow();
};

export const isExpired = (date) => {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs());
};

export const daysUntilExpiry = (date) => {
  if (!date) return 0;
  return dayjs(date).diff(dayjs(), 'day');
};

export const generateMemberId = (lastId) => {
  if (!lastId) return 'NNFA-0001';
  const numStr = lastId.replace('NNFA-', '');
  const nextNum = parseInt(numStr, 10) + 1;
  return `NNFA-${String(nextNum).padStart(4, '0')}`;
};

export const truncateText = (text, maxLength = 30) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'badge-active';
    case 'expired':
      return 'badge-expired';
    case 'suspended':
      return 'badge-suspended';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
