import { User } from '../../../users/domain/user.entity';

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;
  updateUserAuthFields(
    userId: string,
    fields: { isActive?: boolean; lastLogin?: Date | null },
  ): Promise<void>;
}

export const AUTH_REPOSITORY = Symbol('IAuthRepository');
