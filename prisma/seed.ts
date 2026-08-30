import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'goldennet',
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('====================================');
  console.log('   GOLDEN NET DATABASE SEED');
  console.log('====================================');

  // ==========================================
  // 1. BRANCH PUSAT
  // ==========================================

  const biaro = await prisma.branch.upsert({
    where: {
      code: 'GNET-BIARO',
    },

    update: {
      name: 'Golden Net Biaro',
      address: 'Biaro, Bukittinggi, Sumatera Barat',
      isActive: true,
    },

    create: {
      name: 'Golden Net Biaro',
      code: 'GNET-BIARO',
      address: 'Biaro, Bukittinggi, Sumatera Barat',
      isActive: true,
    },
  });

  console.log(`✓ Branch: ${biaro.name}`);

  // ==========================================
  // 2. PAKET INTERNET
  // ==========================================
  //
  // DATA INI MASIH DATA CONTOH UNTUK DEVELOPMENT.
  // Ganti dengan data resmi Golden Net sebelum production.
  //

  const packages = [
    {
      name: 'Golden Net 10 Mbps',
      code: 'GNET-10',
      speed: 10,
      price: 150000,
      description: 'Paket internet 10 Mbps.',
      isPopular: false,
    },

    {
      name: 'Golden Net 20 Mbps',
      code: 'GNET-20',
      speed: 20,
      price: 200000,
      description: 'Paket internet 20 Mbps.',
      isPopular: true,
    },

    {
      name: 'Golden Net 50 Mbps',
      code: 'GNET-50',
      speed: 50,
      price: 300000,
      description: 'Paket internet 50 Mbps.',
      isPopular: false,
    },
  ];

  for (const item of packages) {
    const internetPackage =
      await prisma.internetPackage.upsert({
        where: {
          code: item.code,
        },

        update: {
          name: item.name,
          speed: item.speed,
          price: item.price,
          description: item.description,
          isPopular: item.isPopular,
          isActive: true,
        },

        create: {
          name: item.name,
          code: item.code,
          speed: item.speed,
          price: item.price,
          description: item.description,
          isPopular: item.isPopular,
          isActive: true,
        },
      });

    console.log(
      `✓ Package: ${internetPackage.name}`,
    );
  }

  // ==========================================
  // 3. COVERAGE AREA
  // ==========================================

  const coverageAreas = [
    {
      name: 'Biaro',
      description:
        'Area layanan Golden Net Biaro.',
    },

    {
      name: 'Bukittinggi',
      description:
        'Area layanan Golden Net Bukittinggi.',
    },
  ];

  for (const area of coverageAreas) {
    const existingCoverage =
      await prisma.coverageArea.findFirst({
        where: {
          branchId: biaro.id,
          name: area.name,
        },
      });

    const coverage = existingCoverage
      ? await prisma.coverageArea.update({
          where: { id: existingCoverage.id },
          data: {
            name: area.name,
            description: area.description,
            isActive: true,
          },
        })
      : await prisma.coverageArea.create({
          data: {
            name: area.name,
            description: area.description,
            branchId: biaro.id,
            isActive: true,
          },
        });

    console.log(
      `✓ Coverage: ${coverage.name}`,
    );
  }

  console.log('');
  console.log('====================================');
  console.log('   SEED GOLDEN NET BERHASIL');
  console.log('====================================');
}

main()
  .catch((error) => {
    console.error('');
    console.error('❌ SEED GAGAL');
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });