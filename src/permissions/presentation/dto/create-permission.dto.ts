import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'users:read', type: 'string' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'users', type: 'string' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ example: 'read', type: 'string' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiPropertyOptional({ example: 'Can read users', type: 'string' })
  @IsOptional()
  @IsString()
  description?: string;
}
