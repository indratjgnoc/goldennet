import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from '@prisma/client';

import bcrypt from 'bcryptjs';

const adapter = new PrismaMariaDb({
  host:
    process.env.DB_HOST ||
    '127.0.0.1',

  port: Number(
    process.env.DB_PORT || 3306,
  ),

  user:
    process.env.DB_USER ||
    'root',

  password:
    process.env.DB_PASSWORD ||
    '',

  database:
    process.env.DB_NAME ||
    'goldennet',

  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('');

  console.log(
    '====================================',
  );

  console.log(
    '       GOLDEN NET DATABASE SEED',
  );

  console.log(
    '====================================',
  );

  console.log('');

  // ==========================================
  // SUPER ADMIN
  // ==========================================

  const passwordHash =
    await bcrypt.hash(
      'GoldenNet@123',
      12,
    );

  const admin =
    await prisma.user.upsert({
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

  console.log(
    '✓ SUPER ADMIN berhasil dibuat',
  );

  console.log(
    `  ID       : ${admin.id}`,
  );

  console.log(
    `  Username : ${admin.username}`,
  );

  console.log(
    `  Role     : ${admin.role}`,
  );

  console.log('');

  // ==========================================
  // BRANCH
  // ==========================================

  const branch =
    await prisma.branch.upsert({
      where: {
        code: 'GNET-BKR',
      },

      update: {
        name: 'Golden Net Bukittinggi',
        address:
          'Bukittinggi, Sumatera Barat',
        phone: null,
        email: 'info@goldennet.id',
        isActive: true,
      },

      create: {
        name: 'Golden Net Bukittinggi',
        code: 'GNET-BKR',
        address:
          'Bukittinggi, Sumatera Barat',
        phone: null,
        email: 'info@goldennet.id',
        isActive: true,
      },
    });

  console.log(
    '✓ Branch berhasil dibuat',
  );

  console.log(
    `  ${branch.name} (${branch.code})`,
  );

  console.log('');

  // ==========================================
  // INTERNET PACKAGES
  // ==========================================

  const packages = [
    {
      name: 'GNET Home 10',
      code: 'GNET-10',
      speed: 10,
      price: 100000,
      description:
        'Paket internet 10 Mbps untuk kebutuhan rumah tangga.',
      isPopular: false,
    },

    {
      name: 'GNET Home 20',
      code: 'GNET-20',
      speed: 20,
      price: 150000,
      description:
        'Paket internet 20 Mbps untuk keluarga dan aktivitas harian.',
      isPopular: true,
    },

    {
      name: 'GNET Home 30',
      code: 'GNET-30',
      speed: 30,
      price: 200000,
      description:
        'Paket internet 30 Mbps untuk streaming, belajar, dan bekerja.',
      isPopular: false,
    },

    {
      name: 'GNET Home 50',
      code: 'GNET-50',
      speed: 50,
      price: 275000,
      description:
        'Paket internet 50 Mbps untuk kebutuhan koneksi lebih tinggi.',
      isPopular: false,
    },

    {
      name: 'GNET Home 100',
      code: 'GNET-100',
      speed: 100,
      price: 400000,
      description:
        'Paket internet 100 Mbps untuk kebutuhan rumah dan bisnis.',
      isPopular: false,
    },
  ];

  for (const item of packages) {
    await prisma.internetPackage.upsert({
      where: {
        code: item.code,
      },

      update: {
        name: item.name,
        speed: item.speed,
        price: item.price,
        description:
          item.description,
        isPopular:
          item.isPopular,
        isActive: true,
      },

      create: {
        name: item.name,
        code: item.code,
        speed: item.speed,
        price: item.price,
        description:
          item.description,
        isPopular:
          item.isPopular,
        isActive: true,
      },
    });
  }

  console.log(
    `✓ ${packages.length} paket internet berhasil dibuat`,
  );

  console.log('');

  // ==========================================
  // COVERAGE AREAS
  // ==========================================

  const coverageAreas = [
    {
      name: 'Biaro',
      description:
        'Area layanan Golden Net di wilayah Biaro.',
    },

    {
      name: 'Bukittinggi',
      description:
        'Area layanan Golden Net di wilayah Bukittinggi.',
    },

    {
      name: 'Banuhampu',
      description:
        'Area layanan Golden Net di wilayah Banuhampu.',
    },

    {
      name: 'Ampek Angkek',
      description:
        'Area layanan Golden Net di wilayah Ampek Angkek.',
    },

    {
      name: 'Tilatang Kamang',
      description:
        'Area layanan Golden Net di wilayah Tilatang Kamang.',
    },
  ];

  for (const item of coverageAreas) {
    await prisma.coverageArea.upsert({
      where: {
        branchId_name: {
          branchId: branch.id,
          name: item.name,
        },
      },

      update: {
        description:
          item.description,
        isActive: true,
      },

      create: {
        name: item.name,
        description:
          item.description,
        isActive: true,
        branchId: branch.id,
      },
    });
  }

  console.log(
    `✓ ${coverageAreas.length} area coverage berhasil dibuat`,
  );

  console.log('');

  console.log(
    '====================================',
  );

  console.log(
    '          SEED BERHASIL',
  );

  console.log(
    '====================================',
  );

  console.log('');

  console.log(
    'Master data:',
  );

  console.log(
    `  Branch   : 1`,
  );

  console.log(
    `  Paket    : ${packages.length}`,
  );

  console.log(
    `  Coverage : ${coverageAreas.length}`,
  );

  console.log('');
}

main()
  .catch((error) => {
    console.error('');

    console.error(
      'SEED GAGAL',
    );

    console.error(error);

    process.exit(1);
  })

  .finally(async () => {
    await prisma.$disconnect();
  });