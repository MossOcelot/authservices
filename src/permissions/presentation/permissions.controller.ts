import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PermissionsService } from '../application/permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { FindPermissionsQueryDto } from './dto/find-permissions-query.dto';
import { Permission } from '../domain/permission.entity';
import { PaginationMeta } from '../../common/utils/pagination.util';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll(
    @Query() query: FindPermissionsQueryDto,
  ): Promise<{ data: Permission[]; meta: PaginationMeta }> {
    return this.permissionsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: Permission['id']): Promise<Permission | null> {
    return this.permissionsService.findById(id);
  }

  @Post()
  createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @Patch(':id')
  updatePermission(
    @Param('id') id: Permission['id'],
    @Body() dto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionsService.updatePermission(id, dto);
  }

  @Patch(':id/remove')
  remove(@Param('id') id: Permission['id']): Promise<void> {
    return this.permissionsService.remove(id);
  }
}
