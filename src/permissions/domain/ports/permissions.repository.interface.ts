import { FindManyOptions } from 'typeorm';
import { Permission } from '../permission.entity';

export interface IPermissionsRepository {
  findOneById(id: string): Promise<Permission | null>;
  findOneByName(name: string): Promise<Permission | null>;
  findAndCount(
    options: FindManyOptions<Permission>,
  ): Promise<[Permission[], number]>;
  create(data: Partial<Permission>): Permission;
  save(permission: Permission): Promise<Permission>;
  softDelete(id: string): Promise<void>;
}

export const PERMISSIONS_REPOSITORY = Symbol('IPermissionsRepository');
