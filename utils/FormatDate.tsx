import { parseISO, format } from 'date-fns';
import es from 'date-fns/locale/es';

export default function FormatDate({ dateString }) {
  const date = parseISO(dateString);
  const locale = es;
  return <time dateTime={dateString}>{format(date, 'd MMMM yyyy', { locale })}</time>;
  
}