import { TestBed } from '@angular/core/testing';

import { UsuariosControlService } from './usuarios-control.service';

describe('UsuariosControlService', () => {
  let service: UsuariosControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuariosControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
