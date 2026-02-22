import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/domain/user.entity';
import { AuthEmailLoginDto } from '../presentation/dto/auth-email-login.dto';
import { LoginResponseDto } from '../presentation/dto/login-response.dto';
import { RegisterDto } from '../presentation/dto/register.dto';
import { AUTH_REPOSITORY } from '../domain/ports/auth.repository.interface';
import type { IAuthRepository } from '../domain/ports/auth.repository.interface';
import { HashService } from '../../common/services/hash.service';
import { UsersService } from '../../users/application/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    return this.usersService.createUser(registerDto);
  }

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.authRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { email: 'notFound' },
      });
    }

    const isPasswordValid = await this.hashService.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { password: 'invalidPassword' },
      });
    }

    await this.authRepository.updateUserAuthFields(user.id, {
      isActive: true,
      lastLogin: new Date(),
    });

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { email: user.email, accessToken };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: { userId: 'userNotFound' },
      });
    }

    if (!user.isActive) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: { userId: 'notLoggedIn' },
      });
    }

    await this.authRepository.updateUserAuthFields(userId, {
      isActive: false,
    });
  }
}
