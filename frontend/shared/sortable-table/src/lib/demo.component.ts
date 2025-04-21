import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortableTable } from './sortable-table.component';
import { ColumnDefinition, TableData } from './types';

interface DemoData {
  id: number;
  name: string;
  age: number;
  birthDate: string;
  active: boolean;
}

@Component({
  selector: 'sortable-table-demo',
  standalone: true,
  imports: [CommonModule, SortableTable],
  template: `
    <div class="demo-container">
      <h2>Sortable Table Demo</h2>

      <sortable-table [tableData]="tableData" (sortChange)="onSort($event)">
        <!-- Custom header content for the 'name' column -->
        <div header-name>
          <button (click)="onNameHeaderClick()">Custom Action</button>
        </div>

        <!-- Custom cell template for the 'name' column -->
        <ng-template #nameTemplate let-item>
          <span class="name-cell">{{ item.name }}</span>
        </ng-template>
      </sortable-table>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 20px;
      }

      .name-cell {
        font-weight: 500;
        color: #2196f3;
      }
    `,
  ],
})
export class SortableTableDemoComponent {
  tableData: TableData<DemoData> = {
    columns: [
      { key: 'id', label: 'ID', type: 'number', sortable: true, width: '80px' },
      { key: 'name', label: 'Name', type: 'text', sortable: true },
      {
        key: 'age',
        label: 'Age',
        type: 'number',
        sortable: true,
        width: '100px',
      },
      { key: 'birthDate', label: 'Birth Date', type: 'date', sortable: true },
      {
        key: 'active',
        label: 'Active',
        type: 'checkbox',
        sortable: true,
        width: '100px',
      },
    ],
    data: [
      {
        id: 1,
        name: 'John Doe',
        age: 30,
        birthDate: '1993-05-15',
        active: true,
      },
      {
        id: 2,
        name: 'Jane Smith',
        age: 25,
        birthDate: '1998-08-22',
        active: false,
      },
      {
        id: 3,
        name: 'Bob Johnson',
        age: 45,
        birthDate: '1978-03-10',
        active: true,
      },
      {
        id: 4,
        name: 'Alice Brown',
        age: 28,
        birthDate: '1995-11-05',
        active: true,
      },
    ],
  };

  onSort(event: any) {
    console.log('Sort changed:', event);
  }

  onNameHeaderClick() {
    console.log('Custom name header action clicked');
  }
}
