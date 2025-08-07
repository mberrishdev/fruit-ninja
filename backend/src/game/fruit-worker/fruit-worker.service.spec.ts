import { Test, TestingModule } from '@nestjs/testing';
import { FruitWorkerService } from './fruit-worker.service';

describe('FruitWorkerService', () => {
  let service: FruitWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FruitWorkerService],
    }).compile();

    service = module.get<FruitWorkerService>(FruitWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
