import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { HashService } from '../../common/services/hash.service';
import { USERS_REPOSITORY } from '../domain/ports/users.repository.interface';
import { RolesService } from '../../roles/application/roles.service';
import { User } from '../domain/user.entity';
import { Role } from '../../roles/domain/role.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockUsersRepository: {
    findOneByEmail: jest.Mock;
    findOneById: jest.Mock;
    findOneByIdWithRoles: jest.Mock;
    findAndCount: jest.Mock;
    findUserWithRolesAndPermissions: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    softDelete: jest.Mock;
  };
  let mockHashService: { hash: jest.Mock; compare: jest.Mock };
  let mockRolesService: { findById: jest.Mock };

  const mockRole: Role = {
    id: 'role-uuid-1',
    name: 'admin',
    description: 'Administrator',
    users: [],
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const anotherRole: Role = {
    id: 'role-uuid-2',
    name: 'user',
    description: 'Regular user',
    users: [],
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUser: User = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    isActive: false,
    lastLogin: null,
    approved: false,
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    mockUsersRepository = {
      findOneByEmail: jest.fn(),
      findOneById: jest.fn(),
      findOneByIdWithRoles: jest.fn(),
      findAndCount: jest.fn(),
      findUserWithRolesAndPermissions: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn().mockResolvedValue(undefined),
    };
    mockHashService = { hash: jest.fn(), compare: jest.fn() };
    mockRolesService = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USERS_REPOSITORY, useValue: mockUsersRepository },
        { provide: HashService, useValue: mockHashService },
        { provide: RolesService, useValue: mockRolesService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should create user without roles when roleIds is not provided', async () => {
      mockUsersRepository.findOneByEmail.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashedPassword');
      mockUsersRepository.create.mockReturnValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result).toEqual(mockUser);
      expect(mockHashService.hash).toHaveBeenCalledWith('password123');
      expect(mockRolesService.findById).not.toHaveBeenCalled();
      expect(mockUsersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ roles: [] }),
      );
      expect(mockUsersRepository.save).toHaveBeenCalled();
    });

    it('should create user with roles when valid roleIds are provided', async () => {
      const userWithRole = { ...mockUser, roles: [mockRole] };

      mockUsersRepository.findOneByEmail.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashedPassword');
      mockRolesService.findById.mockResolvedValue(mockRole);
      mockUsersRepository.create.mockReturnValue(userWithRole);
      mockUsersRepository.save.mockResolvedValue(userWithRole);

      const result = await service.createUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        roleIds: ['role-uuid-1'],
      });

      expect(result.roles).toContain(mockRole);
      expect(mockRolesService.findById).toHaveBeenCalledWith('role-uuid-1');
      expect(mockUsersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ roles: [mockRole] }),
      );
    });

    it('should throw NotFoundException when a roleId does not exist', async () => {
      mockUsersRepository.findOneByEmail.mockResolvedValue(null);
      mockHashService.hash.mockResolvedValue('hashedPassword');
      mockRolesService.findById.mockResolvedValue(null);

      await expect(
        service.createUser({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          roleIds: ['non-existent-role-id'],
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockUsersRepository.save).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when email already exists', async () => {
      mockUsersRepository.findOneByEmail.mockResolvedValue(mockUser);

      await expect(
        service.createUser({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockUsersRepository.findOneById.mockResolvedValue(mockUser);

      const result = await service.findById('user-uuid-1');

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findOneById).toHaveBeenCalledWith(
        'user-uuid-1',
      );
    });

    it('should return null when user not found', async () => {
      mockUsersRepository.findOneById.mockResolvedValue(null);

      const result = await service.findById('not-exist');

      expect(result).toBeNull();
    });
  });

  describe('findUserAll', () => {
    it('should return paginated data with meta', async () => {
      const users = [mockUser];
      mockUsersRepository.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.findUserAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(users);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('remove', () => {
    it('should soft delete user when user exists', async () => {
      mockUsersRepository.findOneById.mockResolvedValue(mockUser);

      await service.remove('user-uuid-1');

      expect(mockUsersRepository.findOneById).toHaveBeenCalledWith('user-uuid-1');
      expect(mockUsersRepository.softDelete).toHaveBeenCalledWith('user-uuid-1');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersRepository.findOneById.mockResolvedValue(null);

      await expect(service.remove('not-exist')).rejects.toThrow(NotFoundException);

      expect(mockUsersRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('addRoleToUser', () => {
    it('should assign role and return updated user', async () => {
      const userWithRoles = { ...mockUser, roles: [] };
      const updatedUser = { ...mockUser, roles: [mockRole] };

      mockUsersRepository.findOneByIdWithRoles.mockResolvedValue(userWithRoles);
      mockRolesService.findById.mockResolvedValue(mockRole);
      mockUsersRepository.save.mockResolvedValue(updatedUser);

      const result = await service.addRoleToUser('user-uuid-1', 'role-uuid-1');

      expect(result.roles).toContain(mockRole);
      expect(mockUsersRepository.findOneByIdWithRoles).toHaveBeenCalledWith(
        'user-uuid-1',
      );
      expect(mockRolesService.findById).toHaveBeenCalledWith('role-uuid-1');
      expect(mockUsersRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersRepository.findOneByIdWithRoles.mockResolvedValue(null);

      await expect(
        service.addRoleToUser('not-exist', 'role-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when role does not exist', async () => {
      mockUsersRepository.findOneByIdWithRoles.mockResolvedValue(mockUser);
      mockRolesService.findById.mockResolvedValue(null);

      await expect(
        service.addRoleToUser('user-uuid-1', 'not-exist'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when role is already assigned', async () => {
      const userWithRole = { ...mockUser, roles: [mockRole] };

      mockUsersRepository.findOneByIdWithRoles.mockResolvedValue(userWithRole);
      mockRolesService.findById.mockResolvedValue(mockRole);

      await expect(
        service.addRoleToUser('user-uuid-1', 'role-uuid-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should append role without affecting existing roles', async () => {
      const userWithRole = { ...mockUser, roles: [anotherRole] };
      const updatedUser = { ...mockUser, roles: [anotherRole, mockRole] };

      mockUsersRepository.findOneByIdWithRoles.mockResolvedValue(userWithRole);
      mockRolesService.findById.mockResolvedValue(mockRole);
      mockUsersRepository.save.mockResolvedValue(updatedUser);

      const result = await service.addRoleToUser('user-uuid-1', 'role-uuid-1');

      expect(result.roles).toHaveLength(2);
      expect(result.roles).toContain(anotherRole);
      expect(result.roles).toContain(mockRole);
    });
  });
});
