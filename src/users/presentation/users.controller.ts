import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { AddRoleToUserDto } from './dto/add-role-to-user.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';
import { User } from '../domain/user.entity';
import { PaginationMeta } from '../../common/utils/pagination.util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findUserAll(
    @Query() query: FindUsersQueryDto,
  ): Promise<{ data: User[]; meta: PaginationMeta }> {
    return this.usersService.findUserAll(query);
  }

  @Get(':id')
  getUserById(@Param('id') id: User['id']): Promise<User | null> {
    return this.usersService.findById(id);
  }

  @Get(':id/with-roles-and-permissions')
  getUserByIdWithRolesAndPermissions(
    @Param('id') id: User['id'],
  ): Promise<User | null> {
    return this.usersService.findByIdWithRolesAndPermissions(id);
  }

  @Post(':id/roles')
  addRoleToUser(
    @Param('id') id: User['id'],
    @Body() dto: AddRoleToUserDto,
  ): Promise<User> {
    return this.usersService.addRoleToUser(id, dto.roleId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: User['id']): Promise<void> {
    return this.usersService.remove(id);
  }
}
