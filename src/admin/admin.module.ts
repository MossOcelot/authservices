import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/domain/user.entity';
import { UsersModule } from '../users/users.module';
import { AdminController } from './presentation/admin.controller';
import { AdminService } from './application/admin.service';
import { AdminRepository } from './infrastructure/admin.repository';
import { ADMIN_REPOSITORY } from './domain/ports/admin.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    { provide: ADMIN_REPOSITORY, useClass: AdminRepository },
  ],
})
export class AdminModule {}
