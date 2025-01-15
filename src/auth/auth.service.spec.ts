import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('register', () => {
    it('should register a new customer successfully', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser',
        role: UserRole.CUSTOMER,
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: '1', ...dto });
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.register(dto);

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(dto.email);
    });

    it('should throw error if email already exists', async () => {
      const dto = {
        email: 'existing@example.com',
        password: 'Password123!',
        username: 'testuser',
        role: UserRole.CUSTOMER,
      };

      mockUsersService.findByEmail.mockResolvedValue({ id: '1' });

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const hashedPassword = await service.hashPassword(dto.password);
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        email: dto.email,
        password: hashedPassword,
        username: 'testuser',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.login(dto);

      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(dto.email);
    });

    it('should throw error with incorrect password', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const hashedPassword = await service.hashPassword('RealPassword123!');
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        email: dto.email,
        password: hashedPassword,
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 