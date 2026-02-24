import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { IUsersRepository } from '../domain/ports/users.repository.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findOneByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  findOneById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  findOneByIdWithRoles(id: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role', 'role.deleted_at IS NULL')
      .where('user.id = :id', { id })
      .getOne();
  }

  // async findOneByIdWithRole2(id: string) {
  //   return await this.repository.findOne({
  //     where: { id },
  //     relations: { roles: true },
  //     select: {
  //       id: true,
  //       email: true,
  //       roles: {
  //         id: true,
  //         name: true,
  //       },
  //     }
  //   })
  // }

  findAndCount(options: FindManyOptions<User>): Promise<[User[], number]> {
    return this.repository.findAndCount(options);
  }

  findUserWithRolesAndPermissions(userId: User['id']): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role', 'role.deleted_at IS NULL')
      .leftJoinAndSelect(
        'role.permissions',
        'permission',
        'permission.deleted_at IS NULL',
      )
      .select([
        'user.id',
        'user.email',
        'role.id',
        'role.name',
        'permission.id',
        'permission.name',
      ])
      .where('user.id = :userId', { userId })
      .getOne();
  }

  create(data: Partial<User>): User {
    return this.repository.create(data);
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete({ id });
  }

  me(id: string): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'approved'],
    });
  }
}
