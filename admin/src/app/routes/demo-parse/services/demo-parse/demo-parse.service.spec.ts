import { TestBed } from '@angular/core/testing';

import { DemoParseService } from './demo-parse.service';

describe('DemoParseService', () => {
  let service: DemoParseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemoParseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
