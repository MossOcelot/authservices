import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../../src/users/domain/user.entity';
import { Role } from '../../src/roles/domain/role.entity';
import { Permission } from '../../src/permissions/domain/permission.entity';
import { PermissionSeeder } from './permission.seeder';
import { RoleSeeder } from './role.seeder';
import { UserSeeder } from './user.seeder';

dotenv.config();

const seedDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'myuser',
  password: process.env.DATABASE_PASSWORD || 'mypassword',
  database: process.env.DATABASE_NAME || 'authdb',
  // Explicit imports — no glob to avoid path resolution issues in ts-node
  entities: [User, Role, Permission],
  synchronize: false,
});

async function runSeeders(): Promise<void> {
  await seedDataSource.initialize();
  console.log('Database connected\n');

  try {
    console.log('Running PermissionSeeder...');
    await new PermissionSeeder().run(seedDataSource);

    console.log('\nRunning RoleSeeder...');
    await new RoleSeeder().run(seedDataSource);

    console.log('\nRunning UserSeeder...');
    await new UserSeeder().run(seedDataSource);

    console.log('\nAll seeders completed successfully.');
  } catch (err) {
    console.error('Seeder error:', err);
    throw err;
  } finally {
    await seedDataSource.destroy();
  }
}

runSeeders().catch(() => process.exit(1));
