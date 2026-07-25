import { Test, TestingModule } from '@nestjs/testing';
import { ContractController } from '../contract.controller';
import { ContractService } from '../contract.service';
import { CreateContractDto } from '../dto/contract.dto';

describe('ContractController', () => {
  let controller: ContractController;
  let service: ContractService;

  const mockContractService = {
    createContract: jest.fn(),
    findByTenant: jest.fn(),
    findByLandlord: jest.fn(),
    approveContract: jest.fn(),
    rejectContract: jest.fn(),
    terminateContract: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractController],
      providers: [
        {
          provide: ContractService,
          useValue: mockContractService,
        },
      ],
    }).compile();

    controller = module.get<ContractController>(ContractController);
    service = module.get<ContractService>(ContractService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a contract request successfully when user has id property', async () => {
      const dto: CreateContractDto = {
        roomId: 9,
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-08-01'),
      };
      const req = { user: { id: 8 } };
      const expectedResult = { id: 1, tenantId: 8, roomId: 9, status: 'Pending' };

      mockContractService.createContract.mockResolvedValue(expectedResult);

      const result = await controller.create(req, dto);

      expect(result).toEqual(expectedResult);
      expect(service.createContract).toHaveBeenCalledWith(8, dto);
    });

    it('should fallback to sub if user id is undefined', async () => {
      const dto: CreateContractDto = {
        roomId: 9,
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-08-01'),
      };
      const req = { user: { sub: 8 } }; // Dùng 'sub' thay vì 'id'
      const expectedResult = { id: 1, tenantId: 8, roomId: 9, status: 'Pending' };

      mockContractService.createContract.mockResolvedValue(expectedResult);

      const result = await controller.create(req, dto);

      expect(result).toEqual(expectedResult);
      expect(service.createContract).toHaveBeenCalledWith(8, dto);
    });
  });

  describe('getTenantContracts', () => {
    it('should return list of contracts for tenant', async () => {
      const req = { user: { id: 8 } };
      const expectedContracts = [{ id: 1, tenantId: 8, roomId: 9 }];
      mockContractService.findByTenant.mockResolvedValue(expectedContracts);

      const result = await controller.getTenantContracts(req);

      expect(result).toEqual(expectedContracts);
      expect(service.findByTenant).toHaveBeenCalledWith(8);
    });
  });

  describe('approve', () => {
    it('should approve contract successfully when requested by valid landlord', async () => {
      const contractId = 1;
      const req = { user: { id: 2 } }; // Landlord ID
      const expectedResult = { id: 1, status: 'Approved' };

      mockContractService.approveContract.mockResolvedValue(expectedResult);

      const result = await controller.approve(contractId, req);

      expect(result).toEqual(expectedResult);
      expect(service.approveContract).toHaveBeenCalledWith(contractId, 2);
    });
  });

  describe('reject', () => {
    it('should reject contract successfully', async () => {
      const contractId = 1;
      const req = { user: { id: 2 } };
      const expectedResult = { id: 1, status: 'Rejected' };

      mockContractService.rejectContract.mockResolvedValue(expectedResult);

      const result = await controller.reject(contractId, req);

      expect(result).toEqual(expectedResult);
      expect(service.rejectContract).toHaveBeenCalledWith(contractId, 2);
    });
  });
});