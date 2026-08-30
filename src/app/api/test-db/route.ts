import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Database Golden Net berhasil terhubung.',
      data: branches,
    });
  } catch (error) {
    console.error('DATABASE ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Gagal terhubung ke database.',
      },
      { status: 500 },
    );
  }
}