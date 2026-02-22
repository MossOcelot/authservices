import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ADMIN_REPOSITORY } from '../domain/ports/admin.repository.interface';
import { User } from '../../users/domain/user.entity';

describe('AdminService', () => {
  let service: AdminService;
  let mockAdminRepository: {
    findById: jest.Mock;
    findByIdIncludingDeleted: jest.Mock;
    approveUser: jest.Mock;
    softDeleteUser: jest.Mock;
    hardDeleteUser: jest.Mock;
  };

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
    mockAdminRepository = {
      findById: jest.fn(),
      findByIdIncludingDeleted: jest.fn(),
      approveUser: jest.fn().mockResolvedValue(undefined),
      softDeleteUser: jest.fn().mockResolvedValue(undefined),
      hardDeleteUser: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: ADMIN_REPOSITORY, useValue: mockAdminRepository },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('approveUser', () => {
    it('should approve user when user exists', async () => {
      mockAdminRepository.findById.mockResolvedValue(mockUser);

      await service.approveUser('user-uuid-1');

      expect(mockAdminRepository.findById).toHaveBeenCalledWith('user-uuid-1');
      expect(mockAdminRepository.approveUser).toHaveBeenCalledWith('user-uuid-1');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockAdminRepository.findById.mockResolvedValue(null);

      await expect(service.approveUser('not-exist')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAdminRepository.approveUser).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete user when user exists', async () => {
      mockAdminRepository.findById.mockResolvedValue(mockUser);

      await service.softDeleteUser('user-uuid-1');

      expect(mockAdminRepository.findById).toHaveBeenCalledWith('user-uuid-1');
      expect(mockAdminRepository.softDeleteUser).toHaveBeenCalledWith(
        'user-uuid-1',
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockAdminRepository.findById.mockResolvedValue(null);

      await expect(service.softDeleteUser('not-exist')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAdminRepository.softDeleteUser).not.toHaveBeenCalled();
    });
  });

  describe('hardDeleteUser', () => {
    it('should permanently delete active user', async () => {
      mockAdminRepository.findByIdIncludingDeleted.mockResolvedValue(mockUser);

      await service.hardDeleteUser('user-uuid-1');

      expect(mockAdminRepository.findByIdIncludingDeleted).toHaveBeenCalledWith(
        'user-uuid-1',
      );
      expect(mockAdminRepository.hardDeleteUser).toHaveBeenCalledWith(
        'user-uuid-1',
      );
    });

    it('should permanently delete soft-deleted user', async () => {
      const softDeletedUser: User = { ...mockUser, deletedAt: new Date() };
      mockAdminRepository.findByIdIncludingDeleted.mockResolvedValue(
        softDeletedUser,
      );

      await service.hardDeleteUser('user-uuid-1');

      expect(mockAdminRepository.hardDeleteUser).toHaveBeenCalledWith(
        'user-uuid-1',
      );
    });

    it('should throw NotFoundException when user does not exist at all', async () => {
      mockAdminRepository.findByIdIncludingDeleted.mockResolvedValue(null);

      await expect(service.hardDeleteUser('not-exist')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAdminRepository.hardDeleteUser).not.toHaveBeenCalled();
    });
  });
});
