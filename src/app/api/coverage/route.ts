import { NextResponse } from 'next/server';

interface CoverageRequest {
  area?: string;
  address?: string;
}

/**
 * @swagger
 * /api/coverage:
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
 *         description: Data tidak lengkap
 */

export async function POST(
  request: Request,
) {
  try {
    const body =
      (await request.json()) as CoverageRequest;

    const area = body.area?.trim();
    const address = body.address?.trim();

    if (!area || !address) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Area dan alamat wajib diisi.',
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Sementara:
     * Biaro dan Bukittinggi dianggap tersedia.
     *
     * Nanti diganti dengan pengecekan database
     * berdasarkan ODP / ODC / titik jaringan.
     */

    const availableAreas = [
      'Biaro',
      'Bukittinggi',
    ];

    const isAvailable =
      availableAreas.includes(area);

    return NextResponse.json({
      success: true,
      data: {
        available: isAvailable,
        area,
        address,
        message: isAvailable
          ? 'Jaringan Golden Net tersedia di area tersebut.'
          : 'Coverage belum tersedia di area tersebut.',
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          'Format request tidak valid.',
      },
      {
        status: 400,
      },
    );
  }
}