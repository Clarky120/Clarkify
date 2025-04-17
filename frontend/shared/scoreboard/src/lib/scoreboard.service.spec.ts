import { TestBed } from '@angular/core/testing';

import { ScoreboardService } from './scoreboard.service';

describe('ScoreboardService', () => {
  let service: ScoreboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoreboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
