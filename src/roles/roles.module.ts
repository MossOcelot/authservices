import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './presentation/roles.controller';
import { RolesService } from './application/roles.service';
import { RolesRepository } from './infrastructure/roles.repository';
import { Role } from './domain/role.entity';
import { ROLES_REPOSITORY } from './domain/ports/roles.repository.interface';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), PermissionsModule],
  controllers: [RolesController],
  providers: [
    RolesService,
    { provide: ROLES_REPOSITORY, useClass: RolesRepository },
  ],
  exports: [RolesService],
})
export class RolesModule {}
