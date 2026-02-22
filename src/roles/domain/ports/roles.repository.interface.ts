import { FindManyOptions } from 'typeorm';
import { Role } from '../role.entity';

export interface IRolesRepository {
  findOneById(id: string): Promise<Role | null>;
  findOneByName(name: string): Promise<Role | null>;
  findOneByIdWithPermissions(id: string): Promise<Role | null>;
  findAndCount(options: FindManyOptions<Role>): Promise<[Role[], number]>;
  create(data: Partial<Role>): Role;
  save(role: Role): Promise<Role>;
  softDelete(id: string): Promise<void>;
}

export const ROLES_REPOSITORY = Symbol('IRolesRepository');
