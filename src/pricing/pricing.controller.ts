import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EloRank } from '@prisma/client';
import { PricingService } from './pricing.service';

class CalculatePriceDto {
  startRank: EloRank;
  endRank: EloRank;
}

@Controller('pricing')
@UseGuards(AuthGuard('jwt'))
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('calculate')
  calculatePrice(@Body() dto: CalculatePriceDto) {
    return this.pricingService.calculatePrice(dto.startRank, dto.endRank);
  }
} 