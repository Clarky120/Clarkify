import { TestBed } from '@angular/core/testing';

import { SortableTableService } from './sortable-table.service';

describe('SortableTableService', () => {
  let service: SortableTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SortableTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
