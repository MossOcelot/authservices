import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PermissionUpdateAction } from './update-permission-in-role.dto';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'moderator', type: 'string' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Moderator role', type: 'string' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], example: ['perm-uuid-1', 'perm-uuid-2'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];

  @ApiPropertyOptional({ enum: PermissionUpdateAction, default: PermissionUpdateAction.REPLACE })
  @IsOptional()
  @IsEnum(PermissionUpdateAction)
  permissionAction?: PermissionUpdateAction;
}
