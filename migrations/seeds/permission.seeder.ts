import { DataSource, Repository } from 'typeorm';
import { Permission } from '../../src/permissions/domain/permission.entity';

interface PermissionSeedData {
  name: string;
  resource: string;
  action: string;
  description: string;
}

const PERMISSIONS: PermissionSeedData[] = [
  {
    name: 'users:create',
    resource: 'users',
    action: 'create',
    description: 'Create a new user',
  },
  {
    name: 'users:read',
    resource: 'users',
    action: 'read',
    description: 'Read user data',
  },
  {
    name: 'users:update',
    resource: 'users',
    action: 'update',
    description: 'Update an existing user',
  },
  {
    name: 'users:delete',
    resource: 'users',
    action: 'delete',
    description: 'Delete a user',
  },
  {
    name: 'roles:create',
    resource: 'roles',
    action: 'create',
    description: 'Create a new role',
  },
  {
    name: 'roles:read',
    resource: 'roles',
    action: 'read',
    description: 'Read role data',
  },
  {
    name: 'roles:update',
    resource: 'roles',
    action: 'update',
    description: 'Update an existing role',
  },
  {
    name: 'roles:delete',
    resource: 'roles',
    action: 'delete',
    description: 'Delete a role',
  },
  {
    name: 'permissions:create',
    resource: 'permissions',
    action: 'create',
    description: 'Create a new permission',
  },
  {
    name: 'permissions:read',
    resource: 'permissions',
    action: 'read',
    description: 'Read permission data',
  },
  {
    name: 'permissions:update',
    resource: 'permissions',
    action: 'update',
    description: 'Update an existing permission',
  },
  {
    name: 'permissions:delete',
    resource: 'permissions',
    action: 'delete',
    description: 'Delete a permission',
  },
];

export class PermissionSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo: Repository<Permission> = dataSource.getRepository(Permission);

    for (const data of PERMISSIONS) {
      const existing = await repo.findOneBy({ name: data.name });

      if (!existing) {
        await repo.save(repo.create(data));
        console.log(`  [Permission] created: ${data.name}`);
      } else {
        console.log(`  [Permission] skipped (exists): ${data.name}`);
      }
    }
  }
}
