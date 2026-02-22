import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Role } from '../domain/role.entity';
import { IRolesRepository } from '../domain/ports/roles.repository.interface';

@Injectable()
export class RolesRepository implements IRolesRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
  ) {}

  findOneById(id: string): Promise<Role | null> {
    return this.repository.findOneBy({ id });
  }

  findOneByName(name: string): Promise<Role | null> {
    return this.repository.findOneBy({ name });
  }

  findOneByIdWithPermissions(id: string): Promise<Role | null> {
    return this.repository
      .createQueryBuilder('role')
      .leftJoinAndSelect(
        'role.permissions',
        'permission',
        'permission.deleted_at IS NULL',
      )
      .where('role.id = :id', { id })
      .getOne();
  }

  findAndCount(options: FindManyOptions<Role>): Promise<[Role[], number]> {
    return this.repository.findAndCount(options);
  }

  create(data: Partial<Role>): Role {
    return this.repository.create(data);
  }

  save(role: Role): Promise<Role> {
    return this.repository.save(role);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete({ id });
  }
}
