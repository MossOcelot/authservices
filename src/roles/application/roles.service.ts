import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Role } from '../domain/role.entity';
import { Permission } from '../../permissions/domain/permission.entity';
import { PermissionsService } from '../../permissions/application/permissions.service';
import { CreateRoleDto } from '../presentation/dto/create-role.dto';
import { UpdateRoleDto } from '../presentation/dto/update-role.dto';
import {
  PermissionUpdateAction,
  UpdatePermissionInRoleDto,
} from '../presentation/dto/update-permission-in-role.dto';
import { FindRolesQueryDto } from '../presentation/dto/find-roles-query.dto';
import { buildFilterOptions } from '../../common/utils/filter.util';
import {
  buildPaginationMeta,
  buildPaginationOptions,
  PaginationMeta,
} from '../../common/utils/pagination.util';
import { ROLES_REPOSITORY } from '../domain/ports/roles.repository.interface';
import type { IRolesRepository } from '../domain/ports/roles.repository.interface';

@Injectable()
export class RolesService {
  constructor(
    @Inject(ROLES_REPOSITORY)
    private readonly rolesRepository: IRolesRepository,
    private readonly permissionsService: PermissionsService,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const existing = await this.rolesRepository.findOneByName(
      createRoleDto.name,
    );
    if (existing) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          name: 'nameAlreadyExists',
        },
      });
    }

    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.rolesRepository.findOneById(id);
    if (!role) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: { roleId: 'roleNotFound' },
      });
    }

    if (dto.name !== undefined && dto.name !== role.name) {
      const existing = await this.rolesRepository.findOneByName(dto.name);
      if (existing) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { name: 'nameAlreadyExists' },
        });
      }
    }

    if (dto.name !== undefined) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;

    if (dto.permissionIds !== undefined) {
      const action = dto.permissionAction ?? PermissionUpdateAction.REPLACE;
      const roleWithPerms =
        await this.rolesRepository.findOneByIdWithPermissions(role.id);
      const currentPerms = roleWithPerms?.permissions ?? [];

      switch (action) {
        case PermissionUpdateAction.ADD: {
          const permissions = await this.resolvePermissions(dto.permissionIds);
          const existingIds = new Set(currentPerms.map((p) => p.id));
          role.permissions = [
            ...currentPerms,
            ...permissions.filter((p) => !existingIds.has(p.id)),
          ];
          break;
        }
        case PermissionUpdateAction.REMOVE: {
          const removeIds = new Set(dto.permissionIds);
          role.permissions = currentPerms.filter((p) => !removeIds.has(p.id));
          break;
        }
        case PermissionUpdateAction.REPLACE:
        default: {
          role.permissions = await this.resolvePermissions(dto.permissionIds);
          break;
        }
      }
    }

    return this.rolesRepository.save(role);
  }

  async updatePermissionInRole(
    roleId: string,
    dto: UpdatePermissionInRoleDto,
  ): Promise<Role> {
    const role =
      await this.rolesRepository.findOneByIdWithPermissions(roleId);
    if (!role) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: { roleId: 'roleNotFound' },
      });
    }

    switch (dto.action) {
      case PermissionUpdateAction.ADD: {
        const permissions = await this.resolvePermissions(dto.permissionIds);
        const existingIds = new Set(role.permissions.map((p) => p.id));
        const toAdd = permissions.filter((p) => !existingIds.has(p.id));
        role.permissions = [...role.permissions, ...toAdd];
        break;
      }
      case PermissionUpdateAction.REMOVE: {
        const removeIds = new Set(dto.permissionIds);
        role.permissions = role.permissions.filter(
          (p) => !removeIds.has(p.id),
        );
        break;
      }
      case PermissionUpdateAction.REPLACE: {
        role.permissions = await this.resolvePermissions(dto.permissionIds);
        break;
      }
    }

    return this.rolesRepository.save(role);
  }

  async findById(id: Role['id']): Promise<Role | null> {
    return this.rolesRepository.findOneById(id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.rolesRepository.findOneById(id);
    if (!role) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: { roleId: 'roleNotFound' },
      });
    }
    await this.rolesRepository.softDelete(id);
  }

  async findAll(
    query: FindRolesQueryDto,
  ): Promise<{ data: Role[]; meta: PaginationMeta }> {
    const { page, limit, ...filters } = query;

    const where = buildFilterOptions<Role>(filters as Record<string, unknown>);
    const { skip, take } = buildPaginationOptions(page, limit);

    const [data, total] = await this.rolesRepository.findAndCount({
      where,
      skip,
      take,
      relations: {
        permissions: true,
      }
    });

    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  private async resolvePermissions(
    permissionIds: string[],
  ): Promise<Permission[]> {
    const permissions: Permission[] = [];
    for (const permissionId of permissionIds) {
      const permission = await this.permissionsService.findById(permissionId);
      if (!permission) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: { permissionId: 'permissionNotFound' },
        });
      }
      permissions.push(permission);
    }
    return permissions;
  }
}
