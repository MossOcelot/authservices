import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Permission } from '../domain/permission.entity';
import { CreatePermissionDto } from '../presentation/dto/create-permission.dto';
import { UpdatePermissionDto } from '../presentation/dto/update-permission.dto';
import { FindPermissionsQueryDto } from '../presentation/dto/find-permissions-query.dto';
import { buildFilterOptions } from '../../common/utils/filter.util';
import {
  buildPaginationMeta,
  buildPaginationOptions,
  PaginationMeta,
} from '../../common/utils/pagination.util';
import { PERMISSIONS_REPOSITORY } from '../domain/ports/permissions.repository.interface';
import type { IPermissionsRepository } from '../domain/ports/permissions.repository.interface';

@Injectable()
export class PermissionsService {
  constructor(
    @Inject(PERMISSIONS_REPOSITORY)
    private readonly permissionsRepository: IPermissionsRepository,
  ) {}

  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const existing = await this.permissionsRepository.findOneByName(
      createPermissionDto.name,
    );
    if (existing) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          name: 'nameAlreadyExists',
        },
      });
    }

    const permission =
      this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async updatePermission(
    id: string,
    dto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.permissionsRepository.findOneById(id);
    if (!permission) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: { permissionId: 'permissionNotFound' },
      });
    }

    if (dto.name !== undefined && dto.name !== permission.name) {
      const existing = await this.permissionsRepository.findOneByName(dto.name);
      if (existing) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: { name: 'nameAlreadyExists' },
        });
      }
    }

    if (dto.name !== undefined) permission.name = dto.name;
    if (dto.resource !== undefined) permission.resource = dto.resource;
    if (dto.action !== undefined) permission.action = dto.action;
    if (dto.description !== undefined) permission.description = dto.description;

    return this.permissionsRepository.save(permission);
  }

  async findById(id: Permission['id']): Promise<Permission | null> {
    return this.permissionsRepository.findOneById(id);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.permissionsRepository.findOneById(id);
    if (!permission) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: { permissionId: 'permissionNotFound' },
      });
    }
    await this.permissionsRepository.softDelete(id);
  }

  async findAll(
    query: FindPermissionsQueryDto,
  ): Promise<{ data: Permission[]; meta: PaginationMeta }> {
    const { page, limit, ...filters } = query;

    const where = buildFilterOptions<Permission>(
      filters as Record<string, unknown>,
    );
    const { skip, take } = buildPaginationOptions(page, limit);

    const [data, total] = await this.permissionsRepository.findAndCount({
      where,
      skip,
      take,
    });

    return { data, meta: buildPaginationMeta(total, page, limit) };
  }
}
