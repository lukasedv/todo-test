export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  order?: number;
}

export type Filter = 'all' | 'active' | 'completed';
export type SortBy = 'createdAt' | 'dueDate' | 'priority' | 'title' | 'manual';
export type Priority = 'low' | 'medium' | 'high';
