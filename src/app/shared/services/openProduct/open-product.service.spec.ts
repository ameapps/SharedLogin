import { TestBed } from '@angular/core/testing';
import { OpenProductService } from './open-product.service';


describe('OpenProductService', () => {
  let service: OpenProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
