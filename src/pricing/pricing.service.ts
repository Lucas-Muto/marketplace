import { Injectable, BadRequestException } from '@nestjs/common';
import { EloRank } from '@prisma/client';

interface PriceCalculationResult {
  basePrice: number;
  rankMultiplier: number;
  specialRankFee: number;
  finalPrice: number;
  estimatedHours: number;
}

@Injectable()
export class PricingService {
  private readonly BASE_PRICE = 10;
  private readonly SPECIAL_RANKS = new Set(['ETERNITY', 'ONE_ABOVE_ALL'] as const);
  private readonly RANK_ORDER = new Map([
    [EloRank.BRONZE_III, 1],
    [EloRank.BRONZE_II, 2],
    [EloRank.BRONZE_I, 3],
    [EloRank.SILVER_III, 4],
    [EloRank.SILVER_II, 5],
    [EloRank.SILVER_I, 6],
    [EloRank.GOLD_III, 7],
    [EloRank.GOLD_II, 8],
    [EloRank.GOLD_I, 9],
    [EloRank.PLATINUM_III, 10],
    [EloRank.PLATINUM_II, 11],
    [EloRank.PLATINUM_I, 12],
    [EloRank.DIAMOND_III, 13],
    [EloRank.DIAMOND_II, 14],
    [EloRank.DIAMOND_I, 15],
    [EloRank.GRANDMASTER_III, 16],
    [EloRank.GRANDMASTER_II, 17],
    [EloRank.GRANDMASTER_I, 18],
    [EloRank.ETERNITY, 19],
    [EloRank.ONE_ABOVE_ALL, 20],
  ]);

  calculatePrice(startRank: EloRank, endRank: EloRank): PriceCalculationResult {
    const startRankValue = this.RANK_ORDER.get(startRank);
    const endRankValue = this.RANK_ORDER.get(endRank);

    if (!startRankValue || !endRankValue) {
      throw new BadRequestException('Invalid rank provided');
    }

    if (startRankValue >= endRankValue) {
      throw new BadRequestException('End rank must be higher than start rank');
    }

    const rankDifference = endRankValue - startRankValue;
    const basePrice = rankDifference * this.BASE_PRICE;
    const rankMultiplier = this.calculateRankMultiplier(startRank, endRank);
    const specialRankFee = this.calculateSpecialRankFee(endRank);
    const estimatedHours = this.calculateEstimatedHours(rankDifference);
    const finalPrice = (basePrice * rankMultiplier) + specialRankFee;

    return {
      basePrice,
      rankMultiplier,
      specialRankFee,
      finalPrice,
      estimatedHours,
    };
  }

  private calculateRankMultiplier(startRank: EloRank, endRank: EloRank): number {
    const startTier = this.getTier(startRank);
    const endTier = this.getTier(endRank);
    return 1 + ((endTier - startTier) * 0.5);
  }

  private calculateSpecialRankFee(endRank: EloRank): number {
    return endRank === EloRank.ETERNITY ? 250 : 
           endRank === EloRank.ONE_ABOVE_ALL ? 500 : 0;
  }

  private calculateEstimatedHours(rankDifference: number): number {
    return rankDifference * 2;
  }

  private getTier(rank: EloRank): number {
    if (rank.includes('BRONZE')) return 1;
    if (rank.includes('SILVER')) return 2;
    if (rank.includes('GOLD')) return 3;
    if (rank.includes('PLATINUM')) return 4;
    if (rank.includes('DIAMOND')) return 5;
    if (rank.includes('GRANDMASTER')) return 6;
    if (rank === EloRank.ETERNITY) return 7;
    return 8; // ONE_ABOVE_ALL
  }
} 