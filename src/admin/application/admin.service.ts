import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADMIN_REPOSITORY } from '../domain/ports/admin.repository.interface';
import type { IAdminRepository } from '../domain/ports/admin.repository.interface';

@Injectable()
export class AdminService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
  ) {}

  async approveUser(userId: string): Promise<void> {
    const user = await this.adminRepository.findById(userId);
    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: { userId: 'userNotFound' },
      });
    }
    await this.adminRepository.approveUser(userId);
  }

  async softDeleteUser(userId: string): Promise<void> {
    const user = await this.adminRepository.findById(userId);
    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: { userId: 'userNotFound' },
      });
    }
    await this.adminRepository.softDeleteUser(userId);
  }

  async hardDeleteUser(userId: string): Promise<void> {
    const user = await this.adminRepository.findByIdIncludingDeleted(userId);
    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: { userId: 'userNotFound' },
      });
    }
    await this.adminRepository.hardDeleteUser(userId);
  }
}
