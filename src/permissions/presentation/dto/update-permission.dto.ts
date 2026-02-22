import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'users:write', type: 'string' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'users', type: 'string' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  resource?: string;

  @ApiPropertyOptional({ example: 'write', type: 'string' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  action?: string;

  @ApiPropertyOptional({ example: 'Can write users', type: 'string' })
  @IsOptional()
  @IsString()
  description?: string;
}
