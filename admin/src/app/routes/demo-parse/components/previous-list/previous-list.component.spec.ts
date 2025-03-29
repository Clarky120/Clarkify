import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousListComponent } from './previous-list.component';

describe('PreviousListComponent', () => {
  let component: PreviousListComponent;
  let fixture: ComponentFixture<PreviousListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviousListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
