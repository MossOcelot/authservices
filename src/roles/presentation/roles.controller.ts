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
  Put,
  Query,
} from '@nestjs/common';
import { RolesService } from '../application/roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdatePermissionInRoleDto } from './dto/update-permission-in-role.dto';
import { FindRolesQueryDto } from './dto/find-roles-query.dto';
import { Role } from '../domain/role.entity';
import { PaginationMeta } from '../../common/utils/pagination.util';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(
    @Query() query: FindRolesQueryDto,
  ): Promise<{ data: Role[]; meta: PaginationMeta }> {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: Role['id']): Promise<Role | null> {
    return this.rolesService.findById(id);
  }

  @Post()
  createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.createRole(createRoleDto);
  }

  @Patch(':id')
  updateRole(
    @Param('id') id: Role['id'],
    @Body() dto: UpdateRoleDto,
  ): Promise<Role> {
    return this.rolesService.updateRole(id, dto);
  }

  @Put(':id/permissions')
  updatePermissionInRole(
    @Param('id') id: Role['id'],
    @Body() dto: UpdatePermissionInRoleDto,
  ): Promise<Role> {
    return this.rolesService.updatePermissionInRole(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: Role['id']): Promise<void> {
    return this.rolesService.remove(id);
  }
}
