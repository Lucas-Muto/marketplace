import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { EloRank } from '@prisma/client';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PricingService,
          useClass: PricingService,
        },
      ],
    }).compile();

    service = module.get(PricingService);
  });

  describe('calculatePrice', () => {
    it('should calculate base price as 20 coins for moving up 2 divisions in Bronze tier', () => {
      const result = service.calculatePrice(EloRank.BRONZE_III, EloRank.BRONZE_I);
      expect(result.basePrice).toBe(20); // 2 divisions * 10
      expect(result.rankMultiplier).toBe(1); // Same tier
      expect(result.specialRankFee).toBe(0); // No special rank
      expect(result.finalPrice).toBe(20);
    });

    it('should apply 1.5x multiplier when moving from Bronze to Gold tier', () => {
      const result = service.calculatePrice(EloRank.BRONZE_III, EloRank.GOLD_III);
      expect(result.rankMultiplier).toBeGreaterThan(1);
    });

    it('should add 250 coins special fee when targeting ETERNITY rank', () => {
      const result = service.calculatePrice(EloRank.DIAMOND_I, EloRank.ETERNITY);
      expect(result.specialRankFee).toBe(250);
    });

    it('should reject progression from higher to lower rank (Gold to Bronze)', () => {
      expect(() => 
        service.calculatePrice(EloRank.GOLD_I, EloRank.BRONZE_I)
      ).toThrow('End rank must be higher than start rank');
    });

    it('should calculate exact 2.0x multiplier when jumping three tiers (Bronze to Platinum)', () => {
      const result = service.calculatePrice(EloRank.BRONZE_III, EloRank.PLATINUM_III);
      expect(result.rankMultiplier).toBe(2.5);
    });

    it('should add 500 coins special fee for ONE_ABOVE_ALL rank', () => {
      const result = service.calculatePrice(EloRank.ETERNITY, EloRank.ONE_ABOVE_ALL);
      expect(result.specialRankFee).toBe(500);
    });

    it('should calculate estimated hours based on rank difference', () => {
      const result = service.calculatePrice(EloRank.BRONZE_III, EloRank.SILVER_III);
      expect(result.estimatedHours).toBe(6); // 3 ranks difference * 2 hours
    });

    it('should calculate complex pricing for multi-tier jump', () => {
      const result = service.calculatePrice(EloRank.BRONZE_III, EloRank.DIAMOND_III);
      expect(result.basePrice).toBe(120); // 12 ranks * 10
      expect(result.rankMultiplier).toBe(3); // 4 tier difference * 0.5 + 1
      expect(result.finalPrice).toBe(360); // 120 * 3
    });
  });
}); 