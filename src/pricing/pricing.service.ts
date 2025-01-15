import { Injectable } from '@nestjs/common';
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
  private readonly BASE_PRICE = 10; // Base price per division
  private readonly SPECIAL_RANKS = new Set([EloRank.ETERNITY, EloRank.ONE_ABOVE_ALL]);
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
    if (this.RANK_ORDER.get(startRank) >= this.RANK_ORDER.get(endRank)) {
      throw new Error('End rank must be higher than start rank');
    }

    const rankDifference = this.RANK_ORDER.get(endRank) - this.RANK_ORDER.get(startRank);
    const basePrice = rankDifference * this.BASE_PRICE;

    // Calculate multiplier based on rank tiers
    const rankMultiplier = this.calculateRankMultiplier(startRank, endRank);

    // Calculate special rank fee
    const specialRankFee = this.calculateSpecialRankFee(endRank);

    // Calculate estimated hours
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
    const tierDifference = endTier - startTier;

    // Increase multiplier for higher tiers
    return 1 + (tierDifference * 0.5);
  }

  private calculateSpecialRankFee(endRank: EloRank): number {
    if (this.SPECIAL_RANKS.has(endRank)) {
      return endRank === EloRank.ONE_ABOVE_ALL ? 500 : 250;
    }
    return 0;
  }

  private calculateEstimatedHours(rankDifference: number): number {
    // Base estimation: 2 hours per rank difference
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