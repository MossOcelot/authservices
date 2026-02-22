import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { HashService } from '../../common/services/hash.service';
import { UsersService } from '../../users/application/users.service';
import { AUTH_REPOSITORY } from '../domain/ports/auth.repository.interface';
import { User } from '../../users/domain/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let mockAuthRepository: {
    findByEmail: jest.Mock;
    updateUserAuthFields: jest.Mock;
  };
  let mockJwtService: { signAsync: jest.Mock };
  let mockHashService: { hash: jest.Mock; compare: jest.Mock };
  let mockUsersService: { createUser: jest.Mock; findById: jest.Mock };

  const mockUser: User = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    lastLogin: null,
    approved: false,
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    mockAuthRepository = {
      findByEmail: jest.fn(),
      updateUserAuthFields: jest.fn().mockResolvedValue(undefined),
    };
    mockJwtService = { signAsync: jest.fn() };
    mockHashService = { hash: jest.fn(), compare: jest.fn() };
    mockUsersService = { createUser: jest.fn(), findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AUTH_REPOSITORY, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: HashService, useValue: mockHashService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    it('should create and return a user on success', async () => {
      mockUsersService.createUser.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(registerDto);
    });

    it('should create user with roles when roleIds are provided', async () => {
      const dtoWithRoles = { ...registerDto, roleIds: ['role-uuid-1'] };
      mockUsersService.createUser.mockResolvedValue(mockUser);

      await service.register(dtoWithRoles);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(dtoWithRoles);
    });

    it('should propagate exception when email already exists', async () => {
      mockUsersService.createUser.mockRejectedValue(
        new UnprocessableEntityException(),
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('validateLogin', () => {
    it('should return accessToken and update isActive + lastLogin on success', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      mockHashService.compare.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('signed-jwt-token');

      const result = await service.validateLogin({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        email: 'test@example.com',
        accessToken: 'signed-jwt-token',
      });
      expect(mockAuthRepository.updateUserAuthFields).toHaveBeenCalledWith(
        mockUser.id,
        { isActive: true, lastLogin: expect.any(Date) },
      );
    });

    it('should throw UnprocessableEntityException when email is not found', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateLogin({
          email: 'unknown@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(mockAuthRepository.updateUserAuthFields).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when password is invalid', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      mockHashService.compare.mockResolvedValue(false);

      await expect(
        service.validateLogin({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(mockAuthRepository.updateUserAuthFields).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should set isActive to false when user is logged in', async () => {
      mockUsersService.findById.mockResolvedValue({ ...mockUser, isActive: true });

      await service.logout('user-uuid-1');

      expect(mockUsersService.findById).toHaveBeenCalledWith('user-uuid-1');
      expect(mockAuthRepository.updateUserAuthFields).toHaveBeenCalledWith(
        'user-uuid-1',
        { isActive: false },
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.logout('not-exist')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockAuthRepository.updateUserAuthFields).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when user is not logged in', async () => {
      mockUsersService.findById.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.logout('user-uuid-1')).rejects.toThrow(
        UnprocessableEntityException,
      );

      expect(mockAuthRepository.updateUserAuthFields).not.toHaveBeenCalled();
    });
  });
});
