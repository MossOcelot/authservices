import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './presentation/auth.controller';
import { AuthService } from './application/auth.service';
import { AuthRepository } from './infrastructure/auth.repository';
import { User } from '../users/domain/user.entity';
import { AUTH_REPOSITORY } from './domain/ports/auth.repository.interface';
import { HashService } from '../common/services/hash.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.getOrThrow<StringValue>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    HashService,
    { provide: AUTH_REPOSITORY, useClass: AuthRepository },
  ],
})
export class AuthModule {}
