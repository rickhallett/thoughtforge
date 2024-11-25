import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const defaultUsers = [
  {
    name: 'Richard Hallett',
    email: 'rickhallett@icloud.com',
    password: 'admin123', // Will be hashed
    role: UserRole.ADMIN,
  },
  {
    name: 'Richard Hallett',
    email: 'rickhallett@icloud.com',
    password: 'editor123', // Will be hashed
    role: UserRole.EDITOR,
  },
  {
    name: 'Richard Hallett',
    email: 'rickhallett@icloud.com',
    password: 'user123', // Will be hashed
    role: UserRole.USER,
  },
] as const;

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function seedUsers() {
  console.log('Seeding default users...');

  for (const user of defaultUsers) {
    const hashedPassword = await hashPassword(user.password);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  console.log('Default users seeded successfully!');
}

export async function seed() {
  try {
    await seedUsers();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
