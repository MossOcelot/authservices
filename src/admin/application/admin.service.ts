import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADMIN_REPOSITORY } from '../domain/ports/admin.repository.interface';
import type { IAdminRepository } from '../domain/ports/admin.repository.interface';
import { UsersService } from '../../users/application/users.service';
import { CreateUserDto } from '../../users/presentation/dto/create-user.dto';
import { UpdateUserDto } from '../../users/presentation/dto/update-user.dto';
import { User } from '../../users/domain/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
    private readonly usersService: UsersService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(dto);
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<User> {
    return this.usersService.updateUser(userId, dto);
  }

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
