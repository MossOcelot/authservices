import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { IAuthRepository } from '../domain/ports/auth.repository.interface';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      select: ['id', 'email', 'firstName', 'lastName', 'approved', 'password'],
    });
  }

  async updateUserAuthFields(
    userId: string,
    fields: { isActive?: boolean; lastLogin?: Date | null },
  ): Promise<void> {
    await this.repository.update({ id: userId }, fields);
  }
}
