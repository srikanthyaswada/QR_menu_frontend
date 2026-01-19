import { TestBed } from '@angular/core/testing';

import { QrmenuService } from './qrmenu.service';

describe('QrmenuService', () => {
  let service: QrmenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QrmenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
