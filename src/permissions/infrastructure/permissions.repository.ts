import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Permission } from '../domain/permission.entity';
import { IPermissionsRepository } from '../domain/ports/permissions.repository.interface';

@Injectable()
export class PermissionsRepository implements IPermissionsRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>,
  ) {}

  findOneById(id: string): Promise<Permission | null> {
    return this.repository.findOneBy({ id });
  }

  findOneByName(name: string): Promise<Permission | null> {
    return this.repository.findOneBy({ name });
  }

  findAndCount(
    options: FindManyOptions<Permission>,
  ): Promise<[Permission[], number]> {
    return this.repository.findAndCount(options);
  }

  create(data: Partial<Permission>): Permission {
    return this.repository.create(data);
  }

  save(permission: Permission): Promise<Permission> {
    return this.repository.save(permission);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete({ id });
  }
}
