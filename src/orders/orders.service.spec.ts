import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { EloRank, OrderStatus } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;
  let pricingService: PricingService;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPricingService = {
    calculatePrice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PricingService, useValue: mockPricingService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
    pricingService = module.get<PricingService>(PricingService);
  });

  describe('createOrder', () => {
    it('should create order with calculated pricing', async () => {
      const dto = {
        customerId: '1',
        startingRank: EloRank.BRONZE_III,
        desiredRank: EloRank.SILVER_III,
        specialNotes: 'Fast please',
      };

      const pricing = {
        basePrice: 30,
        rankMultiplier: 1.5,
        specialRankFee: 0,
        finalPrice: 45,
        estimatedHours: 6,
      };

      mockPricingService.calculatePrice.mockReturnValue(pricing);
      mockPrismaService.order.create.mockResolvedValue({
        id: '1',
        ...dto,
        ...pricing,
        status: OrderStatus.WAITING,
      });

      const result = await service.createOrder(dto);

      expect(result.finalPrice).toBe(45);
      expect(result.status).toBe(OrderStatus.WAITING);
    });
  });
}); 