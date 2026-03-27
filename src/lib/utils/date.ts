export type DueDateStatus = 'overdue' | 'today' | 'soon' | 'future' | 'none';

export function getDueDateStatus(dueDate?: string): DueDateStatus {
  if (!dueDate) return 'none';
  const now = new Date();
  const due = new Date(dueDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffMs = dueDay.getTime() - today.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffMs < 0) return 'overdue';
  if (diffMs === 0) return 'today';
  if (diffHours <= 48) return 'soon';
  return 'future';
}

export function formatDueDate(dueDate?: string, locale?: string): string {
  if (!dueDate) return '';
  const due = new Date(dueDate);
  return due.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}
