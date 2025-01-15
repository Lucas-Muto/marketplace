import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('booster-application')
  @Roles(UserRole.CUSTOMER)
  applyForBooster(@Req() req, @Body() application) {
    // Handle booster application
  }

  @Get('applications')
  @Roles(UserRole.ADMIN)
  getBoosterApplications() {
    // Get all booster applications
  }
} 