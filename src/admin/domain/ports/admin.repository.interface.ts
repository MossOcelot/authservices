import { User } from '../../../users/domain/user.entity';

export interface IAdminRepository {
  findById(id: string): Promise<User | null>;
  findByIdIncludingDeleted(id: string): Promise<User | null>;
  approveUser(userId: string): Promise<void>;
  softDeleteUser(userId: string): Promise<void>;
  hardDeleteUser(userId: string): Promise<void>;
}

export const ADMIN_REPOSITORY = Symbol('IAdminRepository');
