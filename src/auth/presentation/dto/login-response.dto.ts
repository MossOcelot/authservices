import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  approved: boolean;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string | null;
}
