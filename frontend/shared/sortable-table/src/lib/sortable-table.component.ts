import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColumnDefinition, ColumnType, SortEvent, TableData } from './types';

@Component({
  selector: 'sortable-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <ng-container *ngFor="let column of tableData.columns">
              <th [style.width]="column.width">
                <div class="header-content">
                  <span>{{ column.label }}</span>
                  <div class="header-actions">
                    <ng-content
                      [select]="'[header-' + column.key + ']'"
                    ></ng-content>
                    @if (column.sortable !== false) {
                      <button
                        class="sort-button"
                        (click)="onSort(column.key)"
                        [class.active]="currentSort?.column === column.key"
                      >
                        <span
                          class="sort-icon"
                          [class.desc]="currentSort?.direction === 'desc'"
                          >↑</span
                        >
                      </button>
                    }
                  </div>
                </div>
              </th>
            </ng-container>
          </tr>
        </thead>
        <tbody>
          @for (item of sortedData; track item) {
            <tr>
              @for (column of tableData.columns; track column.key) {
                <td>
                  @if (columnTemplates[column.key]) {
                    <ng-container
                      *ngTemplateOutlet="
                        columnTemplates[column.key];
                        context: { $implicit: item }
                      "
                    ></ng-container>
                  } @else {
                    @switch (column.type) {
                      @case ('text') {
                        {{ getValue(item, column.key) }}
                      }
                      @case ('number') {
                        {{ getValue(item, column.key) | number }}
                      }
                      @case ('date') {
                        {{ getValue(item, column.key) | date: 'medium' }}
                      }
                      @case ('checkbox') {
                        <input
                          type="checkbox"
                          [checked]="getValue(item, column.key)"
                          disabled
                        />
                      }
                    }
                  }
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .table-container {
        width: 100%;
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }

      th,
      td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      th {
        background-color: #f5f5f5;
        font-weight: 500;
        color: #333;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .sort-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        transition: color 0.2s;

        &:hover {
          color: #333;
        }

        &.active {
          color: #2196f3;
        }
      }

      .sort-icon {
        font-size: 12px;
        transition: transform 0.2s;

        &.desc {
          transform: rotate(180deg);
        }
      }

      tbody tr {
        &:hover {
          background-color: #f9f9f9;
        }
      }
    `,
  ],
})
export class SortableTable<T extends Record<string, any>> {
  @Input({ required: true }) tableData!: TableData<T>;
  @Output() sortChange = new EventEmitter<SortEvent>();

  currentSort: SortEvent | null = null;
  sortedData: T[] = [];
  columnTemplates: { [key: string]: TemplateRef<any> } = {};

  @ContentChild('textTemplate') textTemplate?: TemplateRef<any>;
  @ContentChild('numberTemplate') numberTemplate?: TemplateRef<any>;
  @ContentChild('dateTemplate') dateTemplate?: TemplateRef<any>;
  @ContentChild('checkboxTemplate') checkboxTemplate?: TemplateRef<any>;

  ngOnInit() {
    this.sortedData = [...this.tableData.data];
  }

  ngOnChanges() {
    this.sortedData = [...this.tableData.data];
    this.sortData();
  }

  onSort(column: string) {
    if (this.currentSort?.column === column) {
      this.currentSort.direction =
        this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort = { column, direction: 'asc' };
    }

    this.sortData();
    this.sortChange.emit(this.currentSort);
  }

  private sortData() {
    if (!this.currentSort) return;

    const column = this.currentSort.column;
    const direction = this.currentSort.direction;

    this.sortedData.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  getValue(item: T, key: string): any {
    return item[key];
  }

  registerColumnTemplate(key: string, template: TemplateRef<any>) {
    this.columnTemplates[key] = template;
  }
}
