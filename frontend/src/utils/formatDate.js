import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date) => {
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, 'dd MMM yyyy', { locale: fr });
};

export const formatDateRange = (start, end) => {
  return `${formatDate(start)} - ${formatDate(end)}`;
};
