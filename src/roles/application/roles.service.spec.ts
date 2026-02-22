import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { ROLES_REPOSITORY } from '../domain/ports/roles.repository.interface';
import { PermissionsService } from '../../permissions/application/permissions.service';
import { Role } from '../domain/role.entity';
import { Permission } from '../../permissions/domain/permission.entity';
import { PermissionUpdateAction } from '../presentation/dto/update-permission-in-role.dto';

describe('RolesService', () => {
  let service: RolesService;
  let mockRolesRepository: {
    findOneById: jest.Mock;
    findOneByName: jest.Mock;
    findOneByIdWithPermissions: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    softDelete: jest.Mock;
  };
  let mockPermissionsService: { findById: jest.Mock };

  const mockPermission: Permission = {
    id: 'perm-uuid-1',
    name: 'users:read',
    resource: 'users',
    action: 'read',
    description: null,
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const anotherPermission: Permission = {
    id: 'perm-uuid-2',
    name: 'users:write',
    resource: 'users',
    action: 'write',
    description: null,
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockRole: Role = {
    id: 'uuid-1',
    name: 'admin',
    description: 'Administrator role',
    users: [],
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    mockRolesRepository = {
      findOneById: jest.fn(),
      findOneByName: jest.fn(),
      findOneByIdWithPermissions: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn().mockResolvedValue(undefined),
    };
    mockPermissionsService = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: ROLES_REPOSITORY, useValue: mockRolesRepository },
        { provide: PermissionsService, useValue: mockPermissionsService },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  describe('createRole', () => {
    it('should create and return a role on success', async () => {
      mockRolesRepository.findOneByName.mockResolvedValue(null);
      mockRolesRepository.create.mockReturnValue(mockRole);
      mockRolesRepository.save.mockResolvedValue(mockRole);

      const result = await service.createRole({
        name: 'admin',
        description: 'Administrator role',
      });

      expect(result).toEqual(mockRole);
      expect(mockRolesRepository.findOneByName).toHaveBeenCalledWith('admin');
      expect(mockRolesRepository.save).toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when name already exists', async () => {
      mockRolesRepository.findOneByName.mockResolvedValue(mockRole);

      await expect(
        service.createRole({ name: 'admin', description: 'Duplicate' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('updateRole', () => {
    it('should update name and description and return updated role', async () => {
      const updatedRole = { ...mockRole, name: 'moderator', description: 'Moderator role' };

      mockRolesRepository.findOneById.mockResolvedValue({ ...mockRole });
      mockRolesRepository.findOneByName.mockResolvedValue(null);
      mockRolesRepository.save.mockResolvedValue(updatedRole);

      const result = await service.updateRole('uuid-1', {
        name: 'moderator',
        description: 'Moderator role',
      });

      expect(result.name).toBe('moderator');
      expect(mockRolesRepository.save).toHaveBeenCalled();
    });

    it('should update description only without checking name uniqueness', async () => {
      const updatedRole = { ...mockRole, description: 'Updated description' };

      mockRolesRepository.findOneById.mockResolvedValue({ ...mockRole });
      mockRolesRepository.save.mockResolvedValue(updatedRole);

      await service.updateRole('uuid-1', { description: 'Updated description' });

      expect(mockRolesRepository.findOneByName).not.toHaveBeenCalled();
      expect(mockRolesRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when role does not exist', async () => {
      mockRolesRepository.findOneById.mockResolvedValue(null);

      await expect(
        service.updateRole('not-exist', { name: 'new-name' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockRolesRepository.save).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException when new name already exists on another role', async () => {
      const existingRole = { ...mockRole, id: 'uuid-2', name: 'moderator' };

      mockRolesRepository.findOneById.mockResolvedValue({ ...mockRole });
      mockRolesRepository.findOneByName.mockResolvedValue(existingRole);

      await expect(
        service.updateRole('uuid-1', { name: 'moderator' }),
      ).rejects.toThrow(UnprocessableEntityException);

      expect(mockRolesRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updatePermissionInRole', () => {
    describe('ADD', () => {
      it('should add new permissions to the role', async () => {
        const roleWithPermissions = { ...mockRole, permissions: [mockPermission] };
        const updatedRole = { ...mockRole, permissions: [mockPermission, anotherPermission] };

        mockRolesRepository.findOneByIdWithPermissions.mockResolvedValue(roleWithPermissions);
        mockPermissionsService.findById.mockResolvedValue(anotherPermission);
        mockRolesRepository.save.mockResolvedValue(updatedRole);

        const result = await service.updatePermissionInRole('uuid-1', {
          action: PermissionUpdateAction.ADD,
          permissionIds: ['perm-uuid-2'],
        });

        expect(result.permissions).toHaveLength(2);
        expect(mockRolesRepository.save).toHaveBeenCalled();
      });

      it('should skip duplicate permissions silently', async () => {
        const roleWithPermission = { ...mockRole, permissions: [mockPermission] };

        mockRolesRepository.findOneByIdWithPermissions.mockResolvedValue(roleWithPermission);
        mockPermissionsService.findById.mockResolvedValue(mockPermission);
        mockRolesRepository.save.mockResolvedValue(roleWithPermission);

        await service.updatePermissionInRole('uuid-1', {
          action: PermissionUpdateAction.ADD,
          permissionIds: ['perm-uuid-1'],
        });

        const savedRole = mockRolesRepository.save.mock.calls[0][0] as Role;
        expect(savedRole.permissions).toHaveLength(1);
      });

      it('should throw NotFoundException when permission does not exist', async () => {
        mockRolesRepository.findOneByIdWithPermissions.mockResolvedValue({ ...mockRole, permissions: [] });
        mockPermissionsService.findById.mockResolvedValue(null);

        await expect(
          service.updatePermissionInRole('uuid-1', {
            action: PermissionUpdateAction.ADD,
            permissionIds: ['not-exist'],
          }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('REMOVE', () => {
      it('should remove specified permissions from the role', async () => {
        const roleWithPermissions = {
          ...mockRole,
          permissions: [mockPermission, anotherPermission],
        };
        const updatedRole = { ...mockRole, permissions: [anotherPermission] };

        mockRolesRepository.findOneByIdWithPermissions.mockResolvedValue(roleWithPermissions);
        mockRolesRepository.save.mockResolvedValue(updatedRole);

        const result = await service.updatePermissionInRole('uuid-1', {
          action: PermissionUpdateAction.REMOVE,
          permissionIds: ['perm-uuid-1'],
        });

        expect(result.permissions).toHaveLength(1);
        expect(result.permissions[0].id).toBe('perm-uuid-2');
      });

      it('should be a no-op when removing a permission not in the role', async () => {
        const roleWithPermission = { ...mockRole, permissions: [mockPermission] };

        mockRolesRepository.findOneByIdWithPermissions.mockResolvedValue(roleWithPermission);
        mockRolesRepository.save.mockResolvedValue(roleWithPermission);

        await service.updatePermissionInRole('uuid-1', {
          action: PermissionUpdateAction.REMOVE,
          permissionIds: ['not-in-role'],
        });

        const savedRole = mockRolesRepository.save.mock.calls[0][0] as Role;
        expect(savedRole.permissions).toHaveLength(1);
      });
    });

    describe('REPLACE', () => {
      it('should replace all permissions with the provided set', async () => {
        const roleWithOldPermissions = {
          ...mockRole,
          permissions: [mockPermission],
        };
        const updatedRole = { ...mockRole, permissions: [anotherPermission] };

        mockRolesRepository.findOneByIdWithPermissions.mockResolvedValue(roleWithOldPermissions);
        mockPermissionsService.findById.mockResolvedValue(anotherPermission);
        mockRolesRepository.save.mockResolvedValue(updatedRole);

        const result = await service.updatePermissionInRole('uuid-1', {
          action: PermissionUpdateAction.REPLACE,
          permissionIds: ['perm-uuid-2'],
        });

        expect(result.permissions).toHaveLength(1);
        expect(result.permissions[0].id).toBe('perm-uuid-2');
      });

      it('should clear all permissions when permissionIds is empty', async () => {
        const roleWithPermissions = { ...mockRole, permissions: [mockPermission] };
        const updatedRole = { ...mockRole, permissions: [] };

        mockRolesRepository.findOneByIdWithPermissions.mockResolvedValue(roleWithPermissions);
        mockRolesRepository.save.mockResolvedValue(updatedRole);

        const result = await service.updatePermissionInRole('uuid-1', {
          action: PermissionUpdateAction.REPLACE,
          permissionIds: [],
        });

        expect(result.permissions).toHaveLength(0);
      });
    });

    it('should throw NotFoundException when role does not exist', async () => {
      mockRolesRepository.findOneByIdWithPermissions.mockResolvedValue(null);

      await expect(
        service.updatePermissionInRole('not-exist', {
          action: PermissionUpdateAction.ADD,
          permissionIds: ['perm-uuid-1'],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return role when found', async () => {
      mockRolesRepository.findOneById.mockResolvedValue(mockRole);

      const result = await service.findById('uuid-1');

      expect(result).toEqual(mockRole);
      expect(mockRolesRepository.findOneById).toHaveBeenCalledWith('uuid-1');
    });

    it('should return null when role not found', async () => {
      mockRolesRepository.findOneById.mockResolvedValue(null);

      const result = await service.findById('not-exist');

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should soft delete role when role exists', async () => {
      mockRolesRepository.findOneById.mockResolvedValue(mockRole);

      await service.remove('uuid-1');

      expect(mockRolesRepository.findOneById).toHaveBeenCalledWith('uuid-1');
      expect(mockRolesRepository.softDelete).toHaveBeenCalledWith('uuid-1');
    });

    it('should throw NotFoundException when role does not exist', async () => {
      mockRolesRepository.findOneById.mockResolvedValue(null);

      await expect(service.remove('not-exist')).rejects.toThrow(NotFoundException);

      expect(mockRolesRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated data with meta', async () => {
      const roles = [mockRole];
      mockRolesRepository.findAndCount.mockResolvedValue([roles, 1]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(roles);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });
});
