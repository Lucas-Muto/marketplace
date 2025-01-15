import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  @Roles(UserRole.CUSTOMER)
  createOrder(@Body() dto: CreateOrderDto, @Req() req) {
    return this.ordersService.createOrder({
      ...dto,
      customerId: req.user.id,
    });
  }

  @Get('my-orders')
  @Roles(UserRole.CUSTOMER)
  getMyOrders(@Req() req) {
    return this.ordersService.findByCustomerId(req.user.id);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  getAllOrders() {
    return this.ordersService.findAll();
  }
} 