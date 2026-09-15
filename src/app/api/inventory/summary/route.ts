import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Kamu tidak memiliki akses ke inventory.',
        },
        { status: 403 },
      );
    }

    const [
      totalItems,
      activeItems,
      totalCategories,
      activeCategories,
      totalSuppliers,
      activeSuppliers,
      totalStockIns,
      totalStockOuts,
      totalInstallations,
      lowStockItems,
      outOfStockItems,
      recentStockIns,
      recentStockOuts,
      recentInstallations,
    ] = await Promise.all([
      prisma.inventoryItem.count(),

      prisma.inventoryItem.count({
        where: {
          isActive: true,
        },
      }),

      prisma.inventoryCategory.count(),

      prisma.inventoryCategory.count({
        where: {
          isActive: true,
        },
      }),

      prisma.inventorySupplier.count(),

      prisma.inventorySupplier.count({
        where: {
          isActive: true,
        },
      }),

      prisma.stockIn.count(),

      prisma.stockOut.count(),

      prisma.installation.count(),

      prisma.inventoryItem.count({
        where: {
          isActive: true,
          stock: {
            lte: prisma.inventoryItem.fields.minimumStock,
          },
        },
      }),

      prisma.inventoryItem.count({
        where: {
          isActive: true,
          stock: 0,
        },
      }),

      prisma.stockIn.findMany({
        take: 5,
        orderBy: {
          transactionDate: 'desc',
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          receivedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),

      prisma.stockOut.findMany({
        take: 5,
        orderBy: {
          transactionDate: 'desc',
        },
        include: {
          issuedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),

      prisma.installation.findMany({
        take: 5,
        orderBy: {
          installationDate: 'desc',
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
    ]);

    const serializeDate = (date: Date) => date.toISOString();

    return NextResponse.json(
      {
        success: true,

        data: {
          stats: {
            totalItems,
            activeItems,
            totalCategories,
            activeCategories,
            totalSuppliers,
            activeSuppliers,
            totalStockIns,
            totalStockOuts,
            totalInstallations,
            lowStockItems,
            outOfStockItems,
          },

          recent: {
            stockIns: recentStockIns.map((transaction) => ({
              id: transaction.id,
              transactionCode: transaction.transactionCode,
              transactionDate: serializeDate(transaction.transactionDate),
              supplier: transaction.supplier,
              receivedBy: transaction.receivedBy,
              itemCount: transaction._count.items,
            })),

            stockOuts: recentStockOuts.map((transaction) => ({
              id: transaction.id,
              transactionCode: transaction.transactionCode,
              transactionDate: serializeDate(transaction.transactionDate),
              purpose: transaction.purpose,
              issuedBy: transaction.issuedBy,
              technician: transaction.technician,
              itemCount: transaction._count.items,
            })),

            installations: recentInstallations.map((installation) => ({
              id: installation.id,
              installationCode: installation.installationCode,
              installationDate: serializeDate(installation.installationDate),
              customer: installation.customer,
              technician: installation.technician,
              itemCount: installation._count.items,
            })),
          },
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('GET /api/inventory/summary error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil ringkasan inventory.',
      },
      { status: 500 },
    );
  }
}