import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesViewComponent } from './categories-view.component';

describe('CategoriesViewComponent', () => {
  let component: CategoriesViewComponent;
  let fixture: ComponentFixture<CategoriesViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategoriesViewComponent]
    });
    fixture = TestBed.createComponent(CategoriesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
