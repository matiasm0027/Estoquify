import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenceHistoryComponent } from './incidences-history.component';


describe('IncidenceHistoryComponent', () => {
  let component: IncidenceHistoryComponent;
  let fixture: ComponentFixture<IncidenceHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenceHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidenceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
