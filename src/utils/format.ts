export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 10) return dateStr;
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function formatDateTime(isoStr: string): string {
  const date = new Date(isoStr);
  const day     = String(date.getUTCDate()).padStart(2, '0');
  const month   = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year    = date.getUTCFullYear();
  const hours   = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function monthLabel(dateStr: string): string {
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const monthIndex = parseInt(dateStr.slice(5, 7), 10) - 1;
  const year = dateStr.slice(0, 4);
  return `${months[monthIndex]}/${year.slice(2)}`;
}

export function firstDayOfMonth(): string {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

export function today(): string {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function monthsAgo(n: number): string {
  const now = new Date();
  now.setMonth(now.getMonth() - n);
  now.setDate(1);
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR');
}
