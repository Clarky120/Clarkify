export type ColumnType = 'text' | 'number' | 'date' | 'checkbox';

export interface ColumnDefinition<T = any> {
  key: string;
  label: string;
  type: ColumnType;
  sortable?: boolean;
  width?: string;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

export interface TableData<T = any> {
  columns: ColumnDefinition<T>[];
  data: T[];
}
