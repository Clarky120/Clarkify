import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoParseComponent } from './demo-parse.component';

describe('DemoParseComponent', () => {
  let component: DemoParseComponent;
  let fixture: ComponentFixture<DemoParseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoParseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DemoParseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
