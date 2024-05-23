import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenceViewComponent } from './incidences-view.component';


describe('IncidenceViewComponent', () => {
  let component: IncidenceViewComponent;
  let fixture: ComponentFixture<IncidenceViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IncidenceViewComponent]
    });
    fixture = TestBed.createComponent(IncidenceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
