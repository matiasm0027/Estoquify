import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesViewComponent } from './employees-view.component';

describe('EmployeeViewComponent', () => {
  let component: EmployeesViewComponent;
  let fixture: ComponentFixture<EmployeesViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeesViewComponent]
    });
    fixture = TestBed.createComponent(EmployeesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
