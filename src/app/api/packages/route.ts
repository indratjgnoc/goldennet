import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const packages =
      await prisma.internetPackage.findMany({
        where: {
          isActive: true,
        },
        orderBy: [
          {
            isPopular: 'desc',
          },
          {
            speed: 'asc',
          },
        ],
        select: {
          id: true,
          name: true,
          code: true,
          speed: true,
          price: true,
          description: true,
          isPopular: true,
        },
      });

    const data = packages.map((item) => ({
      ...item,
      price: Number(item.price),
    }));

    return NextResponse.json({
      success: true,
      message: 'Data paket berhasil diambil.',
      data,
    });
  } catch (error) {
    console.error(
      'GET /api/packages error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data paket.',
      },
      {
        status: 500,
      },
    );
  }
}