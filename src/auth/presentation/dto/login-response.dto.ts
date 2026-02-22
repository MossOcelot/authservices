import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  accessToken: string;
}
