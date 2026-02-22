import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsUUID } from 'class-validator';

export enum PermissionUpdateAction {
  ADD = 'add',
  REMOVE = 'remove',
  REPLACE = 'replace',
}

export class UpdatePermissionInRoleDto {
  @ApiProperty({ enum: PermissionUpdateAction, example: PermissionUpdateAction.ADD })
  @IsEnum(PermissionUpdateAction)
  action: PermissionUpdateAction;

  @ApiProperty({ type: [String], example: ['perm-uuid-1', 'perm-uuid-2'] })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
