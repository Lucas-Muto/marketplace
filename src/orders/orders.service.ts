import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { EloRank, OrderStatus } from '@prisma/client';

interface CreateOrderDto {
  customerId: string;
  startingRank: EloRank;
  desiredRank: EloRank;
  specialNotes?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const pricing = this.pricingService.calculatePrice(
      dto.startingRank,
      dto.desiredRank
    );

    return this.prisma.order.create({
      data: {
        customerId: dto.customerId,
        startingRank: dto.startingRank,
        desiredRank: dto.desiredRank,
        status: OrderStatus.WAITING,
        price: pricing.finalPrice,
        basePrice: pricing.basePrice,
        rankMultiplier: pricing.rankMultiplier,
        specialRankFee: pricing.specialRankFee,
        finalPrice: pricing.finalPrice,
        estimatedHours: pricing.estimatedHours,
        specialNotes: dto.specialNotes,
        priceCalculatedAt: new Date(),
      },
    });
  }
} 