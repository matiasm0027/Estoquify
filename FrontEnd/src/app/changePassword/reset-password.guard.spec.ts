import { TestBed } from '@angular/core/testing';

import { resetPasswordGuard } from './reset-password.guard';

describe('resetPasswordGuard', () => {
  let guard: resetPasswordGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(resetPasswordGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
