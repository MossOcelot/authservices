import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { AdminService } from '../application/admin.service';

@Controller('admin/users')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
