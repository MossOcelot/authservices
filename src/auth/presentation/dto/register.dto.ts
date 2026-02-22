import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', type: 'string' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', type: 'string' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John', type: 'string' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', type: 'string' })
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
    description: 'Optional list of role UUIDs to assign on registration',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  roleIds?: string[];
}
