import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { IAdminRepository } from '../domain/ports/admin.repository.interface';

@Injectable()
export class AdminRepository implements IAdminRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByIdIncludingDeleted(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id }, withDeleted: true });
  }

  async approveUser(userId: string): Promise<void> {
    await this.repository.update({ id: userId }, { approved: true });
  }

  async softDeleteUser(userId: string): Promise<void> {
    await this.repository.softDelete({ id: userId });
  }

  async hardDeleteUser(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('id = :id', { id: userId })
      .execute();
  }
}
