import { FindManyOptions } from 'typeorm';
import { User } from '../user.entity';

export interface IUsersRepository {
  findOneByEmail(email: string): Promise<User | null>;
  findOneById(id: string): Promise<User | null>;
  findOneByIdWithRoles(id: string): Promise<User | null>;
  findAndCount(options: FindManyOptions<User>): Promise<[User[], number]>;
  findUserWithRolesAndPermissions(userId: User['id']): Promise<User | null>;
  create(data: Partial<User>): User;
  save(user: User): Promise<User>;
  softDelete(id: string): Promise<void>;
}

export const USERS_REPOSITORY = Symbol('IUsersRepository');
