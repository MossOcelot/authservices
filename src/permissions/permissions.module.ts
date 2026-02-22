import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './presentation/permissions.controller';
import { PermissionsService } from './application/permissions.service';
import { PermissionsRepository } from './infrastructure/permissions.repository';
import { Permission } from './domain/permission.entity';
import { PERMISSIONS_REPOSITORY } from './domain/ports/permissions.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    { provide: PERMISSIONS_REPOSITORY, useClass: PermissionsRepository },
  ],
  exports: [PermissionsService],
})
export class PermissionsModule {}
