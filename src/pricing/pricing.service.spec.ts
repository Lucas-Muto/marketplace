import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { EloRank } from '@prisma/client';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService],
    }).compile();

    service = module.get<PricingService>();
  });

  describe('calculatePrice', () => {
    it('should calculate price for simple rank up', () => {
      const result = service.calculatePrice(EloRank.BRONZE_III, EloRank.BRONZE_I);
      expect(result.basePrice).toBe(20); // 2 divisions * 10
      expect(result.rankMultiplier).toBe(1); // Same tier
      expect(result.specialRankFee).toBe(0); // No special rank
      expect(result.finalPrice).toBe(20);
    });

    it('should apply multiplier for tier differences', () => {
      const result = service.calculatePrice(EloRank.BRONZE_III, EloRank.GOLD_III);
      expect(result.rankMultiplier).toBeGreaterThan(1);
    });

    it('should add special rank fee for ETERNITY', () => {
      const result = service.calculatePrice(EloRank.DIAMOND_I, EloRank.ETERNITY);
      expect(result.specialRankFee).toBe(250);
    });

    it('should throw error for invalid rank progression', () => {
      expect(() => 
        service.calculatePrice(EloRank.GOLD_I, EloRank.BRONZE_I)
      ).toThrow('End rank must be higher than start rank');
    });
  });
}); 