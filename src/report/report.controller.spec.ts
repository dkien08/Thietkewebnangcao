import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

describe('ReportController', () => {
  let controller: ReportController;
  let service: ReportService;

  const mockReportService = {
    getLandlordReport: jest.fn(),
    getAdminReport: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        {
          provide: ReportService,
          useValue: mockReportService,
        },
      ],
    }).compile();

    controller = module.get<ReportController>(ReportController);
    service = module.get<ReportService>(ReportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLandlordReport (F16)', () => {
    it('nên lấy landlordId từ req.user nếu có và gọi service', async () => {
      const mockReq = { user: { id: 10 } };
      const mockReportData = {
        landlordId: 10,
        totalRooms: 3,
        rentedRooms: 1,
        rentalRate: '33.33%',
        expectedMonthlyRevenue: 3000000,
      };
      mockReportService.getLandlordReport.mockResolvedValue(mockReportData);

      const result = await controller.getLandlordReport(mockReq);

      expect(service.getLandlordReport).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockReportData);
    });

    it('nên dùng landlordId mặc định là 1 nếu req.user không tồn tại', async () => {
      const mockReq = {}; // không có user
      const mockReportData = {
        landlordId: 1,
        totalRooms: 0,
        rentedRooms: 0,
        rentalRate: '0%',
        expectedMonthlyRevenue: 0,
      };
      mockReportService.getLandlordReport.mockResolvedValue(mockReportData);

      const result = await controller.getLandlordReport(mockReq);

      expect(service.getLandlordReport).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReportData);
    });
  });

  describe('getAdminReport (F25)', () => {
    it('nên gọi service getAdminReport và trả về kết quả thống kê', async () => {
      const mockAdminData = {
        totalUsers: 50,
        totalRooms: 20,
        activeContracts: 10,
      };
      mockReportService.getAdminReport.mockResolvedValue(mockAdminData);

      const result = await controller.getAdminReport();

      expect(service.getAdminReport).toHaveBeenCalled();
      expect(result).toEqual(mockAdminData);
    });
  });
});