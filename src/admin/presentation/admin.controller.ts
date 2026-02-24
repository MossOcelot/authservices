import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AdminService } from '../application/admin.service';
import { CreateUserDto } from '../../users/presentation/dto/create-user.dto';
import { UpdateUserDto } from '../../users/presentation/dto/update-user.dto';
import { User } from '../../users/domain/user.entity';

@Controller('admin/users')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createUser(@Body() dto: CreateUserDto): Promise<User> {
    return this.adminService.createUser(dto);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.adminService.updateUser(id, dto);
  }

  @Patch(':id/approve')
  approveUser(@Param('id') id: string): Promise<void> {
    return this.adminService.approveUser(id);
  }

  @Patch(':id/remove')
  softDeleteUser(@Param('id') id: string): Promise<void> {
    return this.adminService.softDeleteUser(id);
  }

  @Delete(':id/remove')
  hardDeleteUser(@Param('id') id: string): Promise<void> {
    return this.adminService.hardDeleteUser(id);
  }
}
