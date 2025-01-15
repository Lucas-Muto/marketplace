import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('boosters')
  @Roles(UserRole.ADMIN)
  getBoosters() {
    return this.usersService.findByRole(UserRole.BOOSTER);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(id, role);
  }

  @Get('applications')
  @Roles(UserRole.ADMIN)
  getBoosterApplications() {
    return this.usersService.findPendingApplications();
  }
} 