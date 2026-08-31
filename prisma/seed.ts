import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'goldennet',
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('');
  console.log('====================================');
  console.log('      GOLDEN NET DATABASE SEED');
  console.log('====================================');
  console.log('');

  const passwordHash = await bcrypt.hash(
    'GoldenNet@123',
    12,
  );

  const admin = await prisma.user.upsert({
    where: {
      username: 'superadmin',
    },

    update: {
      name: 'Super Administrator',
      email: 'admin@goldennet.id',
      passwordHash, 
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },

    create: {
      name: 'Super Administrator',
      username: 'superadmin',
      email: 'admin@goldennet.id',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('SUPER ADMIN berhasil dibuat');
  console.log('');
  console.log(`ID       : ${admin.id}`);
  console.log(`Username : ${admin.username}`);
  console.log(`Email    : ${admin.email}`);
  console.log(`Role     : ${admin.role}`);
  console.log('');
  console.log('Password : GoldenNet@123');
  console.log('');
  console.log('====================================');
  console.log('          SEED BERHASIL');
  console.log('====================================');
  console.log('');
}

main()
  .catch((error) => {
    console.error('');
    console.error('SEED GAGAL');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });