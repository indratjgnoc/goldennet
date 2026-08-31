import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CoverageRequest {
  area?: string;
  address?: string;
}

/**
 * @swagger
 * /api/coverage:
 *   get:
 *     summary: Mengambil daftar area coverage
 *     tags:
 *       - Coverage
 *     responses:
 *       200:
 *         description: Data coverage berhasil diambil
 *       500:
 *         description: Gagal mengambil data coverage
 *
 *   post:
 *     summary: Memeriksa ketersediaan coverage
 *     tags:
 *       - Coverage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - area
 *               - address
 *             properties:
 *               area:
 *                 type: string
 *                 example: Biaro
 *               address:
 *                 type: string
 *                 example: Jl. Contoh No. 123, Biaro
 *     responses:
 *       200:
 *         description: Hasil pengecekan coverage
 *       400:
 *         description: Data tidak lengkap atau format request tidak valid
 *       500:
 *         description: Gagal melakukan pengecekan coverage
 */

/**
 * GET /api/coverage
 *
 * Mengambil semua area coverage yang aktif
 * dan hanya dari branch yang aktif.
 */
export async function GET() {
  try {
    const coverageAreas =
      await prisma.coverageArea.findMany({
        where: {
          isActive: true,
          branch: {
            isActive: true,
          },
        },
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          name: true,
          description: true,
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              address: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      message: 'Data coverage berhasil diambil.',
      data: coverageAreas,
    });
  } catch (error) {
    console.error(
      'GET /api/coverage error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data coverage.',
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * POST /api/coverage
 *
 * Mengecek apakah suatu area tersedia
 * berdasarkan data coverage di database.
 */
export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CoverageRequest;

    const area = body.area?.trim();
    const address = body.address?.trim();

    if (!area || !address) {
      return NextResponse.json(
        {
          success: false,
          message: 'Area dan alamat wajib diisi.',
        },
        {
          status: 400,
        },
      );
    }

    const coverageArea =
      await prisma.coverageArea.findFirst({
        where: {
          name: {
            equals: area,
          },
          isActive: true,
          branch: {
            isActive: true,
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              address: true,
            },
          },
        },
      });

    const isAvailable = !!coverageArea;

    return NextResponse.json({
      success: true,
      data: {
        available: isAvailable,
        area,
        address,
        coverage: coverageArea,
        message: isAvailable
          ? 'Jaringan Golden Net tersedia di area tersebut.'
          : 'Coverage belum tersedia di area tersebut.',
      },
    });
  } catch (error) {
    console.error(
      'POST /api/coverage error:',
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: 'Gagal melakukan pengecekan coverage.',
      },
      {
        status: 500,
      },
    );
  }
}
