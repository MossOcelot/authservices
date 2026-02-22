import * as bcrypt from 'bcryptjs';
import { DataSource, In, Repository } from 'typeorm';
import { User } from '../../src/users/domain/user.entity';
import { Role } from '../../src/roles/domain/role.entity';

interface UserSeedData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
}

const USERS: UserSeedData[] = [
  {
    email: 'admin@example.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
    roles: ['admin'],
  },
  {
    email: 'moderator@example.com',
    password: 'Moderator123!',
    firstName: 'Moderator',
    lastName: 'User',
    isActive: true,
    roles: ['moderator'],
  },
  {
    email: 'user@example.com',
    password: 'User123!',
    firstName: 'Regular',
    lastName: 'User',
    isActive: true,
    roles: ['user'],
  },
];

export class UserSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepo: Repository<User> = dataSource.getRepository(User);
    const roleRepo: Repository<Role> = dataSource.getRepository(Role);

    for (const data of USERS) {
      const existing = await userRepo.findOneBy({ email: data.email });

      if (!existing) {
        const roles = await roleRepo.findBy({ name: In(data.roles) });
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(data.password, salt);

        await userRepo.save(
          userRepo.create({
            email: data.email,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            isActive: data.isActive,
            roles,
          }),
        );

        console.log(`  [User] created: ${data.email}`);
      } else {
        console.log(`  [User] skipped (exists): ${data.email}`);
      }
    }
  }
}
