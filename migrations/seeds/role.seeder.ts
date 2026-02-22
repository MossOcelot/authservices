import { DataSource, In, Repository } from 'typeorm';
import { Role } from '../../src/roles/domain/role.entity';
import { Permission } from '../../src/permissions/domain/permission.entity';

interface RoleSeedData {
  name: string;
  description: string;
  permissions: string[];
}

const ROLES: RoleSeedData[] = [
  {
    name: 'admin',
    description: 'Full access to all resources',
    permissions: [
      'users:create',
      'users:read',
      'users:update',
      'users:delete',
      'roles:create',
      'roles:read',
      'roles:update',
      'roles:delete',
      'permissions:create',
      'permissions:read',
      'permissions:update',
      'permissions:delete',
    ],
  },
  {
    name: 'moderator',
    description: 'Read access to all resources',
    permissions: ['users:read', 'roles:read', 'permissions:read'],
  },
  {
    name: 'user',
    description: 'Basic user access',
    permissions: ['users:read'],
  },
];

export class RoleSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const roleRepo: Repository<Role> = dataSource.getRepository(Role);
    const permissionRepo: Repository<Permission> =
      dataSource.getRepository(Permission);

    for (const data of ROLES) {
      const permissions = await permissionRepo.findBy({
        name: In(data.permissions),
      });

      const existing = await roleRepo.findOne({
        where: { name: data.name },
        relations: ['permissions'],
      });

      if (!existing) {
        await roleRepo.save(
          roleRepo.create({
            name: data.name,
            description: data.description,
            permissions,
          }),
        );
        console.log(`  [Role] created: ${data.name}`);
      } else {
        // Re-sync permissions in case they changed
        existing.permissions = permissions;
        await roleRepo.save(existing);
        console.log(`  [Role] updated permissions: ${data.name}`);
      }
    }
  }
}
