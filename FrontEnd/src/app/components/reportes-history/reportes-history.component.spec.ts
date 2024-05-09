import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesHistoryComponent } from './reportes-history.component';

describe('ReportesHistoryComponent', () => {
  let component: ReportesHistoryComponent;
  let fixture: ComponentFixture<ReportesHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportesHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
