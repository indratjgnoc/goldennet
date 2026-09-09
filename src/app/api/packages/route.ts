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
      id: item.id,
      name: item.name,
      code: item.code,
      speed: item.speed,
      price: Number(item.price),
      description: item.description,
      isPopular: item.isPopular,
    }));

    return NextResponse.json(
      {
        success: true,
        message:
          'Data paket berhasil diambil.',
        data,
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'public, max-age=60, s-maxage=60',
        },
      },
    );
  } catch (error) {
    console.error(
      'GET /api/packages error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          'Gagal mengambil data paket.',
        data: null,
      },
      {
        status: 500,
      },
    );
  }
}