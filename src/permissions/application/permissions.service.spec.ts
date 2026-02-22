import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PERMISSIONS_REPOSITORY } from '../domain/ports/permissions.repository.interface';
import { Permission } from '../domain/permission.entity';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let mockPermissionsRepository: {
    findOneById: jest.Mock;
    findOneByName: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    softDelete: jest.Mock;
  };

  const mockPermission: Permission = {
    id: 'uuid-1',
    name: 'users:read',
    resource: 'users',
    action: 'read',
    description: 'Can read users',
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    mockPermissionsRepository = {
      findOneById: jest.fn(),
      findOneByName: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PERMISSIONS_REPOSITORY,
          useValue: mockPermissionsRepository,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
  });

  describe('createPermission', () => {
    it('should create and return a permission on success', async () => {
      mockPermissionsRepository.findOneByName.mockResolvedValue(null);
      mockPermissionsRepository.create.mockReturnValue(mockPermission);
      mockPermissionsRepository.save.mockResolvedValue(mockPermission);

      const result = await service.createPermission({
        name: 'users:read',
        resource: 'users',
        action: 'read',
        description: 'Can read users',
      });

      expect(result).toEqual(mockPermission);
      expect(mockPermissionsRepository.findOneByName).toHaveBeenCalledWith(
        'users:read',
      );
      expect(mockPermissionsRepository.save).toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when name already exists', async () => {
      mockPermissionsRepository.findOneByName.mockResolvedValue(mockPermission);

      await expect(
        service.createPermission({
          name: 'users:read',
          resource: 'users',
          action: 'read',
        }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('updatePermission', () => {
    it('should update all fields and return updated permission', async () => {
      const updated = {
        ...mockPermission,
        name: 'users:write',
        resource: 'users',
        action: 'write',
        description: 'Can write users',
      };

      mockPermissionsRepository.findOneById.mockResolvedValue({ ...mockPermission });
      mockPermissionsRepository.findOneByName.mockResolvedValue(null);
      mockPermissionsRepository.save.mockResolvedValue(updated);

      const result = await service.updatePermission('uuid-1', {
        name: 'users:write',
        resource: 'users',
        action: 'write',
        description: 'Can write users',
      });

      expect(result.name).toBe('users:write');
      expect(result.action).toBe('write');
      expect(mockPermissionsRepository.save).toHaveBeenCalled();
    });

    it('should update resource and action without checking name uniqueness', async () => {
      mockPermissionsRepository.findOneById.mockResolvedValue({ ...mockPermission });
      mockPermissionsRepository.save.mockResolvedValue(mockPermission);

      await service.updatePermission('uuid-1', {
        resource: 'roles',
        action: 'delete',
      });

      expect(mockPermissionsRepository.findOneByName).not.toHaveBeenCalled();
      expect(mockPermissionsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when permission does not exist', async () => {
      mockPermissionsRepository.findOneById.mockResolvedValue(null);

      await expect(
        service.updatePermission('not-exist', { name: 'users:write' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockPermissionsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when new name already exists on another permission', async () => {
      const existingPermission = {
        ...mockPermission,
        id: 'uuid-2',
        name: 'users:write',
      };

      mockPermissionsRepository.findOneById.mockResolvedValue({ ...mockPermission });
      mockPermissionsRepository.findOneByName.mockResolvedValue(existingPermission);

      await expect(
        service.updatePermission('uuid-1', { name: 'users:write' }),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(mockPermissionsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return permission when found', async () => {
      mockPermissionsRepository.findOneById.mockResolvedValue(mockPermission);

      const result = await service.findById('uuid-1');

      expect(result).toEqual(mockPermission);
      expect(mockPermissionsRepository.findOneById).toHaveBeenCalledWith(
        'uuid-1',
      );
    });

    it('should return null when permission not found', async () => {
      mockPermissionsRepository.findOneById.mockResolvedValue(null);

      const result = await service.findById('not-exist');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should soft delete permission when permission exists', async () => {
      mockPermissionsRepository.findOneById.mockResolvedValue(mockPermission);

      await service.remove('uuid-1');

      expect(mockPermissionsRepository.findOneById).toHaveBeenCalledWith('uuid-1');
      expect(mockPermissionsRepository.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException when permission does not exist', async () => {
      mockPermissionsRepository.findOneById.mockResolvedValue(null);

      await expect(service.remove('not-exist')).rejects.toThrow(NotFoundException);

      expect(mockPermissionsRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated data with meta', async () => {
      const permissions = [mockPermission];
      mockPermissionsRepository.findAndCount.mockResolvedValue([
        permissions,
        1,
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(permissions);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });
});
