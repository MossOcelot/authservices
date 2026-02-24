import {
  Body,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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

  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    const user = await this.usersService.createUser(registerDto);
    
    const userInfo = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      approved: user.approved,
    }

    const accessToken = await this.jwtService.signAsync(userInfo, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(userInfo, { expiresIn: '7d' });
  
    return { accessToken, refreshToken };
  }

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.authRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        errors: 'invalid username or password',
      });
    }

    const isPasswordValid = await this.hashService.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        errors: 'invalid username or password',
      });
    }

    await this.authRepository.updateUserAuthFields(user.id, {
      isActive: true,
      lastLogin: new Date(),
    });

    const userInfo = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      approved: user.approved,
    }

    const accessToken = await this.jwtService.signAsync(userInfo);

    
    return { accessToken, refreshToken: null   };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        errors: { userId: 'User not Found' },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        errors: { userId: 'notLoggedIn' },
      });
    }

    await this.authRepository.updateUserAuthFields(userId, {
      isActive: false,
    });
  }

  async refresh(token: string): Promise<LoginResponseDto['accessToken']> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: { userId: 'User not Found' },
        });
      }

      const userInfo = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        approved: user.approved,
      };

      const accessToken = await this.jwtService.signAsync(userInfo, { expiresIn: '15m' });
      return accessToken;
    } catch (error) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        errors: 'Invalid refresh token',
      });
    }
  }
}
